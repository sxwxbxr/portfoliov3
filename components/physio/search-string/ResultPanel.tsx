"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Copy, Download, ExternalLink } from "lucide-react"
import { ssCopy } from "@/lib/physio/copy/search-string"
import {
  COCHRANE_ADVANCED_SEARCH_URL,
  DATABASES,
  buildQuery,
  exportJson,
  exportText,
  selectedDatabases,
  strategyText,
  type BuiltQuery,
  type DatabaseId,
  type SearchModel,
} from "@/lib/physio/search-string"
import type { ExportFormat } from "@/lib/physio/search-string/export"
import type { CountRow } from "@/lib/physio/search-string/pubmed"
import { Notices } from "./Notices"
import { PubMedCount } from "./PubMedCount"
import { QueryView } from "./QueryView"

const t = ssCopy.result

function download(name: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type: `${type};charset=utf-8` }))
  const a = document.createElement("a")
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    try {
      const ta = document.createElement("textarea")
      ta.value = text
      ta.setAttribute("readonly", "")
      ta.style.position = "fixed"
      ta.style.opacity = "0"
      document.body.appendChild(ta)
      ta.select()
      const ok = document.execCommand("copy")
      ta.remove()
      return ok
    } catch {
      return false
    }
  }
}

const labelOf = (id: DatabaseId) => DATABASES.find((d) => d.id === id)?.label ?? id

export function ResultPanel({
  model,
  question,
  onCountsChange,
}: {
  model: SearchModel
  question: string
  /** PubMed hit counts as they arrive (empty when reset), for the guided mode. */
  onCountsChange?: (rows: CountRow[]) => void
}) {
  const databases = selectedDatabases(model)
  const builds = databases.map((id) => buildQuery(model, id))
  const first = builds[0]
  const [showDiff, setShowDiff] = useState(false)

  const termCount = first.components.reduce((n, c) => n + c.stichworte.length + c.schlagworte.length, 0)
  const seen = new Set<string>()
  const multi = builds.length > 1

  return (
    <div className="flex flex-col gap-10">
      <div className="well flex flex-col gap-1 px-5 py-4" role="note">
        <p className="text-fg">{ssCopy.draftNote.title}</p>
        <p className="measure text-sm leading-relaxed text-fg-muted">{ssCopy.draftNote.body}</p>
      </div>

      {first.empty ? (
        <>
          <div className="well px-5 py-4" role="status">
            <p className="text-sm text-fg-muted">{t.empty}</p>
          </div>
          <Notices notices={first.notices} heading={t.noticesHeading} />
        </>
      ) : (
        <>
          <p className="annotate text-fg-muted">{t.stats(first.components.length, termCount)}</p>
          {builds.map((built) => {
            // Notices that apply to every database are shown once.
            const own = built.notices.filter((n) => {
              const key = `${n.code}|${n.conceptId ?? ""}|${n.message}`
              if (seen.has(key)) return false
              seen.add(key)
              return true
            })
            return (
              <DatabaseResult
                key={built.databaseId}
                built={built}
                notices={own}
                model={model}
                question={question}
                multi={multi}
                onCountsChange={onCountsChange}
              />
            )
          })}
          <div className="flex flex-col gap-4">
            <div>
              <button
                type="button"
                onClick={() => setShowDiff((v) => !v)}
                aria-expanded={showDiff}
                aria-controls="ss-diff"
                className="control inline-flex min-h-11 items-center px-5 text-sm"
              >
                {showDiff ? t.diff.hide : t.diff.show}
              </button>
            </div>
            {showDiff && (
              <div id="ss-diff">
                <Differences model={model} />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

/** One database: its string, copy and export, limits notes, component table and (PubMed) the hit count. */
function DatabaseResult({
  built,
  notices,
  model,
  question,
  multi,
  onCountsChange,
}: {
  built: BuiltQuery
  notices: BuiltQuery["notices"]
  model: SearchModel
  question: string
  multi: boolean
  onCountsChange?: (rows: CountRow[]) => void
}) {
  const id = built.databaseId
  const cochrane = id === "cochrane"
  const name = labelOf(id)
  const [format, setFormat] = useState<ExportFormat>("single")
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle")
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])

  const manager = cochrane && format === "manager" && !!built.lines?.length
  const text = manager ? strategyText(built.lines!, false) : built.query
  const today = () => new Date().toISOString().slice(0, 10)
  const input = () => ({ question, built, model, date: today(), format })
  const fileBase = `suchstring-${id}${manager ? "-search-manager" : ""}`

  async function copy() {
    const ok = await copyToClipboard(text)
    setStatus(ok ? "copied" : "failed")
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setStatus("idle"), 2400)
  }

  const headingId = `ss-db-${id}`
  const btn = "control inline-flex min-h-11 items-center gap-2 px-5 text-sm"

  return (
    <section aria-labelledby={multi ? headingId : undefined} aria-label={multi ? undefined : t.stringLabelFor(name)} className="flex flex-col gap-10">
      <div className="flex flex-col gap-4">
        {multi && (
          <h3 id={headingId} className="text-xl tracking-tight">
            {name}
          </h3>
        )}

        {cochrane && (
          <div className="flex flex-col gap-2">
            <div role="group" aria-label={t.format.label} className="flex flex-wrap items-center gap-2">
              <span className="annotate mr-1 text-fg-muted">{t.format.label}</span>
              {(["single", "manager"] as const).map((f) => (
                <button
                  key={f}
                  type="button"
                  aria-pressed={format === f}
                  onClick={() => setFormat(f)}
                  className={`min-h-11 rounded-full border px-5 text-sm ${
                    format === f ? "border-signal bg-signal text-signal-fg" : "border-edge-mid text-fg-muted hover:text-fg"
                  }`}
                >
                  {t.format[f]}
                </button>
              ))}
            </div>
            <p className="measure text-sm leading-relaxed text-fg-muted">{manager ? t.cochraneManagerHint : t.cochraneSingleHint}</p>
          </div>
        )}

        {!built.empty && (
          <div className="well p-1.5">
            <div className="rounded-md p-4 md:p-5">
              {manager ? <ManagerView built={built} name={name} /> : <QueryView query={built.query} label={t.stringLabelFor(name)} syntax={cochrane ? "cochrane" : "pubmed"} />}
            </div>
          </div>
        )}

        {!built.empty && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button type="button" onClick={copy} className="control control-primary inline-flex min-h-11 items-center gap-2 px-5 text-sm">
              {status === "copied" ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
              {status === "copied" ? (manager ? t.linesCopied : t.copied) : manager ? t.copyLines : t.copy}
            </button>
            <button type="button" onClick={() => download(`${fileBase}.txt`, exportText(input()), "text/plain")} className={btn}>
              <Download className="size-4" aria-hidden="true" />
              {t.downloadTxt}
            </button>
            <button type="button" onClick={() => download(`${fileBase}.json`, exportJson(input()), "application/json")} className={btn}>
              <Download className="size-4" aria-hidden="true" />
              {t.downloadJson}
            </button>
            {cochrane && (
              <a href={COCHRANE_ADVANCED_SEARCH_URL} target="_blank" rel="noopener noreferrer" className={btn}>
                {t.cochraneOpen}
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
            )}
            <span role="status" aria-live="polite" className={status === "failed" ? "text-sm text-fg-muted" : "sr-only"}>
              {status === "failed" ? t.copyFailed : status === "copied" ? t.copied : ""}
            </span>
          </div>
        )}
        {cochrane && !built.empty && <p className="measure text-xs leading-relaxed text-fg-muted">{t.cochraneOpenHint}</p>}
        {!built.empty && <p className="measure text-xs leading-relaxed text-fg-muted">{cochrane ? t.legendCochrane : t.legend}</p>}
      </div>

      {built.limitNotes && built.limitNotes.length > 0 && (
        <div className="well flex flex-col gap-3 px-5 py-4" role="note">
          <div className="flex flex-col gap-1">
            <p className="text-fg">{t.limitsHeading}</p>
            <p className="measure text-sm leading-relaxed text-fg-muted">{t.limitsHint}</p>
          </div>
          <ul className="flex flex-col gap-2">
            {built.limitNotes.map((n) => (
              <li key={n} className="measure text-sm leading-relaxed text-fg [overflow-wrap:anywhere]">
                {n}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Notices notices={notices} heading={t.noticesHeading} />

      {!built.empty && <ComponentTable built={built} dbName={multi ? name : undefined} />}
      {!built.empty && !cochrane && <PubMedCount built={built} onRowsChange={onCountsChange} />}
      {!built.empty && cochrane && (
        <p className="measure text-sm leading-relaxed text-fg-muted">{t.cochraneNoCount}</p>
      )}
    </section>
  )
}

/** The Search Manager strategy: line number, search, and what the line is for. */
function ManagerView({ built, name }: { built: BuiltQuery; name: string }) {
  const lines = built.lines ?? []
  return (
    <ol aria-label={t.stringLabelFor(`${name}, Search Manager`)} className="flex flex-col">
      {lines.map((l) => (
        <li key={l.n} className="grid grid-cols-[3rem_minmax(0,1fr)] gap-x-3 border-b border-edge-soft py-2 last:border-b-0">
          <span className="tab pt-px font-mono text-[13px] leading-[1.9] text-fg-muted" aria-label={`#${l.n}`}>
            #{l.n}
          </span>
          <div className="min-w-0">
            <QueryView query={l.query} label={`#${l.n}`} syntax="cochrane" lineBreaks={false} />
            {l.kind !== "term" && (
              <p className="annotate text-fg-muted">
                {t.lineKinds[l.kind]}: {l.label}
              </p>
            )}
            {l.kind === "term" && <p className="annotate text-fg-muted">{l.label}</p>}
          </div>
        </li>
      ))}
    </ol>
  )
}

/** Side by side: how every Suchkomponente is written in PubMed and in the Cochrane Library. */
function Differences({ model }: { model: SearchModel }) {
  const pm = buildQuery(model, "pubmed")
  const co = buildQuery(model, "cochrane")
  const d = t.diff
  return (
    <section aria-labelledby="ss-diff-h" className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <h3 id="ss-diff-h" className="text-xl tracking-tight">
          {d.heading}
        </h3>
        <p className="measure text-sm leading-relaxed text-fg-muted">{d.intro}</p>
      </div>

      <ul className="flex flex-col gap-1.5">
        {d.points.map((p) => (
          <li key={p} className="measure text-sm leading-relaxed text-fg-muted">
            {p}
          </li>
        ))}
      </ul>

      <div className="flex flex-col gap-4">
        {pm.components.map((c) => {
          const other = co.components.find((x) => x.conceptId === c.conceptId)
          const left = c.parts ?? []
          const right = other?.parts ?? []
          const aligned = left.length === right.length
          return (
            <div key={c.conceptId} className="cast flex flex-col gap-3 p-5">
              <p className="text-fg">{c.label}</p>
              {aligned ? (
                <div className="flex flex-col gap-2">
                  <div className="hidden grid-cols-2 gap-6 md:grid">
                    <span className="annotate text-fg-muted">{d.pubmed}</span>
                    <span className="annotate text-fg-muted">{d.cochrane}</span>
                  </div>
                  {left.map((l, i) => (
                    <div key={`${l}-${i}`} className="grid grid-cols-1 gap-x-6 gap-y-0.5 md:grid-cols-2">
                      <code className="font-mono text-xs leading-relaxed text-fg-muted [overflow-wrap:anywhere]">{l}</code>
                      <code className="font-mono text-xs leading-relaxed text-fg [overflow-wrap:anywhere]">{right[i]}</code>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div className="flex flex-col gap-0.5">
                    <span className="annotate text-fg-muted">{d.pubmed}</span>
                    <code className="font-mono text-xs leading-relaxed text-fg-muted [overflow-wrap:anywhere]">{c.query}</code>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="annotate text-fg-muted">{d.cochrane}</span>
                    <code className="font-mono text-xs leading-relaxed text-fg [overflow-wrap:anywhere]">{other?.query ?? ""}</code>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

function ComponentTable({ built, dbName }: { built: BuiltQuery; dbName?: string }) {
  const components = built.components
  const cols = t.tableCols
  const meshCell = (c: BuiltQuery["components"][number]) =>
    c.schlagworte.length ? (
      <ul className="flex flex-col gap-1.5">
        {c.schlagworte.map((s, i) => (
          <li key={`${s}-${i}`} className="flex flex-col">
            <span>{s}</span>
            {c.meshSyntax?.[i] && <code className="font-mono text-xs text-fg-muted [overflow-wrap:anywhere]">{c.meshSyntax[i]}</code>}
          </li>
        ))}
      </ul>
    ) : (
      t.none
    )
  const hid = `ss-table-${built.databaseId}`
  const caption = dbName ? `${t.tableHeading}, ${dbName}` : t.tableHeading
  return (
    <section aria-labelledby={hid} className="flex flex-col gap-4">
      <h3 id={hid} className="text-xl tracking-tight">
        {caption}
      </h3>

      <ul className="flex flex-col gap-3 md:hidden">
        {components.map((c) => (
          <li key={c.conceptId} className="cast flex flex-col gap-3 p-5">
            <p className="text-fg">{c.label}</p>
            <dl className="flex flex-col gap-2.5 text-sm">
              <div>
                <dt className="annotate text-fg-muted">{cols.keywords}</dt>
                <dd className="text-fg-muted [overflow-wrap:anywhere]">{c.stichworte.join(", ") || t.none}</dd>
              </div>
              <div>
                <dt className="annotate text-fg-muted">{cols.subjectHeadings}</dt>
                <dd className="text-fg-muted [overflow-wrap:anywhere]">{meshCell(c)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-edge-soft">
              <th scope="col" className="w-[22%] py-3 pr-6 text-left font-normal text-fg-muted">
                {cols.component}
              </th>
              <th scope="col" className="w-[44%] py-3 pr-6 text-left font-normal text-fg-muted">
                {cols.keywords}
              </th>
              <th scope="col" className="py-3 text-left font-normal text-fg-muted">
                {cols.subjectHeadings}
              </th>
            </tr>
          </thead>
          <tbody>
            {components.map((c) => (
              <tr key={c.conceptId} className="border-b border-edge-soft align-top">
                <th scope="row" className="py-4 pr-6 text-left font-normal text-fg">
                  {c.label}
                </th>
                <td className="py-4 pr-6 leading-relaxed text-fg-muted">{c.stichworte.join(", ") || t.none}</td>
                <td className="py-4 leading-relaxed text-fg-muted">{meshCell(c)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
