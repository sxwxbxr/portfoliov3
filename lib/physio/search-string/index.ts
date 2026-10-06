/**
 * Public surface of the search-string engine (pure TypeScript, runs in the
 * browser, nothing here talks to a server).
 *
 *   analyzeAsync(input)       question, whole case or task sheet -> concepts (curated + MeSH index), candidates, notices
 *   analyze(input)            the same with the curated terminology only (synchronous, offline)
 *   createModel(analysis)     editable model
 *   edit.*                    removeConcept, moveConcept, toggleExplode, addFreeText, ...
 *   buildQuery(model)         model -> PubMed string + table rows + notices
 *   lintQuery(string)         "Eigenen String prüfen" -> findings with fixes
 *   applyFix / autoFix        repair a string from lint findings
 *   exportText / exportJson   downloads
 */
import examplesJson from "./examples.json"
import type { Filters, PicoInput } from "./types"

export * from "./types"
export { normalizeText, tokenize, stemToken, phraseKey, isStopword } from "./normalize"
export { analyze, splitExplicit, conceptFromTerm, cleanTaskText, prepareUnits, TERMINOLOGY } from "./parser"
export { analyzeAsync } from "./pipeline"
export type { AnalyzeOptions } from "./pipeline"
export {
  conceptFromDescriptor,
  defaultFreeText,
  descriptorLabel,
  meshKind,
  moreSynonyms,
  naturalName,
  treeLetters,
} from "./mesh-concepts"
export { extractDemographics, ageGroupFor } from "./demographics"
export { germanForms, isNoiseWord } from "./german"
export { PUBMED_TOOL, createPubMedCounter, countRows, getPubMedCounter, pubmedSearchUrl, PubMedError } from "./pubmed"
export type { CountRow, PubMedCounter, PubMedErrorCode } from "./pubmed"
export { buildQuery, BLOCK_LABEL, MANY_COMPONENTS } from "./query-builder"
export { DATABASES, LANGUAGES, STUDY_TYPE_PT, getRenderProfile, cleanFreeText, stemLength, PUBMED_MIN_STEM } from "./profiles"
export type { DatabaseInfo, RenderProfile } from "./profiles"
export { lintQuery, applyEdits, applyFix, autoFix, genericLevel } from "./lint"
export * from "./edit"
export { exportText, exportJson, DRAFT_NOTE } from "./export"

export interface ExampleTask {
  id: string
  title: string
  description: string
  /** What goes into the question box. */
  text: string
  pico?: PicoInput
  filters?: Partial<Filters>
  /** A hand-written string with typical mistakes, for the lint demo. */
  studentSearchString?: string
}

export const EXAMPLES = examplesJson as ExampleTask[]

/** The OST student string with typical errors (Herr Müller case). */
export const STUDENT_SEARCH_STRING = EXAMPLES.find((e) => e.id === "mueller")?.studentSearchString ?? ""
