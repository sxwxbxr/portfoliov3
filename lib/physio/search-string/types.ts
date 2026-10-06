/**
 * Shared types of the search-string engine. Pure data, no React, no server imports.
 *
 * Vocabulary (as taught at the OST): a "Suchkomponente" is one concept of the
 * question (one OR-group in the string). Its "Stichworte" are free-text words
 * ([tiab]); its "Schlagworte" are controlled vocabulary headings (MeSH).
 */

export type Category = "population" | "intervention" | "comparison" | "outcome" | "setting" | "studytype"

/** The four PICO blocks a Suchkomponente can sit in. */
export type Block = "population" | "intervention" | "comparison" | "outcome"

export const BLOCKS: readonly Block[] = ["population", "intervention", "comparison", "outcome"]

export type StudyTypeId = "rct" | "systematic-review" | "meta-analysis"

export type DatabaseId = "pubmed" | "cochrane" | "cinahl" | "embase"

/** One entry of terminology.json. */
export interface TermConcept {
  id: string
  /** German display name. */
  label: string
  category: Category
  aliasesDe: string[]
  aliasesEn: string[]
  /** Exact MeSH descriptor names. Empty when no suitable heading exists. */
  mesh: string[]
  /** English free-text phrases for [tiab]. `*` only where the stem is safe. */
  freeText: string[]
  /** Id of the broader concept. When both are detected, the broader one is dropped. */
  broader?: string
  /** Drop this concept when any of these ids is present (it adds nothing). */
  redundantIf?: string[]
  /** PubMed publication type (study-type concepts only). */
  pt?: string
}

export interface Terminology {
  version: string
  /** False until the content has been reviewed by a person. */
  reviewed: boolean
  concepts: TermConcept[]
}

export interface MeshTerm {
  heading: string
  /** true: [Mesh] (explode, includes narrower terms). false: [Mesh:NoExp]. */
  explode: boolean
  removed?: boolean
}

export interface FreeTextTerm {
  text: string
  /** Added by the user, not from the terminology. */
  custom?: boolean
  removed?: boolean
  /** Append `*` when the string is built. Offered per term, never applied blindly. */
  trunc?: boolean
}

/**
 * A MeSH descriptor with everything the editor needs offline: German labels,
 * scope note and the entry terms to pick synonyms from. Same shape as the index
 * delivers it (see mesh-index.ts), kept here so the model stays plain data.
 */
export interface MeshChoice {
  ui: string
  /** MeSH heading, e.g. "Low Back Pain" or "Osteoarthritis, Knee". */
  name: string
  treeNumbers: string[]
  entryTerms: string[]
  german: string[]
  /** English, about 300 characters. May be empty. */
  scopeNote: string
}

/** One editable Suchkomponente. */
export interface Concept {
  /** Unique within a model. Terminology id, or `custom-<n>`. */
  id: string
  /** Terminology id, null for custom concepts. */
  termId: string | null
  label: string
  block: Block
  mesh: MeshTerm[]
  freeText: FreeTextTerm[]
  /** terminology: curated table. mesh: built from a MeSH descriptor of the index. custom: typed by the user. */
  origin: "terminology" | "custom" | "mesh"
  /** The words of the question that triggered this concept. */
  matchedText?: string
  /** Descriptor the concept was built from (origin "mesh"). */
  descriptor?: MeshChoice
  /** Other descriptors the same word could mean (ambiguous German terms). The user can switch. */
  alternatives?: MeshChoice[]
}

export type SexFilter = "" | "Male" | "Female"

export interface Filters {
  /** Lowercase PubMed language name ("english"), or "" for no filter. */
  language: string
  yearFrom: number | null
  yearTo: number | null
  studyTypes: StudyTypeId[]
  humansOnly: boolean
  /** MeSH age group headings ("Middle Aged"). Several are OR-ed. */
  ageGroups: string[]
  /** MeSH check tag "Male" or "Female". */
  sex: SexFilter
}

export interface SearchModel {
  concepts: Concept[]
  filters: Filters
  /** Blocks that go into the string. Comparison is off by default. */
  includedBlocks: Record<Block, boolean>
  /** Databases the result is written for. Missing means PubMed only. */
  databases?: DatabaseId[]
}

export interface PicoInput {
  population?: string
  intervention?: string
  comparison?: string
  outcome?: string
  studyType?: string
}

export interface AnalyzeInput {
  text?: string
  pico?: PicoInput
}

/** A word or phrase of the question that was not turned into a Suchkomponente. */
export interface Candidate {
  id: string
  text: string
  /** Best guess of the block, from the surrounding markers. */
  block: Block
  /**
   * Set when the MeSH index knows the word but the match is too weak to add on
   * its own (a body part, a social term). The user can adopt it with one click.
   */
  suggestion?: MeshChoice
}

/** An optional filter derived from the case (age, sex). Never switched on by the engine. */
export interface FilterSuggestion {
  id: string
  kind: "age" | "sex"
  /** MeSH heading: "Middle Aged", "Male". */
  value: string
  /** The words of the question it comes from ("45 Jahre"). */
  evidence: string
}

export type NoticeSeverity = "info" | "warning"

export interface Notice {
  severity: NoticeSeverity
  code: string
  message: string
  conceptId?: string
}

export interface AnalysisResult {
  concepts: Concept[]
  candidates: Candidate[]
  notices: Notice[]
  studyTypes: StudyTypeId[]
  /** Optional age and sex filters found in a patient case. Off by default. */
  filterSuggestions: FilterSuggestion[]
}

/** One row of the RefHunter-style table. */
export interface BuiltComponent {
  conceptId: string
  label: string
  block: Block
  /** The finished OR-group, in parentheses. */
  query: string
  /** Free-text words as the student reads them (plain, without tags). */
  stichworte: string[]
  /** MeSH headings, with `:NoExp` marked in the string only. */
  schlagworte: string[]
  /** The single terms of the OR-group in the database's syntax (same order as in `query`). */
  parts?: string[]
  /** The MeSH headings in the database's syntax, same order as `schlagworte`. */
  meshSyntax?: string[]
}

/** One line of a Search Manager strategy (Cochrane Library). */
export interface StrategyLine {
  /** Line number, 1-based. Combination lines refer to it as #n. */
  n: number
  /** The search of this line, without the number. */
  query: string
  kind: "term" | "component" | "filter" | "final"
  /** German description: the Suchkomponente or what the line combines. */
  label: string
  conceptId?: string
}

export interface BuiltQuery {
  databaseId: DatabaseId
  query: string
  components: BuiltComponent[]
  filterClauses: string[]
  notices: Notice[]
  empty: boolean
  /** Cochrane: the same search as numbered Search Manager lines. */
  lines?: StrategyLine[]
  /** Filters the string cannot express; the person sets them in the database's interface. */
  limitNotes?: string[]
}

/** Which syntax the linter checks. "auto" detects it from the field syntax. */
export type LintDatabase = "pubmed" | "cochrane" | "auto"

export type LintSeverity = "error" | "warning" | "info"

export interface Range {
  start: number
  end: number
}

export interface Edit {
  start: number
  end: number
  text: string
}

export interface LintFix {
  label: string
  edits: Edit[]
}

export interface LintFinding {
  code: string
  severity: LintSeverity
  /** German message. */
  message: string
  start: number
  end: number
  /** Further places the same finding applies to. */
  more?: Range[]
  fix?: LintFix
}
