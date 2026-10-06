/** Text and JSON export of a built search string. Pure: the caller supplies the date. */
import { BLOCK_LABEL } from "./query-builder"
import { TERMINOLOGY } from "./parser"
import type { BuiltQuery, SearchModel } from "./types"

export const DRAFT_NOTE =
  "Entwurf: Dieser Suchstring wurde regelbasiert erzeugt und muss vor wissenschaftlicher Verwendung geprüft werden (Begriffe, Schlagworte, Trefferliste)."

export interface ExportInput {
  question: string
  built: BuiltQuery
  model: SearchModel
  /** ISO date, e.g. "2026-10-06". */
  date: string
}

export function exportText({ question, built, model, date }: ExportInput): string {
  const lines: string[] = []
  lines.push("Suchstring-Generator, physio.sweber.dev")
  lines.push(`Datum: ${date}`)
  lines.push(`Datenbank: PubMed`)
  if (question.trim()) lines.push(`Fragestellung: ${question.trim().replace(/\s+/g, " ")}`)
  lines.push("")
  lines.push(built.query || "(leer)")
  lines.push("")
  lines.push("Suchkomponenten")
  for (const c of built.components) {
    lines.push(`- ${c.label} (${BLOCK_LABEL[c.block]})`)
    lines.push(`  Stichworte: ${c.stichworte.join(", ") || "-"}`)
    lines.push(`  Schlagworte (MeSH): ${c.schlagworte.join(", ") || "-"}`)
  }
  const f = model.filters
  const filters = built.filterClauses
  if (filters.length || f.humansOnly) {
    lines.push("")
    lines.push(`Filter: ${[...filters, ...(f.humansOnly ? ["nur Menschen"] : [])].join(" | ")}`)
  }
  lines.push("")
  lines.push(DRAFT_NOTE)
  return lines.join("\n") + "\n"
}

export function exportJson({ question, built, model, date }: ExportInput): string {
  const payload = {
    tool: "physio.sweber.dev Suchstring-Generator",
    date,
    database: built.databaseId,
    question: question.trim(),
    query: built.query,
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
    includedBlocks: model.includedBlocks,
    notices: built.notices.map((n) => ({ severity: n.severity, message: n.message })),
    terminology: { version: TERMINOLOGY.version, reviewed: TERMINOLOGY.reviewed },
    note: DRAFT_NOTE,
  }
  return JSON.stringify(payload, null, 2) + "\n"
}
