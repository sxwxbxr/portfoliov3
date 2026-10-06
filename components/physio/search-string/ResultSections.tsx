"use client"

import { Download } from "lucide-react"
import { ssCopy } from "@/lib/physio/copy/search-string"
import { DATABASES, buildQuery, exportJson, exportText, type BuiltQuery, type SearchModel } from "@/lib/physio/search-string"
import { download, labelOf, today } from "./result-utils"

const t = ssCopy.result
const x = ssCopy.databasesExtra

/** The Suchkomponenten of every database as a table: the format of the RefHunter exercise. */
export function ComponentTables({ builds }: { builds: BuiltQuery[] }) {
  const multi = builds.length > 1
  return (
    <div className="flex flex-col gap-8">
      {builds.map((built) => (
        <ComponentTable key={built.databaseId} built={built} dbName={multi ? labelOf(built.databaseId) : undefined} />
      ))}
    </div>
  )
}

function ComponentTable({ built, dbName }: { built: BuiltQuery; dbName?: string }) {
  const components = built.components
  const cols = t.tableCols
  const vocab = built.vocabulary
  const vocabLabel = vocab ? (x.vocabularyLabels[vocab.id] ?? vocab.label) : ""
  const headingsTitle = vocab ? x.headings.columnTitle(vocabLabel) : cols.subjectHeadings
  const meshCell = (c: BuiltQuery["components"][number]) =>
    c.schlagworte.length ? (
      <ul className="flex flex-col gap-1.5">
        {c.schlagworte.map((s, i) => (
          <li key={`${s}-${i}`} className="flex flex-col items-start gap-0.5">
            <span>{s}</span>
            {c.meshSyntax?.[i] && <code className="font-mono text-xs text-fg-muted [overflow-wrap:anywhere]">{c.meshSyntax[i]}</code>}
            {c.headings?.[i]?.suggested && (
              <span title={x.headings.badgeTitle(vocabLabel)} className="rounded-[3px] border border-edge-mid bg-(--wash) px-1 text-[11px] text-(--signal-hi)">
                {x.headings.badge}
              </span>
            )}
          </li>
        ))}
      </ul>
    ) : vocab && !vocab.included ? (
      x.headings.offNote
    ) : (
      t.none
    )
  const hid = `ss-table-${built.databaseId}`
  const caption = dbName ? `${t.tableHeading}, ${dbName}` : t.tableHeading
  return (
    <section aria-labelledby={hid} className="flex flex-col gap-4">
      {dbName ? (
        <h4 id={hid} className="text-lg tracking-tight">
          {dbName}
        </h4>
      ) : (
        <h4 id={hid} className="sr-only">
          {caption}
        </h4>
      )}

      <ul className="flex flex-col gap-3 md:hidden">
        {components.map((c) => (
          <li key={c.conceptId} className="cast flex flex-col gap-3 p-4">
            <p className="text-fg">{c.label}</p>
            <dl className="flex flex-col gap-2.5 text-sm">
              <div>
                <dt className="annotate text-fg-muted">{cols.keywords}</dt>
                <dd className="text-fg-muted [overflow-wrap:anywhere]">{c.stichworte.join(", ") || t.none}</dd>
              </div>
              <div>
                <dt className="annotate text-fg-muted">{headingsTitle}</dt>
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
                {headingsTitle}
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

/** The other available databases next to PubMed. */
export function otherDatabases() {
  return DATABASES.filter((d) => d.available && d.id !== "pubmed")
}

/** Side by side: how every Suchkomponente is written in PubMed and in each other database. */
export function Differences({ model }: { model: SearchModel }) {
  const pm = buildQuery(model, "pubmed")
  const others = otherDatabases().map((db) => ({ db, built: buildQuery(model, db.id) }))
  const d = t.diff
  return (
    <div className="flex flex-col gap-5">
      <p className="measure text-sm leading-relaxed text-fg-muted">{d.intro}</p>

      {others.some((o) => o.db.id === "cochrane") && (
        <ul className="flex flex-col gap-1.5">
          {d.points.map((p) => (
            <li key={p} className="measure text-sm leading-relaxed text-fg-muted">
              {p}
            </li>
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-4">
        {pm.components.map((c) => (
          <div key={c.conceptId} className="cast flex flex-col gap-4 p-4 md:p-5">
            <p className="text-fg">{c.label}</p>
            {others.map(({ db, built }) => {
              const other = built.components.find((x) => x.conceptId === c.conceptId)
              const left = c.parts ?? []
              const right = other?.parts ?? []
              const aligned = left.length === right.length
              return (
                <div key={db.id} className="flex flex-col gap-2">
                  {aligned ? (
                    <>
                      <div className="hidden grid-cols-2 gap-6 md:grid">
                        <span className="annotate text-fg-muted">{d.pubmed}</span>
                        <span className="annotate text-fg-muted">{db.label}</span>
                      </div>
                      {left.map((l, i) => (
                        <div key={`${l}-${i}`} className="grid grid-cols-1 gap-x-6 gap-y-0.5 md:grid-cols-2">
                          <code className="font-mono text-xs leading-relaxed text-fg-muted [overflow-wrap:anywhere]">{l}</code>
                          <code className="font-mono text-xs leading-relaxed text-fg [overflow-wrap:anywhere]">{right[i]}</code>
                        </div>
                      ))}
                    </>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex flex-col gap-0.5">
                        <span className="annotate text-fg-muted">{d.pubmed}</span>
                        <code className="font-mono text-xs leading-relaxed text-fg-muted [overflow-wrap:anywhere]">{c.query}</code>
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="annotate text-fg-muted">{db.label}</span>
                        <code className="font-mono text-xs leading-relaxed text-fg [overflow-wrap:anywhere]">{other?.query ?? ""}</code>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

/** Per database: the string as a text or JSON file (Cochrane also line by line, for the Search Manager). */
export function ExportList({ builds, model, question }: { builds: BuiltQuery[]; model: SearchModel; question: string }) {
  const btn = "control inline-flex min-h-11 items-center gap-2 px-5 text-sm"
  return (
    <div className="flex flex-col gap-6">
      {builds.map((built) => {
        const id = built.databaseId
        const name = labelOf(id)
        const input = (format: "single" | "manager") => ({ question, built, model, date: today(), format })
        // The engine decides which databases have a line-by-line export: offer it where it differs from the one-line file.
        const lines = !!built.lines?.length && exportText(input("manager")) !== exportText(input("single"))
        const base = `suchstring-${id}`
        return (
          <div key={id} className="flex flex-col gap-3">
            {builds.length > 1 && <h4 className="text-lg tracking-tight">{name}</h4>}
            <div className="flex flex-wrap items-center gap-2.5">
              <button type="button" onClick={() => download(`${base}.txt`, exportText(input("single")), "text/plain")} className={btn} aria-label={`${t.downloadTxt}: ${name}`}>
                <Download className="size-4" aria-hidden="true" />
                {t.downloadTxt}
              </button>
              <button type="button" onClick={() => download(`${base}.json`, exportJson(input("single")), "application/json")} className={btn} aria-label={`${t.downloadJson}: ${name}`}>
                <Download className="size-4" aria-hidden="true" />
                {t.downloadJson}
              </button>
              {lines && (
                <>
                  <button
                    type="button"
                    onClick={() => download(`${base}-search-manager.txt`, exportText(input("manager")), "text/plain")}
                    className={btn}
                    aria-label={`${t.exportLinesTxt}: ${name}`}
                  >
                    <Download className="size-4" aria-hidden="true" />
                    {t.exportLinesTxt}
                  </button>
                  <button
                    type="button"
                    onClick={() => download(`${base}-search-manager.json`, exportJson(input("manager")), "application/json")}
                    className={btn}
                    aria-label={`${t.exportLinesJson}: ${name}`}
                  >
                    <Download className="size-4" aria-hidden="true" />
                    {t.exportLinesJson}
                  </button>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
