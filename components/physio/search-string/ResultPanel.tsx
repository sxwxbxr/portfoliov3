"use client"

import { useEffect, useRef, useState } from "react"
import { Check, Copy, Download } from "lucide-react"
import { ssCopy } from "@/lib/physio/copy/search-string"
import { buildQuery, exportJson, exportText, type SearchModel } from "@/lib/physio/search-string"
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

export function ResultPanel({ model, question }: { model: SearchModel; question: string }) {
  const built = buildQuery(model)
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle")
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => void (timer.current && clearTimeout(timer.current)), [])

  const termCount = built.components.reduce((n, c) => n + c.stichworte.length + c.schlagworte.length, 0)
  const today = () => new Date().toISOString().slice(0, 10)

  async function copy() {
    const ok = await copyToClipboard(built.query)
    setStatus(ok ? "copied" : "failed")
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setStatus("idle"), 2400)
  }

  const input = () => ({ question, built, model, date: today() })

  return (
    <div className="flex flex-col gap-10">
      <div className="well flex flex-col gap-1 px-5 py-4" role="note">
        <p className="text-fg">{ssCopy.draftNote.title}</p>
        <p className="measure text-sm leading-relaxed text-fg-muted">{ssCopy.draftNote.body}</p>
      </div>

      {built.empty ? (
        <div className="well px-5 py-4" role="status">
          <p className="text-sm text-fg-muted">{t.empty}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="well p-1.5">
            <div className="rounded-md p-4 md:p-5">
              <QueryView query={built.query} label={t.stringLabel} />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button type="button" onClick={copy} className="control control-primary inline-flex min-h-11 items-center gap-2 px-5 text-sm">
              {status === "copied" ? <Check className="size-4" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
              {status === "copied" ? t.copied : t.copy}
            </button>
            <button
              type="button"
              onClick={() => download("suchstring-pubmed.txt", exportText(input()), "text/plain")}
              className="control inline-flex min-h-11 items-center gap-2 px-5 text-sm"
            >
              <Download className="size-4" aria-hidden="true" />
              {t.downloadTxt}
            </button>
            <button
              type="button"
              onClick={() => download("suchstring-pubmed.json", exportJson(input()), "application/json")}
              className="control inline-flex min-h-11 items-center gap-2 px-5 text-sm"
            >
              <Download className="size-4" aria-hidden="true" />
              {t.downloadJson}
            </button>
            <span role="status" aria-live="polite" className={status === "failed" ? "text-sm text-fg-muted" : "sr-only"}>
              {status === "failed" ? t.copyFailed : status === "copied" ? t.copied : ""}
            </span>
          </div>
          <p className="annotate text-fg-muted">{t.stats(built.components.length, termCount)}</p>
          <p className="measure text-xs leading-relaxed text-fg-muted">{t.legend}</p>
        </div>
      )}

      <Notices notices={built.notices} heading={t.noticesHeading} />

      {!built.empty && <ComponentTable components={built.components} />}
      {!built.empty && <PubMedCount built={built} />}
    </div>
  )
}

function ComponentTable({ components }: { components: ReturnType<typeof buildQuery>["components"] }) {
  const cols = t.tableCols
  return (
    <section aria-labelledby="ss-table" className="flex flex-col gap-4">
      <h3 id="ss-table" className="text-xl tracking-tight">
        {t.tableHeading}
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
                <dd className="text-fg-muted [overflow-wrap:anywhere]">{c.schlagworte.join(", ") || t.none}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ul>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
          <caption className="sr-only">{t.tableHeading}</caption>
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
                <td className="py-4 leading-relaxed text-fg-muted">{c.schlagworte.join(", ") || t.none}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
