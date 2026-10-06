/**
 * Database profiles. A profile knows how one database spells subject headings,
 * free-text terms, filters and the final join. PubMed, the Cochrane Library,
 * CINAHL (EBSCOhost) and Embase (embase.com) are complete.
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
 *
 * CINAHL rules implemented here (EBSCOhost, CINAHL Complete / Ultimate; read 2026-10-06, see CINAHL_SOURCES).
 * EBSCO's own help (support.ebsco.com / connect.ebsco.com) renders by script and could not be fetched,
 * so the rules come from EBSCO's "Top 5 Searching Strategies" handout (about.ebsco.com) and from
 * university guides that quote the EBSCO help. What each point rests on is marked [EBSCO] or [guide]:
 *  - Field codes: TI (title), AB (abstract), TX (all text, includes the full text), SU (subjects),
 *    MH (CINAHL Subject Heading, major and minor), MM (major heading only) [guide]. The code stands in
 *    front of the term and takes a group: TI ("low back pain" OR lumbago). Use capitals [guide]. UNVERIFIED: the group form
 *    (code, space, parenthesis) is common in published CINAHL strategies, but EBSCO's own help page for it could not be read.
 *    The single-term form TI anesthesia is documented [guide: Newman].
 *  - Subject headings: (MH "Low Back Pain") exact heading, (MH "Low Back Pain+") exploded (+ inside the
 *    quotes), (MM "Low Back Pain+") major concept exploded [guide: Upstate, UConn].
 *  - Phrases in double quotes. Truncation and wildcards also work inside quotes [guide: UConn, "low* back pain"].
 *    A single word without quotes is searched with its plural; "word" in quotes searches the exact form [guide: UConn].
 *  - Truncation * (zero or more characters; also inside a word: sul*ur [guide: Sydney]), ? exactly one character,
 *    # zero or one character (colo#r) [EBSCO handout]. ? may not end a word [guide: UConn].
 *  - Proximity: N5 (near, either order), W5 (within, in the order typed), no slash, uppercase [EBSCO handout].
 *    N3 means at most three words between the terms [guide: UConn].
 *  - Boolean: AND, OR, NOT. Without parentheses AND is evaluated before OR ("cats OR kittens AND dogs OR
 *    puppies would process kittens AND dogs first") and EBSCO says: never mix operators without parentheses [EBSCO handout].
 *  - Search history: every search gets S1, S2 ...; typed lines combine them: S1 OR S2, S2 AND S6, also mixed with new
 *    terms (S3 AND drug therapy) [guide: UCL, Sydney; EBSCO article "Combining searches" could not be read].
 *
 * Not verified for CINAHL (so the string does not contain them, the person sets them as limiters, see limitNotes):
 * language (LA), publication year (PY / DT date ranges), publication type (PT), age groups and gender, "human".
 * Unverified: a documented minimum word root before * (the tool keeps three characters as its own rule);
 * whether pasting several lines runs them one by one (EBSCOhost takes one search per entry).
 *
 * Embase rules implemented here (embase.com, Elsevier; read 2026-10-06, see EMBASE_SOURCES):
 *  - Emtree: 'low back pain'/exp explodes (narrower terms included), 'low back pain'/de only the term itself.
 *    /mj (major focus) and /exp/mj exist [Elsevier user guide]; only the converter writes them. Emtree terms stand in single quotes [Elsevier E201].
 *  - Field codes follow the term after a colon: 'low back pain':ti,ab,kw ; several codes joined by commas;
 *    for a group put the codes after the closing parenthesis: (a NEAR/3 b):ti,ab,kw [Elsevier E201; kw = author keywords].
 *    The colon form does not work for /exp ('vioxx':exp) [Elsevier field-codes page].
 *  - Phrases in single or double quotes [Elsevier "How do I search"]. Embase prefers single quotes.
 *  - Wildcards: * (one or more), ? (exactly one), $ (zero or one). At least three characters before *.
 *    No leading wildcard. Wildcards inside quotes are allowed per the current help page (March 2026); an older quick guide
 *    says they do not work in phrases, so the tool writes starred phrases as NEXT/1 chains: (heart NEXT/1 infarct*) [E201 uses NEXT/1].
 *  - Proximity: NEAR/n (either order, within n words; NEAR/1 = next to each other), NEXT/n (in the order typed).
 *    The distance is always written.
 *  - Boolean: AND, OR, NOT. NO operator precedence: parentheses first, then strictly left to right.
 *    The tool therefore parenthesises every OR group.
 *  - Limits: [english]/lim, [randomized controlled trial]/lim, [systematic review]/lim, [meta analysis]/lim, [humans]/lim,
 *    [male]/lim, [middle aged]/lim ... (list on the Elsevier "What filters or limits" page); years [2016-2026]/py.
 *    A one-sided year range is not documented: the tool leaves it out and writes a note.
 *  - Search history: sets are #1, #2 ... and combine with the hash: #1 AND (#2 OR #3) [Elsevier E104].
 *  - Embase shows the search in the history rewritten (parentheses that change nothing are dropped) [Elsevier].
 *
 * Embase on Ovid is a different syntax (exp Low Back Pain/, .ti,ab,kf., adj3). Many Swiss Fachhochschulen
 * (BFH, HES-SO, SUPSI, FHNW, HSLU, ZHAW, OST) license Embase and Emcare through Ovid; BFH lists embase.com as well.
 * This profile writes embase.com. The Ovid form is not implemented; the linter points to it.
 *
 * Subject headings in CINAHL and Embase are SUGGESTIONS. CINAHL Headings (EBSCO) and Emtree (Elsevier) are licensed and
 * neither shipped nor scraped here. The heading is derived from the concept's MeSH heading: unchanged for CINAHL (many CINAHL
 * headings are MeSH-based), in natural word order and lower case for Emtree. Emtree often differs from MeSH
 * ("kinesiotherapy" for "Exercise Therapy"), so every such heading is marked and has to be checked in the thesaurus.
 */
import { naturalName } from "./mesh-concepts"
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

export const CINAHL_SOURCES = [
  { label: "EBSCO: Top 5 Searching Strategies (Boolean, wildcards, N and W)", url: "https://about.ebsco.com/sites/default/files/acquiadam-assets/Top-Five-Searching-Strategies-Handout.pdf" },
  { label: "EBSCO Connect: CINAHL with Full Text Help Sheet (field codes; page needs a browser)", url: "https://connect.ebsco.com/s/article/CINAHL-with-Full-Text-Help-Sheet?language=en_US" },
  { label: "UConn Library: Searching CINAHL (phrases, quotes, N and W, headings)", url: "https://guides.lib.uconn.edu/systematic_searching/CINAHL" },
  { label: "SUNY Upstate: CINAHL Search Tips (MH, MM, TI, AB)", url: "https://guides.upstate.edu/expertsearching/cinahl" },
  { label: "Newman University: EBSCO (CINAHL & MEDLINE) Tips (MeSH and CINAHL headings are similar, not the same)", url: "https://newmanu.libguides.com/nursing/ebsco" },
  { label: "University of Sydney: Searching in CINAHL (syntax table)", url: "https://www.library.sydney.edu.au/content/dam/library/documents/support/cinahl_searchingguide.pdf" },
  { label: "OST Bibliothek: Datenbanken A bis Z (CINAHL Complete via EBSCO)", url: "https://www.ost.ch/de/die-ost/bibliothek/e-medien/datenbanken-a-bis-z-der-bibliothek-ost" },
] as const

export const EMBASE_SOURCES = [
  { label: "Elsevier: Boolean operators, wildcards and proximity operators", url: "https://www.elsevier.support/embase/answer/can-i-use-boolean-operators-wildcards-and-proximity-operators-in-embase" },
  { label: "Elsevier: What field codes can I use in Embase?", url: "https://www.elsevier.support/embase/answer/what-field-codes-can-i-use-in-embase" },
  { label: "Elsevier: What filters or limits can I use in Embase? (/lim list)", url: "https://www.elsevier.support/embase/answer/what-filters-or-limits-can-i-use-in-embase" },
  { label: "Elsevier: How do I search in Embase? (quotes, /exp, /de, /mj)", url: "https://www.elsevier.support/embase/answer/how-do-i-search-in-embase" },
  { label: "Elsevier Embase E201: Systematic reviews (PICO strategy in embase.com syntax, PDF)", url: "https://supportcontent.elsevier.com/Support%20Hub/Embase/Files%20&%20Attachements/5513-EmbaseE201-Systematic%20Reviews-April%202015.pdf" },
  { label: "Elsevier Embase E104: Refining search results (combining #1 #2, PDF)", url: "https://supportcontent.elsevier.com/Support%20Hub/Embase/Files%20&%20Attachements/5503-Embase%20E104-RefiningSearchResults-Mar2015.pdf" },
  { label: "BFH Bibliotheken: Online-Ressourcen (Embase via Ovid or Elsevier)", url: "https://www.bfh.ch/en/about-bfh/locations-facilities/libraries/fh-e-resources/" },
] as const

/** embase.com, Advanced search. */
export const EMBASE_SEARCH_URL = "https://www.embase.com/search/advanced"

export interface DatabaseInfo {
  id: DatabaseId
  label: string
  available: boolean
  /** One line for the picker. */
  hint: string
  /** Platform the syntax is written for ("EBSCOhost", "embase.com (Elsevier)"). */
  platform?: string
  /** True when the subject headings are suggestions derived from MeSH (CINAHL, Embase). The person can leave them out. */
  headingSuggestions?: boolean
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
  /** CINAHL and Embase: the controlled vocabulary the suggested headings are written for. */
  vocabulary?: { id: "cinahl-headings" | "emtree"; label: string; note: string }
  /** CINAHL: puts the free-text terms into field groups, TI (a OR b) and AB (a OR b). Default: one part per term. */
  composeParts?(meshParts: string[], texts: FreeTextRender[]): string[]
  /** Prefix of line references in a line strategy: "S" for CINAHL. Default "#". */
  linePrefix?: string
  /** CINAHL and Embase: German notes on entering the string on the platform. */
  platformNotes?(): string[]
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

/* ── CINAHL (EBSCOhost) ──────────────────────────────────────────── */

/** The tool's own rule: EBSCO documents no minimum, but a root of one or two letters matches far too much. */
export const CINAHL_MIN_STEM = 3
const CINAHL_OPERATOR_WORDS = /^(and|or|not|[nw]\d+)$/i

/** One CINAHL heading suggestion: (MH "Low Back Pain+") explodes, (MH "Low Back Pain") does not. The + sits inside the quotes. */
export function cinahlMesh(heading: string, explode: boolean): string {
  return `(MH "${heading}${explode ? "+" : ""}")`
}

/** Letters and digits before the first * of one word. */
function wordStem(word: string): number {
  const star = word.indexOf("*")
  return star === -1 ? word.length : word.slice(0, star).replace(/[^\p{L}\p{N}]/gu, "").length
}

const CINAHL_VOCABULARY = {
  id: "cinahl-headings",
  label: "CINAHL Headings",
  note: "Schlagwort-Vorschlag aus MeSH: Viele CINAHL Headings entsprechen MeSH-Begriffen, aber nicht alle. Prüfe jeden Begriff im Thesaurus der Datenbank («CINAHL Headings» oben auf der Suchseite) und ersetze oder streiche ihn, wenn er dort anders heisst oder fehlt.",
} as const

function cinahlField(code: string, terms: string[]): string {
  return terms.length === 1 ? `${code} ${terms[0]}` : `${code} (${terms.join(" OR ")})`
}

function limiterLabel(f: Filters): string[] {
  const notes: string[] = []
  if (f.language) {
    const label = LANGUAGES.find((l) => l.value === f.language)?.label ?? f.language
    notes.push(`Sprache ${label}: Wähle sie in CINAHL unter «Limit your results» (Language). Eine Syntax für den Sprachfilter in der Suchzeile ist in den lesbaren Hilfeseiten nicht belegt, darum steht er nicht im String.`)
  }
  if (f.yearFrom !== null || f.yearTo !== null) {
    const from = f.yearFrom !== null ? String(f.yearFrom) : "…"
    const to = f.yearTo !== null ? String(f.yearTo) : "…"
    notes.push(`Zeitraum ${from} bis ${to}: Stelle ihn in CINAHL unter «Limit your results» (Publication Date) ein. Das Datumsfeld in der Suchzeile haben wir nicht belegen können.`)
  }
  if (f.studyTypes.length) {
    notes.push("Studientyp: Wähle ihn in CINAHL unter «Publication Type» im Limiter. Die Bezeichnungen dort weichen von PubMed ab, prüfe die Liste. Das Feld PT in der Suchzeile haben wir nicht belegen können.")
  }
  if (f.ageGroups.length) {
    notes.push(`Alter (${f.ageGroups.join(", ")}): CINAHL hat «Age Groups» als Limiter, mit eigenen Altersgrenzen, die von MeSH abweichen können. Prüfe sie dort. Das Tool schreibt kein Altersschlagwort in den String.`)
  }
  if (f.sex) {
    notes.push(`Geschlecht (${f.sex}): Nutze den Limiter «Gender», falls deine Oberfläche ihn anbietet. Das Tool schreibt kein Schlagwort dafür in den String.`)
  }
  if (f.humansOnly) {
    notes.push("«Nur Studien am Menschen» entfällt: Für CINAHL ist kein Filter dafür belegt, und das Tool schreibt keine erfundene Syntax.")
  }
  return notes
}

const cinahl: RenderProfile = {
  id: "cinahl",
  label: "CINAHL",
  available: true,
  hint: "(MH \"…+\"), TI/AB, N- und W-Operatoren für EBSCOhost. Einzeilig oder zeilenweise (S1, S2 …). Schlagwörter sind Vorschläge aus MeSH.",
  platform: "EBSCOhost (CINAHL Complete)",
  headingSuggestions: true,
  minStem: CINAHL_MIN_STEM,
  vocabulary: CINAHL_VOCABULARY,
  linePrefix: "S",

  mesh: cinahlMesh,

  freeText(raw) {
    let text = cleanFreeText(raw)
    if (!text) return null
    let truncationDropped = false
    if (text.includes("*")) {
      text = text.replace(/\*{2,}/g, "*")
      if (text.split(" ").some((w) => w.includes("*") && wordStem(w) < CINAHL_MIN_STEM)) {
        text = text.replace(/\*/g, "").replace(/\s+/g, " ").trim()
        truncationDropped = true
        if (!text) return null
      }
    }
    const quoted = text.includes(" ") || /[^\p{L}\p{N}*?#]/u.test(text) || CINAHL_OPERATOR_WORDS.test(text)
    return { term: quoted ? `"${text}"` : text, plain: text, truncationDropped }
  },

  composeParts(meshParts, texts) {
    const terms = texts.map((t) => t.term)
    return terms.length ? [...meshParts, cinahlField("TI", terms), cinahlField("AB", terms)] : [...meshParts]
  },

  group(parts) {
    return `(${parts.join(" OR ")})`
  },

  filterClauses() {
    return []
  },

  assemble(groups, filterClauses) {
    return [...groups, ...filterClauses].join(" AND ")
  },

  limitNotes: limiterLabel,

  platformNotes() {
    return [
      "Der String ist für EBSCOhost (CINAHL Complete). Gib ihn im Suchfeld der «Advanced Search» ein. Feldcodes schreibst du in Grossbuchstaben.",
      "Einzelne Wörter ohne Anführungszeichen sucht EBSCO auch in anderen Formen, zum Beispiel im Plural. Was in Anführungszeichen steht, wird genau so gesucht.",
      "Die Suchoptionen unter dem Suchfeld (zum Beispiel «Apply related words» oder «Also search within the full text of the articles») ändern die Trefferzahl. Lege sie fest und notiere sie in deiner Dokumentation.",
      "EBSCOhost führt eine Zeile pro Eingabe aus. Gib die Zeilen der Strategie nacheinander ein, die Suchhistorie vergibt S1, S2 … selbst.",
    ]
  },
}

/* ── Embase (embase.com, Elsevier) ───────────────────────────────── */

export const EMBASE_FIELDS = ":ti,ab,kw"
/** Elsevier: "type at least three characters before truncating with *". */
export const EMBASE_MIN_STEM = 3
const EMBASE_OPERATOR_WORDS = /^(and|or|not|near|next)$/i
const EMBASE_NEXT_WORD = /^[\p{L}\p{N}*?$'.&%+/]+$/u

/** The Emtree name suggested for a MeSH heading: natural word order, lower case, no apostrophe. Emtree itself often differs. */
export function emtreeSuggestion(heading: string): string {
  const name = /,\s*\d/.test(heading) ? heading : naturalName(heading)
  return name.toLowerCase().replace(/'/g, "").replace(/\s+/g, " ").trim()
}

/** One Emtree heading suggestion: 'low back pain'/exp explodes, 'low back pain'/de does not. */
export function embaseMesh(heading: string, explode: boolean): string {
  return `'${emtreeSuggestion(heading)}'/${explode ? "exp" : "de"}`
}

/** MeSH age groups that have a /lim value in Embase (Elsevier list "What filters or limits can I use in Embase?"). */
export const EMBASE_AGE_LIM: Record<string, string> = {
  Infant: "infant",
  "Infant, Newborn": "newborn",
  "Child, Preschool": "preschool",
  Child: "child",
  Adolescent: "adolescent",
  Adult: "adult",
  "Young Adult": "young adult",
  "Middle Aged": "middle aged",
  Aged: "aged",
  "Aged, 80 and over": "very elderly",
}

export const EMBASE_STUDY_LIM: Record<StudyTypeId, string> = {
  rct: "randomized controlled trial",
  "systematic-review": "systematic review",
  "meta-analysis": "meta analysis",
}

const EMBASE_LANGUAGE_LIM = new Set(LANGUAGES.map((l) => l.value))

const EMBASE_VOCABULARY = {
  id: "emtree",
  label: "Emtree",
  note: "Schlagwort-Vorschlag aus MeSH: Emtree weicht oft von MeSH ab (zum Beispiel «kinesiotherapy» statt «Exercise Therapy»). Prüfe jeden Begriff im Emtree-Thesaurus von Embase und ersetze oder streiche ihn, wenn er dort anders heisst oder fehlt.",
} as const

function embaseQuote(text: string): string {
  return text.includes("'") ? `"${text}"` : `'${text}'`
}

const embase: RenderProfile = {
  id: "embase",
  label: "Embase",
  available: true,
  hint: "'…'/exp, :ti,ab,kw, NEXT/n und Limits wie [english]/lim für embase.com. Einzeilig oder zeilenweise (#1, #2 …). Schlagwörter sind Vorschläge aus MeSH.",
  platform: "embase.com (Elsevier)",
  headingSuggestions: true,
  minStem: EMBASE_MIN_STEM,
  vocabulary: EMBASE_VOCABULARY,

  mesh: embaseMesh,

  freeText(raw) {
    let text = cleanFreeText(raw)
    if (!text) return null
    let truncationDropped = false
    if (text.includes("*")) {
      text = text.replace(/\*{2,}/g, "*")
      // Elsevier: no leading wildcard, at least three characters before the *.
      if (text.split(" ").some((w) => w.includes("*") && wordStem(w) < EMBASE_MIN_STEM)) {
        text = text.replace(/\*/g, "").replace(/\s+/g, " ").trim()
        truncationDropped = true
        if (!text) return null
      }
    }
    if (text.includes("*") && text.includes(" ")) {
      // A phrase with * becomes a NEXT/1 chain: older Embase guides say wildcards do not work inside quotes.
      const words = text.replace(/-/g, " ").replace(/\s+/g, " ").split(" ")
      if (words.every((w) => EMBASE_NEXT_WORD.test(w) && !EMBASE_OPERATOR_WORDS.test(w))) {
        return { term: `(${words.join(" NEXT/1 ")})${EMBASE_FIELDS}`, plain: words.join(" "), truncationDropped, nextForm: true }
      }
      text = text.replace(/\*/g, "")
      truncationDropped = true
    }
    const quoted = text.includes(" ") || /[^\p{L}\p{N}*?$]/u.test(text) || EMBASE_OPERATOR_WORDS.test(text)
    return { term: `${quoted ? embaseQuote(text) : text}${EMBASE_FIELDS}`, plain: text, truncationDropped }
  },

  group(parts) {
    return `(${parts.join(" OR ")})`
  },

  filterClauses(f) {
    const clauses: string[] = []
    if (f.studyTypes.length) {
      const lim = f.studyTypes.map((t) => `[${EMBASE_STUDY_LIM[t]}]/lim`)
      clauses.push(lim.length === 1 ? lim[0] : `(${lim.join(" OR ")})`)
    }
    const ages = f.ageGroups.filter((g) => EMBASE_AGE_LIM[g]).map((g) => `[${EMBASE_AGE_LIM[g]}]/lim`)
    if (ages.length) clauses.push(ages.length === 1 ? ages[0] : `(${ages.join(" OR ")})`)
    if (f.sex) clauses.push(`[${f.sex.toLowerCase()}]/lim`)
    if (f.language && EMBASE_LANGUAGE_LIM.has(f.language)) clauses.push(`[${f.language}]/lim`)
    if (f.yearFrom !== null && f.yearTo !== null && f.yearFrom <= f.yearTo) clauses.push(`[${pad(f.yearFrom, 4)}-${pad(f.yearTo, 4)}]/py`)
    if (f.humansOnly) clauses.push("[humans]/lim")
    return clauses
  },

  assemble(groups, filterClauses) {
    return [...groups, ...filterClauses].join(" AND ")
  },

  limitNotes(f) {
    const notes: string[] = []
    const lost = f.ageGroups.filter((g) => !EMBASE_AGE_LIM[g])
    if (lost.length) {
      notes.push(`Alter (${lost.join(", ")}): Für diese Altersgruppe steht in der Embase-Hilfe kein Limit der Form [..]/lim. Wähle sie unter «Patient age» in den Limits oder lass sie weg.`)
    }
    if (f.language && !EMBASE_LANGUAGE_LIM.has(f.language)) {
      notes.push(`Sprache (${f.language}): Stelle sie in Embase unter «Languages» in den Limits ein.`)
    }
    if ((f.yearFrom === null) !== (f.yearTo === null)) {
      const from = f.yearFrom !== null ? String(f.yearFrom) : "…"
      const to = f.yearTo !== null ? String(f.yearTo) : "…"
      notes.push(
        `Zeitraum ${from} bis ${to}: Ein offener Zeitraum ist in der Embase-Hilfe nicht belegt. Trage beide Jahre ein (zum Beispiel [2016-2026]/py) oder stelle «Publication years» in den Limits ein.`,
      )
    }
    return notes
  },

  platformNotes() {
    return [
      "Der String ist für embase.com (Elsevier). Wenn deine Hochschule Embase über Ovid anbietet (viele Fachhochschulen tun das), gilt dort eine andere Syntax, und dieser String läuft dort nicht.",
      "Embase wertet AND, OR und NOT strikt von links nach rechts aus, ohne Rangfolge. Darum steht jede OR-Gruppe in Klammern.",
      "In der Suchhistorie zeigt Embase deine Suche umgeschrieben an, Klammern ohne Wirkung fallen weg. Das ist normal.",
      "Zeilen der Strategie gibst du nacheinander ein, Embase vergibt #1, #2 … selbst.",
    ]
  },
}

export const DATABASES: DatabaseInfo[] = [pubmed, cochrane, cinahl, embase]

export function getRenderProfile(id: DatabaseId): RenderProfile | null {
  if (id === "pubmed") return pubmed
  if (id === "cochrane") return cochrane
  if (id === "cinahl") return cinahl
  if (id === "embase") return embase
  return null
}
