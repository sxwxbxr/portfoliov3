"use client"

import { useMemo, useRef, useState } from "react"
import Link from "next/link"
import { ssCopy } from "@/lib/physio/copy/search-string"
import { applyFix, autoFix, lintQuery, type LintFinding } from "@/lib/physio/search-string"
import { physioPath } from "@/lib/physio/urls"
import { HighlightedText } from "./QueryView"

const t = ssCopy.lint

interface Props {
  /** Demo: the text is the shipped student string and cannot be typed over. */
  locked: boolean
  exampleString: string
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

export function LintPanel({ locked, exampleString }: Props) {
  const [text, setText] = useState(locked ? exampleString : "")
  const [history, setHistory] = useState<string[]>([])
  const [message, setMessage] = useState("")
  const areaRef = useRef<HTMLTextAreaElement>(null)

  const findings = useMemo(() => lintQuery(text), [text])
  const counts = useMemo(
    () => ({
      error: findings.filter((f) => f.severity === "error").length,
      warning: findings.filter((f) => f.severity === "warning").length,
      info: findings.filter((f) => f.severity === "info").length,
    }),
    [findings],
  )
  const fixable = findings.some((f) => f.fix)

  function change(next: string) {
    setHistory((h) => [...h, text].slice(-30))
    setText(next)
  }

  function fix(f: LintFinding) {
    if (!f.fix) return
    change(applyFix(text, f.fix))
    setMessage(`${f.fix.label}.`)
  }

  function fixAll() {
    const r = autoFix(text)
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
  }

  function goTo(f: LintFinding) {
    const el = areaRef.current
    if (!el) return
    el.focus()
    el.setSelectionRange(f.start, f.end)
  }

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <label htmlFor="ss-lint-input" className="text-sm text-fg-muted">
            {t.inputLabel}
          </label>
          <div className="flex flex-wrap gap-2">
            {locked ? (
              <button type="button" className="control min-h-11 px-4 text-sm" onClick={() => change(exampleString)} disabled={text === exampleString}>
                {t.resetExample}
              </button>
            ) : (
              <>
                <button type="button" className="control min-h-11 px-4 text-sm" onClick={() => change(exampleString)}>
                  {t.insertExample}
                </button>
                <button type="button" className="control min-h-11 px-4 text-sm" onClick={() => change("")} disabled={!text}>
                  {t.clear}
                </button>
              </>
            )}
            <button type="button" className="control min-h-11 px-4 text-sm" onClick={undo} disabled={history.length === 0}>
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
          rows={7}
          spellCheck={false}
          autoCapitalize="off"
          autoCorrect="off"
          placeholder={t.inputPlaceholder}
          className="field w-full resize-y px-4 py-3 font-mono text-base leading-relaxed md:text-[13px]"
        />

        {locked && (
          <div className="well flex flex-col gap-1 px-5 py-4" role="note">
            <p className="text-fg">{t.lockedTitle}</p>
            <p className="text-sm text-fg-muted">
              {t.lockedBody}{" "}
              <Link href={physioPath("/abo")} className="text-fg underline underline-offset-4">
                {ssCopy.demo.ctaPrimary}
              </Link>
            </p>
          </div>
        )}
      </div>

      {text.trim() === "" ? (
        <div className="well flex flex-col gap-1 px-5 py-4" role="status">
          <p className="text-fg">{t.emptyTitle}</p>
          <p className="text-sm text-fg-muted">{t.emptyBody}</p>
        </div>
      ) : (
        <>
          <section aria-labelledby="ss-marked" className="flex flex-col gap-3">
            <h3 id="ss-marked" className="annotate text-fg-muted">
              {t.markedHeading}
            </h3>
            <div className="well p-1.5">
              <div className="rounded-md p-4 md:p-5">
                <HighlightedText text={text} findings={findings} label={t.markedHeading} />
              </div>
            </div>
          </section>

          <section aria-labelledby="ss-findings" className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 id="ss-findings" className="text-xl tracking-tight">
                  {findings.length ? t.summary(counts.error, counts.warning, counts.info) : t.cleanTitle}
                </h3>
                {findings.length === 0 && <p className="measure mt-1 text-sm text-fg-muted">{t.cleanBody}</p>}
              </div>
              {fixable && (
                <button type="button" className="control control-primary min-h-11 px-5 text-sm" onClick={fixAll}>
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
                  <li key={`${f.code}-${f.start}-${i}`} className="cast flex flex-col gap-3 p-5">
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
          </section>
        </>
      )}
    </div>
  )
}
