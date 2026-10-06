/**
 * The "Arbeitsblatt": everything the guided mode produced, as one draft the student
 * can copy, download (.txt, .md) or print. Pure: the caller supplies the date.
 */
import { BLOCK_LABEL, type BuiltQuery, type DatabaseId } from "../search-string"
import { activeCriteria, whereLabel, type ResolvedCriterion } from "./criteria"
import type { PicoKey, ResolvedPico } from "./pico"

export const WORKSHEET_DRAFT_NOTE =
  "Entwurf zum Prüfen. Das Arbeitsblatt wurde regelbasiert aus deinen Angaben zusammengestellt. Es ist keine Musterlösung und keine bewertete Abgabe: Prüfe jeden Teil, bevor du ihn verwendest."

export const PICO_LABEL: Record<PicoKey, string> = {
  P: "Population",
  I: "Intervention",
  C: "Comparison (Vergleich)",
  O: "Outcome",
}

export interface WorksheetComponent {
  n: number
  label: string
  block: string
  stichworte: string[]
  schlagworte: string[]
  /** The finished OR-group, in the primary database's syntax. */
  query: string
}

export interface WorksheetQuery {
  databaseId: DatabaseId
  label: string
  query: string
  /** Numbered lines for databases that take them (Cochrane Search Manager). */
  lines?: Array<{ n: number; query: string; label: string }>
}

export interface WorksheetCount {
  label: string
  count: number | null
}

export interface Worksheet {
  date: string
  caseText: string
  pico: Record<PicoKey, string>
  question: string
  include: ResolvedCriterion[]
  exclude: ResolvedCriterion[]
  components: WorksheetComponent[]
  /** "Suchkomponente 1 (… OR …) AND Suchkomponente 2 (… OR …)" */
  structure: string
  queries: WorksheetQuery[]
  filterClauses: string[]
  counts: WorksheetCount[] | null
  empty: boolean
}

export interface WorksheetInput {
  date: string
  caseText: string
  pico: ResolvedPico
  criteria: ResolvedCriterion[]
  /** One per selected database; the first is the primary one. */
  built: Array<{ label: string; built: BuiltQuery }>
  /** PubMed counts by row id (concept id or "total"), when the student counted. */
  counts?: Array<{ id: string; count: number | null }>
}

export function buildWorksheet(input: WorksheetInput): Worksheet {
  const primary = input.built[0]?.built
  const components: WorksheetComponent[] = (primary?.components ?? []).map((c, i) => ({
    n: i + 1,
    label: c.label,
    block: BLOCK_LABEL[c.block],
    stichworte: c.stichworte,
    schlagworte: c.schlagworte,
    query: c.query,
  }))
  const active = activeCriteria(input.criteria)
  const countRows = input.counts?.filter((r) => r.count !== null) ?? []
  const counts: WorksheetCount[] | null = countRows.length
    ? countRows.map((r) => ({
        label: r.id === "total" ? "Ganzer String" : (components.find((c) => primary?.components[c.n - 1]?.conceptId === r.id)?.label ?? r.id),
        count: r.count,
      }))
    : null
  return {
    date: input.date,
    caseText: input.caseText.trim(),
    pico: { P: input.pico.cells.P.text.trim(), I: input.pico.cells.I.text.trim(), C: input.pico.cells.C.text.trim(), O: input.pico.cells.O.text.trim() },
    question: input.pico.question.text.trim(),
    include: active.filter((c) => c.kind === "include"),
    exclude: active.filter((c) => c.kind === "exclude"),
    components,
    structure: components.length
      ? components.map((c) => `Suchkomponente ${c.n} (${c.stichworte.length + c.schlagworte.length > 1 ? "… OR …" : "…"})`).join(" AND ")
      : "",
    queries: input.built.map(({ label, built }) => ({
      databaseId: built.databaseId,
      label,
      query: built.query,
      lines: built.lines?.map((l) => ({ n: l.n, query: l.query, label: l.label })),
    })),
    filterClauses: primary?.filterClauses ?? [],
    counts,
    empty: !components.length,
  }
}

const dash = (list: string[]) => (list.length ? list.join(", ") : "-")

function criterionLine(c: ResolvedCriterion): string {
  return `- ${c.text}. Begründung: ${c.reason.replace(/\s+/g, " ").trim()} (${whereLabel(c.where)})`
}

export function worksheetText(ws: Worksheet): string {
  const L: string[] = []
  L.push("Arbeitsblatt Literaturrecherche (Entwurf)")
  L.push("Suchstring-Generator, Geführter Modus, physio.sweber.dev")
  L.push(`Datum: ${ws.date}`)
  L.push("")
  L.push(WORKSHEET_DRAFT_NOTE)
  if (ws.caseText) {
    L.push("")
    L.push("1. Fall")
    L.push(ws.caseText)
  }
  L.push("")
  L.push("2. PICO")
  for (const k of ["P", "I", "C", "O"] as PicoKey[]) L.push(`${k} (${PICO_LABEL[k]}): ${ws.pico[k] || "-"}`)
  L.push("")
  L.push(`Fragestellung: ${ws.question || "-"}`)
  L.push("")
  L.push("3. Ein- und Ausschlusskriterien")
  L.push("Einschluss")
  L.push(...(ws.include.length ? ws.include.map(criterionLine) : ["- (keine)"]))
  L.push("Ausschluss")
  L.push(...(ws.exclude.length ? ws.exclude.map(criterionLine) : ["- (keine)"]))
  L.push("")
  L.push("4. Suchkomponenten (Stichworte und Schlagworte)")
  if (ws.empty) L.push("(noch keine Suchkomponente)")
  for (const c of ws.components) {
    L.push(`Suchkomponente ${c.n}: ${c.label} (${c.block})`)
    L.push(`  Stichworte: ${dash(c.stichworte)}`)
    L.push(`  Schlagwort(e) (MeSH): ${dash(c.schlagworte)}`)
  }
  L.push("")
  L.push("5. Suchstring")
  if (ws.structure) L.push(`Aufbau: ${ws.structure}`)
  for (const q of ws.queries) {
    L.push("")
    L.push(`${q.label}:`)
    if (q.lines?.length) for (const l of q.lines) L.push(`#${l.n} ${l.query}`)
    else L.push(q.query || "(leer)")
  }
  if (ws.filterClauses.length) {
    L.push("")
    L.push(`Filter im String: ${ws.filterClauses.join(" | ")}`)
  }
  if (ws.counts) {
    L.push("")
    L.push("6. Trefferzahlen (PubMed)")
    for (const c of ws.counts) L.push(`- ${c.label}: ${c.count?.toLocaleString("de-CH") ?? "-"}`)
  }
  L.push("")
  L.push(WORKSHEET_DRAFT_NOTE)
  return L.join("\n") + "\n"
}

const cell = (s: string) => (s || "-").replace(/\|/g, "\\|").replace(/\s+/g, " ")

export function worksheetMarkdown(ws: Worksheet): string {
  const L: string[] = []
  L.push("# Arbeitsblatt Literaturrecherche (Entwurf)")
  L.push("")
  L.push(`Suchstring-Generator, Geführter Modus, physio.sweber.dev · ${ws.date}`)
  L.push("")
  L.push(`> ${WORKSHEET_DRAFT_NOTE}`)
  if (ws.caseText) {
    L.push("")
    L.push("## 1. Fall")
    L.push("")
    L.push(ws.caseText)
  }
  L.push("")
  L.push("## 2. PICO")
  L.push("")
  L.push("| | Bestandteil | Inhalt |")
  L.push("|---|---|---|")
  for (const k of ["P", "I", "C", "O"] as PicoKey[]) L.push(`| ${k} | ${PICO_LABEL[k]} | ${cell(ws.pico[k])} |`)
  L.push("")
  L.push(`**Fragestellung:** ${ws.question || "-"}`)
  L.push("")
  L.push("## 3. Ein- und Ausschlusskriterien")
  L.push("")
  L.push("| Art | Kriterium | Begründung | Umsetzung |")
  L.push("|---|---|---|---|")
  for (const c of [...ws.include, ...ws.exclude]) {
    L.push(`| ${c.kind === "include" ? "Einschluss" : "Ausschluss"} | ${cell(c.text)} | ${cell(c.reason)} | ${whereLabel(c.where)} |`)
  }
  L.push("")
  L.push("## 4. Suchkomponenten")
  L.push("")
  L.push("| Suchkomponente | Stichworte | Schlagwort(e) (MeSH) |")
  L.push("|---|---|---|")
  for (const c of ws.components) L.push(`| ${c.n}. ${cell(c.label)} (${c.block}) | ${cell(c.stichworte.join(", "))} | ${cell(c.schlagworte.join(", "))} |`)
  L.push("")
  L.push("## 5. Suchstring")
  if (ws.structure) {
    L.push("")
    L.push(`Aufbau: ${ws.structure}`)
  }
  for (const q of ws.queries) {
    L.push("")
    L.push(`**${q.label}**`)
    L.push("")
    L.push("```text")
    if (q.lines?.length) for (const l of q.lines) L.push(`#${l.n} ${l.query}`)
    else L.push(q.query || "(leer)")
    L.push("```")
  }
  if (ws.filterClauses.length) {
    L.push("")
    L.push(`Filter im String: ${ws.filterClauses.map((f) => `\`${f}\``).join(", ")}`)
  }
  if (ws.counts) {
    L.push("")
    L.push("## 6. Trefferzahlen (PubMed)")
    L.push("")
    L.push("| Suchkomponente | Treffer |")
    L.push("|---|---|")
    for (const c of ws.counts) L.push(`| ${cell(c.label)} | ${c.count?.toLocaleString("de-CH") ?? "-"} |`)
  }
  L.push("")
  L.push(`*${WORKSHEET_DRAFT_NOTE}*`)
  return L.join("\n") + "\n"
}
