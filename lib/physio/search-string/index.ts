/**
 * Public surface of the search-string engine (pure TypeScript, runs in the
 * browser, nothing here talks to a server).
 *
 *   analyzeAsync(input)       question, whole case or task sheet -> concepts (curated + MeSH index), candidates, notices
 *   analyze(input)            the same with the curated terminology only (synchronous, offline)
 *   createModel(analysis)     editable model
 *   edit.*                    removeConcept, moveConcept, toggleExplode, addFreeText, ...
 *   buildQuery(model, db)     model -> string for PubMed, Cochrane, CINAHL or Embase (+ numbered lines) + table rows + notices
 *   lintQuery(string, opts)   "Eigenen String prüfen" (PubMed, Cochrane, CINAHL or Embase, auto-detected) -> findings with fixes
 *   convertToCochrane / convertToPubmed   field tags and MeSH syntax of a pasted string
 *   convertToCinahl / convertToEmbase     a PubMed string in CINAHL or Embase syntax (headings are suggestions)
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
export {
  CINAHL_MIN_STEM,
  CINAHL_SOURCES,
  COCHRANE_ADVANCED_SEARCH_URL,
  COCHRANE_FIELDS,
  COCHRANE_MIN_STEM,
  COCHRANE_SOURCES,
  DATABASES,
  EMBASE_AGE_LIM,
  EMBASE_FIELDS,
  EMBASE_MIN_STEM,
  EMBASE_SEARCH_URL,
  EMBASE_SOURCES,
  EMBASE_STUDY_LIM,
  cinahlMesh,
  embaseMesh,
  emtreeSuggestion,
  LANGUAGES,
  STUDY_TYPE_PT,
  getRenderProfile,
  cleanFreeText,
  stemLength,
  PUBMED_MIN_STEM,
} from "./profiles"
export { buildStrategyLines, strategyText } from "./cochrane"
export type { StrategyOptions } from "./cochrane"
export type { DatabaseInfo, RenderProfile } from "./profiles"
export { lintQuery, applyEdits, applyFix, autoFix, genericLevel } from "./lint"
export type { LintOptions } from "./lint"
export { detectLintDatabase, cinahlSignals } from "./detect"
export type { DetectedDatabase } from "./detect"
export { lintCinahl, CINAHL_FIELD_CODES } from "./lint-cinahl"
export { lintEmbase, EMBASE_FIELD_CODES, EMBASE_LIM_VALUES } from "./lint-embase"
export { convertToCochrane, convertToPubmed } from "./convert"
export { convertToCinahl, convertToEmbase } from "./convert-platforms"
export type { ConvertNote, ConvertResult } from "./convert"
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
