"use client"

import { useEffect, useId, useRef, useState, type Ref } from "react"
import { Check, ChevronDown, Copy, ExternalLink } from "lucide-react"
import { ssCopy } from "@/lib/physio/copy/search-string"
import {
  BLOCKS,
  COCHRANE_ADVANCED_SEARCH_URL,
  EMBASE_SEARCH_URL,
  buildQuery,
  headingOptionDatabases,
  headingsEnabled,
  selectedDatabases,
  setHeadings,
  strategyText,
  type Block,
  type BuiltQuery,
  type Notice,
  type SearchModel,
} from "@/lib/physio/search-string"
import type { CountRow } from "@/lib/physio/search-string/pubmed"
import { Disclosure, useSectionOpen } from "./Disclosure"
import { Notices } from "./Notices"
import { PubMedCount } from "./PubMedCount"
import { QueryView } from "./QueryView"
import { copyToClipboard, labelOf } from "./result-utils"

const t = ssCopy.result
const x = ssCopy.databasesExtra

/** Everything the result card and the areas under it need from the current model, computed once. */
export function buildAll(model: SearchModel): BuiltQuery[] {
  return selectedDatabases(model).map((id) => buildQuery(model, id))
}

/** Notices of the analysis and of every database, each shown once. */
export function mergeNotices(analysis: Notice[], builds: BuiltQuery[]): Notice[] {
  const seen = new Set<string>()
  const out: Notice[] = []
  for (const n of [...analysis, ...builds.flatMap((b) => b.notices)]) {
    const key = `${n.code}|${n.conceptId ?? ""}|${n.message}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(n)
  }
  return out
}

interface Props {
  model: SearchModel
  builds: BuiltQuery[]
  notices: Notice[]
  /** PubMed hit counts as they arrive (empty when reset), for the guided mode. */
  onCountsChange?: (rows: CountRow[]) => void
  /** The heading takes focus once a string was created. */
  headingRef?: Ref<HTMLHeadingElement>
  /** The result can switch the subject-heading suggestions of CINAHL and Embase on and off. */
  onChange?: (model: SearchModel) => void
}

/** Where a database's own search page lives, when the engine knows it. */
const OPEN_URL: Record<string, string> = { cochrane: COCHRANE_ADVANCED_SEARCH_URL, embase: EMBASE_SEARCH_URL }

/**
 * The result of "Suchstring erstellen": the finished string per database with a copy button above it,
 * the recognised Suchkomponenten as chips, one line for the hints, and the PubMed hit count.
 * Everything that is only needed to adjust or hand in the string lives in the folded areas below.
 */
export function ResultPanel({ model, builds, notices, onCountsChange, headingRef, onChange }: Props) {
  const first = builds[0]
  const multi = builds.length > 1
  const headingId = useId()

  return (
    <section aria-labelledby={headingId} data-guide="ss-result" className="cast flex flex-col gap-6 p-4 md:p-7">
      <div className="flex flex-col gap-2">
        <h2 ref={headingRef} id={headingId} tabIndex={-1} className="headline outline-none focus-visible:underline focus-visible:decoration-signal focus-visible:underline-offset-4">
          {t.heading}
        </h2>
        <DraftNote builds={builds} />
      </div>

      {first.empty ? (
        <>
          <div className="well px-5 py-4" role="status">
            <p className="text-sm text-fg-muted">{t.empty}</p>
          </div>
          <Notices notices={notices} heading={t.noticesHeading} />
        </>
      ) : (
        <>
          <div className="flex flex-col gap-8">
            {builds.map((built, i) => (
              <div key={built.databaseId} className={i > 0 ? "border-t border-edge-soft pt-8" : undefined}>
                <DatabaseResult built={built} multi={multi} model={model} onChange={onChange} />
              </div>
            ))}
          </div>
          <ComponentSummary model={model} />
          <HintsLine notices={notices} />
          {builds.some((b) => b.databaseId === "pubmed") && <PubMedCount built={builds.find((b) => b.databaseId === "pubmed")!} onRowsChange={onCountsChange} />}
        </>
      )}
    </section>
  )
}

/** One line: it is a draft. "mehr" shows the long note and how to read the string. */
function DraftNote({ builds }: { builds: BuiltQuery[] }) {
  const [open, setOpen] = useSectionOpen("draft-note")
  const id = useId()
  return (
    <div className="flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-x-2">
        <p className="text-sm text-fg-muted">{t.draftShort}</p>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
          className="inline-flex min-h-11 items-center px-1 text-sm text-fg underline underline-offset-4"
        >
          {open ? t.draftLess : t.draftMore}
        </button>
      </div>
      <div id={id} hidden={!open} className="flex flex-col gap-2 pb-1">
        <p className="measure text-sm leading-relaxed text-fg-muted">{ssCopy.draftNote.body}</p>
        {builds.map((b) => (
          <p key={b.databaseId} className="measure text-xs leading-relaxed text-fg-muted">
            {builds.length > 1 ? `${labelOf(b.databaseId)}: ` : ""}
            {b.databaseId === "cochrane" ? t.legendCochrane : t.legend}
          </p>
        ))}
      </div>
    </div>
  )
}

/** One database: the string, a copy button above it, what to set by hand, the Search Manager lines, the hit count. */
function DatabaseResult({ built, multi, model, onChange }: { built: BuiltQuery; multi: boolean; model: SearchModel; onChange?: (m: SearchModel) => void }) {
  const id = built.databaseId
  const cochrane = id === "cochrane"
  const name = labelOf(id)
  const extra = (built as BuiltQuery & { notes?: string[] }).notes

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <h3 className="flex flex-wrap items-baseline gap-x-3 text-xl tracking-tight">
          {name}
          {built.platform && <span className="annotate font-sans text-sm font-normal text-fg-muted">{built.platform}</span>}
        </h3>
        <CopyButton text={built.query} label={t.copy} doneLabel={t.copied} aria-label={`${t.copy}: ${name}`} primary />
      </div>

      <div className="well p-1.5">
        <div className="rounded-md p-4 md:p-5">
          <QueryView query={built.query} label={t.stringLabelFor(name)} syntax={cochrane ? "cochrane" : "pubmed"} />
        </div>
      </div>

      {built.vocabulary && onChange && headingOptionDatabases().includes(id) && (
        <div className="well flex flex-col gap-1 px-4 py-3">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 text-fg">
            <input
              type="checkbox"
              checked={headingsEnabled(model, id)}
              onChange={(e) => onChange(setHeadings(model, id, e.target.checked))}
              className="size-4 shrink-0 accent-signal"
            />
            <span className="text-sm">{x.headings.toggleOn}</span>
          </label>
          <p className="measure text-xs leading-relaxed text-fg-muted">{headingsEnabled(model, id) ? built.vocabulary.note : x.headings.offNote}</p>
        </div>
      )}

      {(cochrane || OPEN_URL[id]) && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {cochrane && <p className="measure text-xs leading-relaxed text-fg-muted">{t.cochraneSingleHint}</p>}
          {OPEN_URL[id] && (
            <a href={OPEN_URL[id]} target="_blank" rel="noopener noreferrer" className="control inline-flex min-h-11 items-center gap-2 px-4 text-sm">
              {cochrane ? t.cochraneOpen : t.openIn(name)}
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          )}
        </div>
      )}

      {built.platformNotes && built.platformNotes.length > 0 && (
        <Disclosure id={`notes-${id}`} level={4} nested title={x.platformHeading} status={built.platform}>
          <ul className="flex flex-col gap-2">
            {built.platformNotes.map((n) => (
              <li key={n} className="measure text-sm leading-relaxed text-fg-muted [overflow-wrap:anywhere]">
                {n}
              </li>
            ))}
          </ul>
        </Disclosure>
      )}

      {built.limitNotes && built.limitNotes.length > 0 && (
        <div className="well flex flex-col gap-2 px-4 py-3" role="note">
          <p className="text-sm text-fg">{x.limitNotesHeading(name)}</p>
          <ul className="flex flex-col gap-1.5">
            {built.limitNotes.map((n) => (
              <li key={n} className="measure text-sm leading-relaxed text-fg-muted [overflow-wrap:anywhere]">
                {n}
              </li>
            ))}
          </ul>
        </div>
      )}

      {extra && extra.length > 0 && (
        <ul className="flex flex-col gap-1.5">
          {extra.map((n) => (
            <li key={n} className="measure text-sm leading-relaxed text-fg-muted [overflow-wrap:anywhere]">
              {n}
            </li>
          ))}
        </ul>
      )}

      {built.lines && built.lines.length > 0 && <LinesDisclosure built={built} name={name} />}

      {id !== "pubmed" && <p className="measure text-xs leading-relaxed text-fg-muted">{cochrane ? t.cochraneNoCount : t.noCount(name)}</p>}
    </div>
  )
}

/** The same search as numbered lines (Search Manager), folded: one line per term, one per component, one that combines. */
function LinesDisclosure({ built, name }: { built: BuiltQuery; name: string }) {
  const lines = built.lines ?? []
  const cochrane = built.databaseId === "cochrane"
  return (
    <Disclosure
      id={`lines-${built.databaseId}`}
      level={4}
      nested
      title={cochrane ? t.managerTitle : (x.lines[built.databaseId] ?? t.managerTitleFor(name))}
      status={t.managerStatus(lines.length)}
    >
      <div className="flex flex-col gap-4">
        {cochrane && <p className="measure text-sm leading-relaxed text-fg-muted">{t.cochraneManagerHint}</p>}
        <div className="well p-1.5">
          <div className="rounded-md p-4 md:p-5">
            <ManagerView built={built} name={name} />
          </div>
        </div>
        <div>
          <CopyButton text={strategyText(lines, false)} label={t.copyLines} doneLabel={t.linesCopied} aria-label={`${t.copyLines}: ${name}`} />
        </div>
      </div>
    </Disclosure>
  )
}

function CopyButton({ text, label, doneLabel, primary = false, ...rest }: { text: string; label: string; doneLabel: string; primary?: boolean; "aria-label"?: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle")
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])

  async function copy() {
    const ok = await copyToClipboard(text)
    setStatus(ok ? "copied" : "failed")
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setStatus("idle"), 2400)
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={copy}
        aria-label={rest["aria-label"]}
        className={`control inline-flex items-center gap-2 px-5 text-sm ${primary ? "control-primary min-h-12 px-6 text-base" : "min-h-11"}`}
      >
        {status === "copied" ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
        {status === "copied" ? doneLabel : label}
      </button>
      <span role="status" aria-live="polite" className={status === "failed" ? "text-sm text-fg-muted" : "sr-only"}>
        {status === "failed" ? t.copyFailed : status === "copied" ? doneLabel : ""}
      </span>
    </span>
  )
}

/** The Search Manager strategy: line number, search, and what the line is for. */
function ManagerView({ built, name }: { built: BuiltQuery; name: string }) {
  const lines = built.lines ?? []
  return (
    <ol aria-label={t.stringLabelFor(`${name}, ${t.managerTitle}`)} className="flex flex-col">
      {lines.map((l) => (
        <li key={l.n} className="grid grid-cols-[2.5rem_minmax(0,1fr)] gap-x-3 border-b border-edge-soft py-2 last:border-b-0">
          <span className="tab pt-px font-mono text-[13px] leading-[1.9] text-fg-muted" aria-label={`${l.prefix ?? "#"}${l.n}`}>
            {l.prefix ?? "#"}
            {l.n}
          </span>
          <div className="min-w-0">
            <QueryView query={l.query} label={`${l.prefix ?? "#"}${l.n}`} syntax={built.databaseId === "cochrane" ? "cochrane" : "pubmed"} lineBreaks={false} />
            {l.kind !== "term" && (
              <p className="annotate text-fg-muted">
                {t.lineKinds[l.kind]}: {l.label}
              </p>
            )}
            {l.kind === "term" && (
              <p className="annotate text-fg-muted">
                {l.label}
                {l.suggested ? ` (${x.headings.badge})` : ""}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  )
}

/** The recognised Suchkomponenten as chips, grouped P, I, C, O. A small mark says which ones have a MeSH heading. */
function ComponentSummary({ model }: { model: SearchModel }) {
  const rows = BLOCKS.map((block) => ({ block, concepts: model.concepts.filter((c) => c.block === block) })).filter(
    (r) => r.concepts.length > 0 || r.block !== "comparison",
  )
  return (
    <section aria-labelledby="ss-chips-h" className="flex flex-col gap-3">
      <h3 id="ss-chips-h" className="annotate text-sm text-fg-muted">
        {t.componentsLabel}
      </h3>
      <ul className="flex flex-col gap-2.5">
        {rows.map(({ block, concepts }) => {
          const included = model.includedBlocks[block as Block]
          return (
            <li key={block} className="flex items-start gap-3">
              <span aria-hidden="true" className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md border border-edge-mid text-sm text-fg">
                {t.blockLetters[block]}
              </span>
              <span className="sr-only">{t.blockNames[block]}: </span>
              {concepts.length === 0 ? (
                <span className="py-1 text-sm text-fg-muted">{t.noneInBlock}</span>
              ) : (
                <ul className={`flex min-w-0 flex-wrap gap-1.5 ${included ? "" : "opacity-70"}`}>
                  {concepts.map((c) => {
                    const mesh = c.mesh.some((m) => !m.removed)
                    return (
                      <li key={c.id} className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-edge-mid bg-plate px-3 py-1 text-sm text-fg">
                        <span className="[overflow-wrap:anywhere]">{c.label}</span>
                        {mesh && (
                          <>
                            <span aria-hidden="true" className="rounded-[3px] border border-edge-mid bg-(--wash) px-1 text-[11px] text-(--signal-hi)">
                              {t.meshMark}
                            </span>
                            <span className="sr-only">{t.withMesh}</span>
                          </>
                        )}
                        {!included && <span className="text-xs text-fg-muted">({t.notInString})</span>}
                      </li>
                    )
                  })}
                </ul>
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/** "3 Hinweise, davon 1 Warnung" as one line; the full list opens on demand. */
function HintsLine({ notices }: { notices: Notice[] }) {
  const [open, setOpen] = useSectionOpen("result-hints")
  const id = useId()
  if (!notices.length) return null
  const warnings = notices.filter((n) => n.severity === "warning").length
  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
        className="control control-ghost inline-flex min-h-11 w-fit max-w-full items-center gap-2 px-3 text-left text-sm"
      >
        <span className="text-fg">{t.hints(notices.length, warnings)}</span>
        <span className="text-fg-muted">{open ? t.hintsHide : t.hintsShow}</span>
        <ChevronDown aria-hidden="true" className={`size-4 shrink-0 text-fg-muted transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <div id={id} hidden={!open}>
        <Notices notices={notices} />
      </div>
    </div>
  )
}
