/**
 * Database profiles. A profile knows how one database spells MeSH headings,
 * free-text terms, filters and the final join. PubMed and the Cochrane Library
 * are complete; CINAHL and Embase are declared so the UI can show them as "bald".
 *
 * PubMed rules implemented here (https://pubmed.ncbi.nlm.nih.gov/help/):
 *  - Boolean operators must be uppercase; PubMed evaluates left to right and
 *    uses parentheses to nest.
 *  - A wildcard (*) needs at least four characters before it. Phrases with a
 *    wildcard need quotes or a field tag. Wildcards, quotes and field tags
 *    switch Automatic Term Mapping off.
 *  - Field tags: [tiab], [Mesh], [Mesh:NoExp], [pt], [la], [dp].
 *  - Date ranges: "yyyy/mm/dd"[dp] : "yyyy/mm/dd"[dp]; "3000" is the usual open end.
 *
 * Cochrane Library rules implemented here (CENTRAL, Wiley platform; read from
 * the official help pages on 2026-10-06, see COCHRANE_SOURCES):
 *  - MeSH: [mh "Low Back Pain"] explodes (default), [mh ^"Low Back Pain"] does
 *    not. A heading that is a phrase goes in quotes, a single word may stand
 *    alone ([mh vaccines]). Qualifiers: [mh vaccines/AE] (capitals, comma for
 *    several), major topic: [mh vaccines [mj]]. MeSH searches must be in [ ].
 *  - Field labels follow the term: "lung cancer":ti, word:ab, (a NEXT b):ti,ab,kw.
 *    Several labels are separated by commas without spaces. Without a label
 *    the whole text is searched. :kw covers MeSH terms, Emtree and CRG
 *    keywords but never explodes a MeSH term.
 *  - Phrases in double quotes (straight quotes, no hyphens needed). A phrase
 *    does NOT support wildcards: use NEXT instead, e.g. (hearing NEXT aid*).
 *  - Wildcards: * (zero or more characters, left, right or inside a word), ?
 *    (zero or one). Word root of at least 3 characters; one * per word.
 *  - Proximity: NEAR (6 words), NEAR/n, NEXT (adjacent, in order, no /n).
 *  - Boolean AND, OR, NOT. Without parentheses NOT is evaluated first, then
 *    AND, then OR. Use parentheses.
 *  - Search Manager: one search per line, lines numbered #1, #2 ...; lines are
 *    combined with Boolean logic (#1 OR #2) AND #3, or ranges {OR #1-#4}.
 *    Line references cannot be mixed with free-text terms and cannot be used
 *    with NEAR/NEXT.
 *  - Limits (publication date, content type, language, Cochrane group) are set
 *    in the interface ("Search limits", field menu), not reliably in syntax.
 *  - MeSH only matches records from PubMed, MEDLINE and ClinicalTrials.gov.
 *
 * Not verified (no public page found): whether a multi-line paste is split into
 * Search Manager lines, and any documented URL parameter that carries a search.
 */
import type { DatabaseId, Filters, StudyTypeId } from "./types"

export const COCHRANE_SOURCES = [
  { label: "Search manager help", url: "https://www.cochranelibrary.com/search-manager-help" },
  { label: "Search tab (Advanced search) help", url: "https://www.cochranelibrary.com/search-tab-help" },
  {
    label: "Quick guide: Cochrane Library search syntax (PDF, Aug 2024)",
    url: "https://www.cochranelibrary.com/documents/20182/439199364/Cochrane+Library+search+Syntax.pdf/43b2dbcd-651d-2ecd-fe83-c940dfda5fdc",
  },
] as const

/** Search Manager page of the Cochrane Library. There is no documented URL parameter that carries a search. */
export const COCHRANE_ADVANCED_SEARCH_URL = "https://www.cochranelibrary.com/advanced-search/search-manager"

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
  /** Cochrane: a phrase with `*` is written as (a NEXT b*), because quoted phrases do not support wildcards. */
  nextForm?: boolean
}

export interface RenderProfile extends DatabaseInfo {
  available: true
  mesh(heading: string, explode: boolean): string
  freeText(raw: string): FreeTextRender | null
  group(parts: string[]): string
  filterClauses(filters: Filters): string[]
  assemble(groups: string[], filterClauses: string[], filters: Filters): string
  /** Filters the string cannot express reliably: the person sets them in the database's interface. German. */
  limitNotes?(filters: Filters): string[]
  /** Shortest word root in front of a wildcard. */
  minStem: number
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
/** Cochrane Library: the word root of a wildcard term needs at least three characters. */
export const COCHRANE_MIN_STEM = 3

function pad(n: number, len: number): string {
  return String(n).padStart(len, "0")
}

const pubmed: RenderProfile = {
  id: "pubmed",
  label: "PubMed",
  available: true,
  hint: "MeSH, [tiab], Trunkierung und Filter nach der aktuellen PubMed-Hilfe.",
  minStem: PUBMED_MIN_STEM,

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
    if (f.ageGroups.length) {
      const groups = f.ageGroups.map((g) => `"${g}"[Mesh]`)
      clauses.push(groups.length === 1 ? groups[0] : `(${groups.join(" OR ")})`)
    }
    if (f.sex) clauses.push(`"${f.sex}"[Mesh]`)
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

export const COCHRANE_FIELDS = ":ti,ab,kw"
const COCHRANE_WORD_OPERATORS = /^(and|or|not|near|next)$/i

/** A word of a Cochrane free-text term that may stand inside (a NEXT b*) without quotes. */
const NEXT_SAFE_WORD = /^[\p{L}\p{N}*?'.&%+/]+$/u

function literalLength(word: string): number {
  return word.replace(/[*?]/g, "").length
}

/** One MeSH heading in Cochrane syntax: [mh "Low Back Pain"], or [mh ^"Low Back Pain"] when not exploded. */
export function cochraneMesh(heading: string, explode: boolean): string {
  const bare = /^[\p{L}\p{N}]+$/u.test(heading) && !COCHRANE_WORD_OPERATORS.test(heading)
  return `[mh ${explode ? "" : "^"}${bare ? heading : `"${heading}"`}]`
}

const cochrane: RenderProfile = {
  id: "cochrane",
  label: "Cochrane Library",
  available: true,
  hint: "[mh], :ti,ab,kw und NEXT statt Stern in Phrasen. Einzeilig oder zeilenweise für den Search Manager.",
  minStem: COCHRANE_MIN_STEM,

  mesh: cochraneMesh,

  freeText(raw) {
    // Cochrane advises quoted phrases instead of hyphens ("exit site" finds exit-site too).
    let text = cleanFreeText(raw).replace(/-/g, " ").replace(/\s+/g, " ").trim()
    if (!text) return null
    let truncationDropped = false
    if (text.includes("*")) {
      // One * per word (the last one stays); the word root needs at least three characters.
      const fixed = text.split(" ").map((w) => (w.split("*").length > 2 ? `${w.replace(/\*/g, "")}*` : w))
      if (fixed.some((w) => w.includes("*") && literalLength(w) < COCHRANE_MIN_STEM)) {
        text = fixed.join(" ").replace(/\*/g, "").trim()
        truncationDropped = true
        if (!text) return null
      } else {
        text = fixed.join(" ")
      }
    }
    const words = text.split(" ")
    if (text.includes("*") && words.length > 1) {
      if (words.every((w) => NEXT_SAFE_WORD.test(w) && !COCHRANE_WORD_OPERATORS.test(w))) {
        return { term: `(${words.join(" NEXT ")})${COCHRANE_FIELDS}`, plain: text, truncationDropped, nextForm: true }
      }
      text = text.replace(/\*/g, "")
      truncationDropped = true
    }
    const quoted = words.length > 1 || /[^\p{L}\p{N}*?]/u.test(text) || COCHRANE_WORD_OPERATORS.test(text)
    return { term: `${quoted ? `"${text}"` : text}${COCHRANE_FIELDS}`, plain: text, truncationDropped }
  },

  group(parts) {
    return `(${parts.join(" OR ")})`
  },

  filterClauses(f) {
    // Only MeSH check tags can be written reliably. Language, dates and study type: see limitNotes.
    const clauses: string[] = []
    if (f.ageGroups.length) {
      const groups = f.ageGroups.map((g) => cochraneMesh(g, true))
      clauses.push(groups.length === 1 ? groups[0] : `(${groups.join(" OR ")})`)
    }
    if (f.sex) clauses.push(cochraneMesh(f.sex, true))
    return clauses
  },

  assemble(groups, filterClauses) {
    return [...groups, ...filterClauses].join(" AND ")
  },

  limitNotes(f) {
    const notes: string[] = []
    if (f.language) {
      const label = LANGUAGES.find((l) => l.value === f.language)?.label ?? f.language
      notes.push(
        `Sprache ${label}: Das Feld :la gibt es in der Cochrane Library nur für CENTRAL-Einträge, und die Hilfe empfiehlt, die Sprache über das Feldmenü im Tab «Suche» zu wählen. Der String enthält darum keinen Sprachfilter.`,
      )
    }
    if (f.yearFrom !== null || f.yearTo !== null) {
      const from = f.yearFrom !== null ? String(f.yearFrom) : "…"
      const to = f.yearTo !== null ? String(f.yearTo) : "…"
      notes.push(
        `Zeitraum ${from} bis ${to}: Stelle ihn unter «Search limits» ein, nicht im String. Für Studien (CENTRAL) gilt «Original publication year», für Cochrane Reviews «Cochrane Library publication date».`,
      )
    }
    if (f.studyTypes.length) {
      notes.push(
        "Studientyp: Einen Filter wie [pt] in PubMed gibt es im String nicht. Wähle unter «Search limits» den Inhaltstyp: Cochrane Reviews (systematische Übersichtsarbeiten) oder Trials (CENTRAL).",
      )
    }
    if (f.humansOnly) {
      notes.push("«Nur Studien am Menschen» entfällt: Die Cochrane Library hat dafür keinen Filter, und das Tool schreibt keine erfundene Syntax dafür.")
    }
    return notes
  },
}

const soon = (id: DatabaseId, label: string, hint: string): DatabaseInfo => ({ id, label, available: false, hint })

export const DATABASES: DatabaseInfo[] = [
  pubmed,
  cochrane,
  soon("cinahl", "CINAHL", "Kommt später."),
  soon("embase", "Embase", "Kommt später."),
]

export function getRenderProfile(id: DatabaseId): RenderProfile | null {
  if (id === "pubmed") return pubmed
  if (id === "cochrane") return cochrane
  return null
}
