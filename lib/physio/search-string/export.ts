/** Text and JSON export of a built search string. Pure: the caller supplies the date. */
import { strategyText } from "./cochrane"
import { BLOCK_LABEL } from "./query-builder"
import { TERMINOLOGY } from "./parser"
import { DATABASES } from "./profiles"
import type { BuiltQuery, SearchModel } from "./types"

export const DRAFT_NOTE =
  "Entwurf: Dieser Suchstring wurde regelbasiert erzeugt und muss vor wissenschaftlicher Verwendung geprüft werden (Begriffe, Schlagworte, Trefferliste)."

/** Cochrane, CINAHL, Embase: one line for the search box, or the strategy, one search per line (Search Manager, S1 ..., #1 ...). */
export type ExportFormat = "single" | "manager"

export interface ExportInput {
  question: string
  built: BuiltQuery
  model: SearchModel
  /** ISO date, e.g. "2026-10-06". */
  date: string
  /** Only for databases with a line strategy (Cochrane, CINAHL, Embase). Default "single". */
  format?: ExportFormat
}

function databaseName(built: BuiltQuery): string {
  const info = DATABASES.find((d) => d.id === built.databaseId)
  const label = info?.label ?? built.databaseId
  if (built.databaseId === "cochrane") return `${label} (CENTRAL)`
  return info?.platform ? `${label} (${info.platform})` : label
}

const hasLines = (built: BuiltQuery) => !!built.lines?.length && built.databaseId !== "pubmed"

function formatName(built: BuiltQuery, format: ExportFormat): string {
  if (built.databaseId === "cochrane" && format === "manager") return "Search Manager, eine Zeile pro Suche"
  if (built.databaseId === "cinahl" && format === "manager") return "Eine Zeile pro Suche (S1, S2 …)"
  if (built.databaseId === "embase" && format === "manager") return "Eine Zeile pro Suche (#1, #2 …)"
  return "Ein Suchstring (Suchfeld)"
}

export function exportText({ question, built, model, date, format = "single" }: ExportInput): string {
  const manager = hasLines(built) && format === "manager"
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
    lines.push(`  ${built.vocabulary ? `Schlagwörter (${built.vocabulary.label}, Vorschläge aus MeSH)` : "Schlagworte (MeSH)"}: ${
      built.vocabulary ? (c.headings?.map((h) => h.syntax).join(", ") || "-") : c.schlagworte.join(", ") || "-"
    }`)
  }
  const f = model.filters
  const filters = built.filterClauses
  const humans = f.humansOnly && built.databaseId === "pubmed"
  if (filters.length || humans) {
    lines.push("")
    lines.push(`Filter: ${[...filters, ...(humans ? ["nur Menschen"] : [])].join(" | ")}`)
  }
  if (built.vocabulary) {
    lines.push("")
    lines.push(built.vocabulary.included ? built.vocabulary.note : `Ohne Schlagwörter: Der String enthält nur Stichworte, keine ${built.vocabulary.label}.`)
  }
  if (built.limitNotes?.length) {
    lines.push("")
    lines.push(
      built.databaseId === "cochrane"
        ? "Das setzt du in der Cochrane Library selbst (nicht im String ausdrückbar):"
        : `Das setzt du in ${databaseName(built)} selbst (nicht im String ausdrückbar):`,
    )
    for (const n of built.limitNotes) lines.push(`- ${n}`)
  }
  if (built.platformNotes?.length) {
    lines.push("")
    lines.push("So gibst du den String ein:")
    for (const n of built.platformNotes) lines.push(`- ${n}`)
  }
  lines.push("")
  lines.push(DRAFT_NOTE)
  return lines.join("\n") + "\n"
}

export function exportJson({ question, built, model, date, format = "single" }: ExportInput): string {
  const cochrane = built.databaseId === "cochrane"
  const withLines = hasLines(built)
  const manager = withLines && format === "manager"
  const payload = {
    tool: "physio.sweber.dev Suchstring-Generator",
    date,
    database: built.databaseId,
    databaseLabel: databaseName(built),
    format: manager ? (cochrane ? "search-manager" : "line-strategy") : "single-line",
    question: question.trim(),
    query: manager ? strategyText(built.lines!, false) : built.query,
    ...(withLines
      ? {
          singleLine: built.query,
          lines: (built.lines ?? []).map((l) => ({
            n: l.n,
            ...(l.prefix ? { ref: `${l.prefix}${l.n}` } : {}),
            query: l.query,
            kind: l.kind,
            label: l.label,
            ...(l.suggested ? { suggested: true } : {}),
          })),
        }
      : {}),
    ...(built.vocabulary ? { vocabulary: { id: built.vocabulary.id, label: built.vocabulary.label, suggestedFromMesh: built.vocabulary.suggested, included: built.vocabulary.included } } : {}),
    components: built.components.map((c) => {
      const concept = model.concepts.find((x) => x.id === c.conceptId)
      return {
        label: c.label,
        block: c.block,
        mesh: concept ? concept.mesh.filter((m) => !m.removed).map((m) => ({ heading: m.heading, explode: m.explode })) : [],
        ...(c.headings ? { headings: c.headings.map((h) => ({ source: h.source, syntax: h.syntax, explode: h.explode, suggested: h.suggested })) } : {}),
        freeText: c.stichworte,
        query: c.query,
      }
    }),
    filters: { ...model.filters, clauses: built.filterClauses },
    ...(built.limitNotes?.length ? { limitNotes: built.limitNotes } : {}),
    ...(built.platformNotes?.length ? { platformNotes: built.platformNotes } : {}),
    includedBlocks: model.includedBlocks,
    notices: built.notices.map((n) => ({ severity: n.severity, message: n.message })),
    terminology: { version: TERMINOLOGY.version, reviewed: TERMINOLOGY.reviewed },
    note: DRAFT_NOTE,
  }
  return JSON.stringify(payload, null, 2) + "\n"
}
