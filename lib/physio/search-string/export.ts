/** Text and JSON export of a built search string. Pure: the caller supplies the date. */
import { strategyText } from "./cochrane"
import { BLOCK_LABEL } from "./query-builder"
import { TERMINOLOGY } from "./parser"
import { DATABASES } from "./profiles"
import type { BuiltQuery, SearchModel } from "./types"

export const DRAFT_NOTE =
  "Entwurf: Dieser Suchstring wurde regelbasiert erzeugt und muss vor wissenschaftlicher Verwendung geprüft werden (Begriffe, Schlagworte, Trefferliste)."

/** Cochrane: one line for the search box, or the Search Manager strategy, one search per line. */
export type ExportFormat = "single" | "manager"

export interface ExportInput {
  question: string
  built: BuiltQuery
  model: SearchModel
  /** ISO date, e.g. "2026-10-06". */
  date: string
  /** Only for Cochrane. Default "single". */
  format?: ExportFormat
}

function databaseName(built: BuiltQuery): string {
  const label = DATABASES.find((d) => d.id === built.databaseId)?.label ?? built.databaseId
  return built.databaseId === "cochrane" ? `${label} (CENTRAL)` : label
}

function formatName(built: BuiltQuery, format: ExportFormat): string {
  if (built.databaseId === "cochrane" && format === "manager") return "Search Manager, eine Zeile pro Suche"
  return "Ein Suchstring (Suchfeld)"
}

export function exportText({ question, built, model, date, format = "single" }: ExportInput): string {
  const manager = built.databaseId === "cochrane" && format === "manager" && !!built.lines?.length
  const lines: string[] = []
  lines.push("Suchstring-Generator, physio.sweber.dev")
  lines.push(`Datum: ${date}`)
  lines.push(`Datenbank: ${databaseName(built)}`)
  lines.push(`Format: ${formatName(built, manager ? "manager" : "single")}`)
  if (question.trim()) lines.push(`Fragestellung: ${question.trim().replace(/\s+/g, " ")}`)
  lines.push("")
  lines.push(manager ? strategyText(built.lines!, true) : built.query || "(leer)")
  lines.push("")
  lines.push("Suchkomponenten")
  for (const c of built.components) {
    lines.push(`- ${c.label} (${BLOCK_LABEL[c.block]})`)
    lines.push(`  Stichworte: ${c.stichworte.join(", ") || "-"}`)
    lines.push(`  Schlagworte (MeSH): ${c.schlagworte.join(", ") || "-"}`)
  }
  const f = model.filters
  const filters = built.filterClauses
  const humans = f.humansOnly && built.databaseId !== "cochrane"
  if (filters.length || humans) {
    lines.push("")
    lines.push(`Filter: ${[...filters, ...(humans ? ["nur Menschen"] : [])].join(" | ")}`)
  }
  if (built.limitNotes?.length) {
    lines.push("")
    lines.push("Das setzt du in der Cochrane Library selbst (nicht im String ausdrückbar):")
    for (const n of built.limitNotes) lines.push(`- ${n}`)
  }
  lines.push("")
  lines.push(DRAFT_NOTE)
  return lines.join("\n") + "\n"
}

export function exportJson({ question, built, model, date, format = "single" }: ExportInput): string {
  const cochrane = built.databaseId === "cochrane"
  const manager = cochrane && format === "manager" && !!built.lines?.length
  const payload = {
    tool: "physio.sweber.dev Suchstring-Generator",
    date,
    database: built.databaseId,
    databaseLabel: databaseName(built),
    format: manager ? "search-manager" : "single-line",
    question: question.trim(),
    query: manager ? strategyText(built.lines!, false) : built.query,
    ...(cochrane ? { singleLine: built.query, lines: (built.lines ?? []).map((l) => ({ n: l.n, query: l.query, kind: l.kind, label: l.label })) } : {}),
    components: built.components.map((c) => {
      const concept = model.concepts.find((x) => x.id === c.conceptId)
      return {
        label: c.label,
        block: c.block,
        mesh: concept ? concept.mesh.filter((m) => !m.removed).map((m) => ({ heading: m.heading, explode: m.explode })) : [],
        freeText: c.stichworte,
        query: c.query,
      }
    }),
    filters: { ...model.filters, clauses: built.filterClauses },
    ...(built.limitNotes?.length ? { limitNotes: built.limitNotes } : {}),
    includedBlocks: model.includedBlocks,
    notices: built.notices.map((n) => ({ severity: n.severity, message: n.message })),
    terminology: { version: TERMINOLOGY.version, reviewed: TERMINOLOGY.reviewed },
    note: DRAFT_NOTE,
  }
  return JSON.stringify(payload, null, 2) + "\n"
}
