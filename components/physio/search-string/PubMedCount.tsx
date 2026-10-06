"use client"

import { useEffect, useRef, useState } from "react"
import { ExternalLink } from "lucide-react"
import { ssCopy } from "@/lib/physio/copy/search-string"
import {
  countRows,
  getPubMedCounter,
  pubmedSearchUrl,
  type BuiltQuery,
  type CountRow,
  type PubMedErrorCode,
} from "@/lib/physio/search-string"

const t = ssCopy.pubmed

type Status = "idle" | "running" | "done" | "stopped" | "cancelled"

const FEW = 20
const MANY = 20000

/**
 * Opt-in hit counts. Nothing is sent until the button is pressed, and then only
 * the finished search strings go to PubMed (NCBI), one request at a time.
 */
export function PubMedCount({
  built,
  onRowsChange,
}: {
  built: BuiltQuery
  onRowsChange?: (rows: CountRow[]) => void
}) {
  const [rows, setRows] = useState<Record<string, CountRow>>({})
  useEffect(() => onRowsChange?.(Object.values(rows)), [rows, onRowsChange])
  const [status, setStatus] = useState<Status>("idle")
  const [error, setError] = useState<PubMedErrorCode | null>(null)
  const [done, setDone] = useState(0)
  const [forQuery, setForQuery] = useState("")
  const abort = useRef<AbortController | null>(null)

  const plan = [
    ...built.components.map((c) => ({ id: c.conceptId, label: c.label, query: c.query })),
    { id: "total", label: t.total, query: built.query },
  ]

  // A changed string makes the old numbers wrong: drop them and stop a running count.
  useEffect(() => {
    if (forQuery && forQuery !== built.query) {
      abort.current?.abort()
      setRows({})
      setStatus("idle")
      setError(null)
      setDone(0)
      setForQuery("")
    }
  }, [built.query, forQuery])

  useEffect(() => () => abort.current?.abort(), [])

  async function start() {
    abort.current?.abort()
    const ctrl = new AbortController()
    abort.current = ctrl
    setRows({})
    setError(null)
    setDone(0)
    setStatus("running")
    setForQuery(built.query)
    try {
      const r = await countRows(
        getPubMedCounter(),
        plan.map((p) => ({ id: p.id, query: p.query })),
        (row, n) => {
          setRows((prev) => ({ ...prev, [row.id]: row }))
          setDone(n)
        },
        ctrl.signal,
      )
      if (ctrl.signal.aborted) return
      setError(r.stopped)
      setStatus(r.stopped ? "stopped" : "done")
    } catch {
      if (abort.current === ctrl) setStatus("cancelled")
    }
  }

  function cancel() {
    abort.current?.abort()
  }

  const running = status === "running"
  const total = rows.total
  const hint =
    status === "done" && total?.count !== null && total?.count !== undefined
      ? total.count === 0
        ? t.zeroTotal
        : total.count < FEW
          ? t.fewTotal
          : total.count > MANY
            ? t.manyTotal
            : ""
      : ""

  return (
    <section aria-labelledby="ss-pubmed" className="flex flex-col gap-3 border-t border-edge-soft pt-6">
      <div className="flex flex-col gap-1">
        <h3 id="ss-pubmed" className="text-lg tracking-tight">
          {t.heading}
        </h3>
        <p className="measure text-xs leading-relaxed text-fg-muted">
          {t.hint} {t.privacy}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {running ? (
          <button type="button" className="control min-h-11 px-5 text-sm" onClick={cancel}>
            {t.cancel}
          </button>
        ) : (
          <button type="button" className="control control-primary min-h-11 px-5 text-sm" onClick={start}>
            {status === "idle" ? t.count : t.recount}
          </button>
        )}
        <a
          href={pubmedSearchUrl(built.query)}
          target="_blank"
          rel="noopener noreferrer"
          className="control inline-flex min-h-11 items-center gap-2 px-5 text-sm"
        >
          {t.open}
          <ExternalLink className="size-4" aria-hidden="true" />
        </a>
        <span role="status" aria-live="polite" className="text-sm text-fg-muted">
          {running ? t.counting(done, plan.length) : status === "cancelled" ? t.cancelled : ""}
        </span>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {t.errors[error]}
        </p>
      )}

      {status !== "idle" && (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[20rem] border-collapse text-left text-sm">
            <caption className="sr-only">{t.heading}</caption>
            <thead>
              <tr className="border-b border-edge-soft">
                <th scope="col" className="py-3 pr-6 text-left font-normal text-fg-muted">
                  {t.colComponent}
                </th>
                <th scope="col" className="py-3 text-right font-normal text-fg-muted">
                  {t.colHits}
                </th>
              </tr>
            </thead>
            <tbody>
              {plan.map((p) => {
                const row = rows[p.id]
                return (
                  <tr key={p.id} className="border-b border-edge-soft">
                    <th scope="row" className={`py-3 pr-6 text-left font-normal [overflow-wrap:anywhere] ${p.id === "total" ? "text-fg" : "text-fg-muted"}`}>
                      {p.label}
                    </th>
                    <td className="tabular py-3 text-right text-fg">
                      {row?.count !== null && row?.count !== undefined ? (
                        t.number(row.count)
                      ) : row?.error ? (
                        <span className="text-destructive">{t.failedRow}</span>
                      ) : (
                        <span className="text-fg-muted">{running ? t.pending : "-"}</span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      {hint && <p className="measure text-sm leading-relaxed text-fg-muted">{hint}</p>}
    </section>
  )
}
