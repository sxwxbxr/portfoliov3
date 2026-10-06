/**
 * Database profiles. A profile knows how one database spells MeSH headings,
 * free-text terms, filters and the final join. PubMed is complete; the other
 * three are declared so the UI can show them as "bald".
 *
 * PubMed rules implemented here (https://pubmed.ncbi.nlm.nih.gov/help/):
 *  - Boolean operators must be uppercase; PubMed evaluates left to right and
 *    uses parentheses to nest.
 *  - A wildcard (*) needs at least four characters before it. Phrases with a
 *    wildcard need quotes or a field tag. Wildcards, quotes and field tags
 *    switch Automatic Term Mapping off.
 *  - Field tags: [tiab], [Mesh], [Mesh:NoExp], [pt], [la], [dp].
 *  - Date ranges: "yyyy/mm/dd"[dp] : "yyyy/mm/dd"[dp]; "3000" is the usual open end.
 */
import type { DatabaseId, Filters, StudyTypeId } from "./types"

export interface DatabaseInfo {
  id: DatabaseId
  label: string
  available: boolean
  /** One line for the picker. */
  hint: string
}

export interface FreeTextRender {
  /** The finished term, e.g. `"back pain"[tiab]`. */
  term: string
  /** The cleaned text without tag, for the Stichworte column. */
  plain: string
  /** True when a `*` had to be removed because the stem was too short. */
  truncationDropped: boolean
}

export interface RenderProfile extends DatabaseInfo {
  available: true
  mesh(heading: string, explode: boolean): string
  freeText(raw: string): FreeTextRender | null
  group(parts: string[]): string
  filterClauses(filters: Filters): string[]
  assemble(groups: string[], filterClauses: string[], filters: Filters): string
}

export const STUDY_TYPE_PT: Record<StudyTypeId, string> = {
  rct: "randomized controlled trial",
  "systematic-review": "systematic review",
  "meta-analysis": "meta-analysis",
}

export const LANGUAGES: Array<{ value: string; label: string }> = [
  { value: "english", label: "Englisch" },
  { value: "german", label: "Deutsch" },
  { value: "french", label: "Französisch" },
  { value: "italian", label: "Italienisch" },
  { value: "spanish", label: "Spanisch" },
]

/** Removes what must not appear inside a term: quotes, brackets, parentheses. */
export function cleanFreeText(raw: string): string {
  return raw
    .replace(/[’‘`´]/g, "'")
    .replace(/[„“”"«»‚]/g, "")
    .replace(/[()[\]]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

/** Letters before the first wildcard. PubMed wants at least four characters. */
export function stemLength(term: string): number {
  const star = term.indexOf("*")
  if (star === -1) return term.length
  return term.slice(0, star).replace(/[^\p{L}\p{N}]/gu, "").length
}

export const PUBMED_MIN_STEM = 4

function pad(n: number, len: number): string {
  return String(n).padStart(len, "0")
}

const pubmed: RenderProfile = {
  id: "pubmed",
  label: "PubMed",
  available: true,
  hint: "MeSH, [tiab], Trunkierung und Filter nach der aktuellen PubMed-Hilfe.",

  mesh(heading, explode) {
    return `"${heading}"[${explode ? "Mesh" : "Mesh:NoExp"}]`
  },

  freeText(raw) {
    let text = cleanFreeText(raw)
    if (!text) return null
    let truncationDropped = false
    if (text.includes("*") && stemLength(text) < PUBMED_MIN_STEM) {
      text = text.replace(/\*+/g, "").trim()
      truncationDropped = true
      if (!text) return null
    }
    text = text.replace(/\*{2,}/g, "*")
    const needsQuotes = /[\s\-/,:'.]/.test(text)
    return { term: needsQuotes ? `"${text}"[tiab]` : `${text}[tiab]`, plain: text, truncationDropped }
  },

  group(parts) {
    return `(${parts.join(" OR ")})`
  },

  filterClauses(f) {
    const clauses: string[] = []
    if (f.studyTypes.length) {
      clauses.push(`(${f.studyTypes.map((t) => `${STUDY_TYPE_PT[t]}[pt]`).join(" OR ")})`)
    }
    if (f.language) clauses.push(`${f.language}[la]`)
    const from = f.yearFrom
    const to = f.yearTo
    if (from !== null || to !== null) {
      const start = from !== null ? `${pad(from, 4)}/01/01` : "1800/01/01"
      const end = to !== null ? `${pad(to, 4)}/12/31` : "3000"
      clauses.push(`("${start}"[dp] : "${end}"[dp])`)
    }
    return clauses
  },

  assemble(groups, filterClauses, f) {
    const body = [...groups, ...filterClauses].join(" AND ")
    if (!body) return ""
    return f.humansOnly ? `${body} NOT (animals[mh] NOT humans[mh])` : body
  },
}

const soon = (id: DatabaseId, label: string, hint: string): DatabaseInfo => ({ id, label, available: false, hint })

export const DATABASES: DatabaseInfo[] = [
  pubmed,
  soon("cochrane", "Cochrane Library", "Kommt später."),
  soon("cinahl", "CINAHL", "Kommt später."),
  soon("embase", "Embase", "Kommt später."),
]

export function getRenderProfile(id: DatabaseId): RenderProfile | null {
  return id === "pubmed" ? pubmed : null
}
