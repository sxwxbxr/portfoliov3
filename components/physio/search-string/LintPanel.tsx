"use client"

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import { ssCopy } from "@/lib/physio/copy/search-string"
import {
  DATABASES,
  applyFix,
  autoFix,
  convertToCinahl,
  convertToCochrane,
  convertToEmbase,
  convertToPubmed,
  detectLintDatabase,
  lintQuery,
  type ConvertResult,
  type LintDatabase,
  type LintFinding,
} from "@/lib/physio/search-string"
import { physioPath } from "@/lib/physio/urls"
import { Disclosure } from "./Disclosure"
import { HighlightedText } from "./QueryView"

const t = ssCopy.lint
const x = ssCopy.databasesExtra

interface Props {
  /** Demo: the text is the shipped student string and cannot be typed over. */
  locked: boolean
  exampleString: string
  /** Current text, findings and the syntax that was checked, for the guided mode. */
  onStateChange?: (state: { text: string; findings: LintFinding[]; database: Exclude<LintDatabase, "auto"> }) => void
}

/** "Automatisch" and every database the engine can check. */
const SYNTAX_OPTIONS: LintDatabase[] = ["auto", ...DATABASES.filter((d) => d.available).map((d) => d.id as LintDatabase)]

function syntaxLabel(o: LintDatabase): string {
  if (o === "auto") return t.syntax.auto
  return x.lint.syntaxLabels[o] ?? DATABASES.find((d) => d.id === o)?.label ?? o
}

const BADGE: Record<LintFinding["severity"], string> = {
  error: "border-destructive bg-destructive font-medium text-destructive-foreground",
  warning: "border-fg bg-fg font-medium text-plate",
  info: "border-edge-mid text-fg-muted",
}

function snippet(text: string, f: LintFinding): string {
  const raw = text.slice(f.start, f.end).replace(/\s+/g, " ").trim()
  return raw.length > 36 ? `${raw.slice(0, 35)}…` : raw
}

/**
 * "Eigenen String prüfen": paste, press "Prüfen", read the summary and fix. Syntax and the
 * PubMed/Cochrane converter sit in "Mehr Optionen". After the first check the result follows the text.
 */
export function LintPanel({ locked, exampleString, onStateChange }: Props) {
  const [text, setText] = useState(locked ? exampleString : "")
  const [history, setHistory] = useState<string[]>([])
  const [message, setMessage] = useState("")
  const [database, setDatabase] = useState<LintDatabase>("auto")
  const [converted, setConverted] = useState<{ to: "cochrane" | "pubmed" | "cinahl" | "embase"; result: ConvertResult } | null>(null)
  const [checked, setChecked] = useState(false)
  const [checkRun, setCheckRun] = useState(0)
  const areaRef = useRef<HTMLTextAreaElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const focusResult = useRef(false)

  const effective = useMemo(() => (database === "auto" ? detectLintDatabase(text) : database), [database, text])
  const findings = useMemo(() => lintQuery(text, { database }), [text, database])
  useEffect(() => onStateChange?.({ text, findings, database: effective }), [text, findings, effective, onStateChange])
  const counts = useMemo(
    () => ({
      error: findings.filter((f) => f.severity === "error").length,
      warning: findings.filter((f) => f.severity === "warning").length,
      info: findings.filter((f) => f.severity === "info").length,
    }),
    [findings],
  )
  const fixable = findings.some((f) => f.fix)

  // "Prüfen" moves focus to the summary, so keyboard and screen reader users land on the result.
  useEffect(() => {
    if (focusResult.current && checked) {
      headingRef.current?.focus()
      focusResult.current = false
    }
  }, [checkRun, checked])

  function check(e: FormEvent) {
    e.preventDefault()
    focusResult.current = true
    setMessage("")
    setChecked(true)
    setCheckRun((n) => n + 1)
  }

  function change(next: string) {
    setHistory((h) => [...h, text].slice(-30))
    setText(next)
    setConverted(null)
  }

  function convert(to: "cochrane" | "pubmed" | "cinahl" | "embase") {
    const result = { cochrane: convertToCochrane, pubmed: convertToPubmed, cinahl: convertToCinahl, embase: convertToEmbase }[to](text)
    if (result.changed) {
      change(result.text)
      setDatabase("auto")
      setMessage(t.convert.converted)
      setChecked(true)
    } else {
      setMessage(t.convert.nothing)
    }
    setConverted({ to, result })
  }

  /** Demo: the corrected example string, written for the Cochrane Library. */
  function showExampleInCochrane() {
    const result = convertToCochrane(autoFix(exampleString).text)
    change(result.text)
    setDatabase("auto")
    setMessage(t.convert.converted)
    setChecked(true)
    setConverted({ to: "cochrane", result })
  }

  function fix(f: LintFinding) {
    if (!f.fix) return
    change(applyFix(text, f.fix))
    setMessage(`${f.fix.label}.`)
  }

  function fixAll() {
    const r = autoFix(text, 12, { database })
    if (!r.applied.length) {
      setMessage(t.fixAllNone)
      return
    }
    change(r.text)
    setMessage(t.fixAllDone(r.applied.length))
  }

  function undo() {
    const prev = history[history.length - 1]
    if (prev === undefined) return
    setHistory((h) => h.slice(0, -1))
    setText(prev)
    setMessage("")
    setConverted(null)
  }

  function goTo(f: LintFinding) {
    const el = areaRef.current
    if (!el) return
    el.focus()
    el.setSelectionRange(f.start, f.end)
  }

  const hasText = text.trim() !== ""
  const small = "control control-ghost inline-flex min-h-11 items-center px-3 text-sm"

  return (
    <div className="flex flex-col gap-6">
      <section aria-label={t.heading} className="cast p-4 md:p-7">
        <form onSubmit={check} className="flex flex-col gap-4" noValidate>
          <div className="flex flex-col gap-1.5">
            <div className="flex flex-wrap items-end justify-between gap-x-3 gap-y-1">
              <label htmlFor="ss-lint-input" className="text-base text-fg">
                {t.inputLabel}
              </label>
              <div className="-mr-3 flex flex-wrap items-center">
                {locked ? (
                  <button type="button" className={small} onClick={() => change(exampleString)} disabled={text === exampleString}>
                    {t.resetExample}
                  </button>
                ) : (
                  <>
                    <button type="button" className={small} onClick={() => change(exampleString)}>
                      {t.insertExample}
                    </button>
                    <button type="button" className={small} onClick={() => change("")} disabled={!text}>
                      {t.clear}
                    </button>
                  </>
                )}
                <button type="button" className={small} onClick={undo} disabled={history.length === 0}>
                  {t.undo}
                </button>
              </div>
            </div>
            <textarea
              id="ss-lint-input"
              ref={areaRef}
              value={text}
              readOnly={locked}
              onChange={(e) => setText(e.target.value)}
              rows={locked ? 6 : 7}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              placeholder={t.inputPlaceholder}
              aria-describedby={locked ? "ss-lint-locked" : undefined}
              className="field w-full resize-y px-4 py-3 font-mono text-base leading-relaxed md:text-[13px]"
            />
            {locked && (
              <p id="ss-lint-locked" className="text-sm text-fg-muted">
                {t.lockedBody}{" "}
                <Link href={physioPath("/abo")} className="text-fg underline underline-offset-4">
                  {ssCopy.demo.ctaPrimary}
                </Link>
              </p>
            )}
          </div>
          <div>
            <button type="submit" className="control control-primary min-h-12 w-full px-8 text-base sm:w-auto">
              {checked ? t.checkAgain : t.check}
            </button>
          </div>
        </form>
      </section>

      {checked && !hasText && (
        <div className="well flex flex-col gap-1 px-5 py-4" role="status">
          <p className="text-fg">{t.emptyTitle}</p>
          <p className="text-sm text-fg-muted">{t.emptyBody}</p>
        </div>
      )}

      {!checked && hasText && (
        <p className="text-sm text-fg-muted" role="status">
          {t.notChecked}
        </p>
      )}

      {checked && hasText && (
        <section aria-label={t.resultsLabel} className="cast flex flex-col gap-5 p-4 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <div className="flex min-w-0 flex-col gap-1">
              <h2 ref={headingRef} tabIndex={-1} className="headline outline-none focus-visible:underline focus-visible:decoration-signal focus-visible:underline-offset-4">
                {findings.length ? t.summary(counts.error, counts.warning, counts.info) : t.cleanTitle}
              </h2>
              {findings.length === 0 && <p className="measure text-sm text-fg-muted">{t.cleanBody}</p>}
            </div>
            {fixable && (
              <button type="button" className="control control-primary min-h-12 w-full px-6 text-base sm:w-auto" onClick={fixAll}>
                {t.fixAll}
              </button>
            )}
          </div>

          <p role="status" aria-live="polite" className="min-h-5 text-sm text-fg-muted">
            {message}
          </p>

          {findings.length > 0 && (
            <ul className="flex flex-col gap-3">
              {findings.map((f, i) => (
                <li key={`${f.code}-${f.start}-${i}`} className="well flex flex-col gap-3 p-4 md:p-5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className={`rounded-full border px-2.5 py-px text-xs ${BADGE[f.severity]}`}>{ssCopy.severity[f.severity]}</span>
                    <code className="font-mono text-xs text-fg-muted [overflow-wrap:anywhere]">{snippet(text, f)}</code>
                    {f.more && f.more.length > 0 && <span className="annotate text-fg-muted">{t.moreSpots(f.more.length)}</span>}
                  </div>
                  <p className="measure text-sm leading-relaxed text-fg [overflow-wrap:anywhere]">{f.message}</p>
                  <div className="flex flex-wrap gap-2">
                    {f.fix && (
                      <button type="button" className="control control-primary min-h-11 px-4 text-sm" onClick={() => fix(f)}>
                        {t.fix}: {f.fix.label}
                      </button>
                    )}
                    <button type="button" className="control min-h-11 px-4 text-sm" onClick={() => goTo(f)}>
                      {t.goTo}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <Disclosure id="lint-marked" level={3} nested title={t.marked} status={t.markedStatus}>
            <div className="well p-1.5">
              <div className="rounded-md p-4 md:p-5">
                <HighlightedText text={text} findings={findings} label={t.markedHeading} database={effective} />
              </div>
            </div>
          </Disclosure>
        </section>
      )}

      <Disclosure id="lint-more" title={t.moreOptions} status={t.moreOptionsStatus(syntaxLabel(database))}>
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-2">
            <span id="ss-lint-syntax" className="mr-1 text-sm text-fg-muted">
              {t.syntax.label}
            </span>
            <div role="group" aria-labelledby="ss-lint-syntax" className="flex flex-wrap gap-2">
              {SYNTAX_OPTIONS.map((o) => (
                <button
                  key={o}
                  type="button"
                  aria-pressed={database === o}
                  onClick={() => setDatabase(o)}
                  className={`min-h-11 rounded-full border px-5 text-sm ${
                    database === o ? "border-signal bg-signal text-signal-fg" : "border-edge-mid text-fg-muted hover:text-fg"
                  }`}
                >
                  {syntaxLabel(o)}
                </button>
              ))}
            </div>
            {database === "auto" && hasText && <span className="annotate text-fg-muted">{t.syntax.detected(syntaxLabel(effective))}</span>}
          </div>

          <div className="flex flex-wrap gap-2">
            {locked ? (
              <button type="button" className="control min-h-11 px-4 text-sm" onClick={showExampleInCochrane}>
                {t.convert.exampleToCochrane}
              </button>
            ) : (
              <>
                <button type="button" className="control min-h-11 px-4 text-sm" onClick={() => convert("cochrane")} disabled={!hasText}>
                  {t.convert.toCochrane}
                </button>
                <button type="button" className="control min-h-11 px-4 text-sm" onClick={() => convert("pubmed")} disabled={!hasText}>
                  {t.convert.toPubmed}
                </button>
                <button type="button" className="control min-h-11 px-4 text-sm" onClick={() => convert("cinahl")} disabled={!hasText}>
                  {x.convert.toCinahl}
                </button>
                <button type="button" className="control min-h-11 px-4 text-sm" onClick={() => convert("embase")} disabled={!hasText}>
                  {x.convert.toEmbase}
                </button>
              </>
            )}
          </div>

          {!locked && <p className="text-xs text-fg-muted">{x.convert.pubmedOnly}</p>}
          {effective === "embase" && hasText && <p className="measure text-xs leading-relaxed text-fg-muted">{x.lint.ovidNote}</p>}

          {converted && (converted.result.applied.length > 0 || converted.result.unsafe.length > 0) && (
            <div className="well flex flex-col gap-4 px-5 py-4" role="status">
              {converted.result.applied.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-fg">{t.convert.appliedHeading}</p>
                  <ul className="flex flex-col gap-1.5">
                    {converted.result.applied.map((n) => (
                      <li key={n.message} className="measure text-sm leading-relaxed text-fg-muted [overflow-wrap:anywhere]">
                        {n.message}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {converted.result.unsafe.length > 0 && (
                <div className="flex flex-col gap-1.5">
                  <p className="text-fg">{t.convert.unsafeHeading}</p>
                  <p className="measure text-sm leading-relaxed text-fg-muted">{t.convert.unsafeHint}</p>
                  <ul className="flex flex-col gap-2">
                    {converted.result.unsafe.map((n, i) => (
                      <li key={`${n.snippet}-${i}`} className="flex flex-col gap-0.5">
                        {n.snippet && <code className="font-mono text-xs text-fg [overflow-wrap:anywhere]">{n.snippet}</code>}
                        <span className="measure text-sm leading-relaxed text-fg-muted [overflow-wrap:anywhere]">{n.message}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </Disclosure>
    </div>
  )
}
