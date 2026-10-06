/**
 * From a MeSH descriptor to an editable Suchkomponente: which PICO block it
 * usually belongs to (from the MeSH tree), which free-text words go with the
 * heading by default, and how a heading is shown to a German student.
 * Pure functions on plain data, no index access.
 */
import { isMeshAcronym, normalizeMeshTerm, uninvertMeshTerm } from "./mesh-normalize"
import { phraseKey } from "./normalize"
import type { Block, Concept, MeshChoice } from "./types"

/** What a descriptor is, judged by its tree numbers. Drives the default block. */
export type MeshKind =
  | "condition"
  | "person"
  | "intervention"
  | "activity"
  | "drug"
  | "outcome"
  /** Body parts, social terms, disciplines, publication types: too unspecific to add on their own. */
  | "weak"

const MEASURE_NAME = /measurement|evaluation|assessment|\btests?\b|scale|index|questionnaire|score|monitoring|capacity|status/i

const has = (trees: string[], re: RegExp) => trees.some((t) => re.test(t))

export function meshKind(d: Pick<MeshChoice, "name" | "treeNumbers">): MeshKind {
  const t = d.treeNumbers
  if (has(t, /^C/) || has(t, /^F03/) || has(t, /^F01.145/)) return "condition"
  if (has(t, /^D/)) return "drug"
  if (has(t, /^M/)) return "person"
  if (has(t, /^E01/) && !has(t, /^E0[2-7]/)) return MEASURE_NAME.test(d.name) ? "outcome" : "intervention"
  if (has(t, /^E0[2-7]/)) return "intervention"
  if (has(t, /^G11\.427\.410\.698/)) return "activity"
  if (has(t, /^[FGN]/)) return "outcome"
  if (has(t, /^I/) && has(t, /^N/)) return "outcome"
  return "weak"
}

export const KIND_BLOCK: Record<Exclude<MeshKind, "weak">, Block> = {
  condition: "population",
  person: "population",
  intervention: "intervention",
  activity: "intervention",
  drug: "comparison",
  outcome: "outcome",
}

/** Letter of the first tree number ("C23.888" gives "C"), for the category label in the UI. */
export function treeLetters(trees: string[]): string[] {
  return [...new Set(trees.map((t) => t[0]).filter(Boolean))]
}

/**
 * How much a descriptor matters for physiotherapy questions, 0 to 5. Used to
 * pick between several descriptors a German word could mean.
 */
export function treeRelevance(trees: string[]): number {
  const score: Record<string, number> = { C: 5, E: 5, G: 4, F: 4, M: 4, N: 4, A: 3, D: 2, I: 2, H: 1, J: 1, B: 0, V: 0, Z: 0, L: 0 }
  return trees.reduce((best, t) => Math.max(best, score[t[0]] ?? 0), 0)
}

/** "Pain, Low Back" becomes "Low Back Pain". Not inverted headings are returned unchanged. */
export function naturalName(heading: string): string {
  return uninvertMeshTerm(heading) ?? heading
}

/** Name shown as the title of a component: the first German label that is not an abbreviation, else the English name. */
export function descriptorLabel(d: MeshChoice): string {
  return d.german.find((g) => g.length >= 5 && !isMeshAcronym(g)) ?? d.german[0] ?? naturalName(d.name)
}

const MAX_WORDS = 4
const MAX_CHARS = 40
const DEFAULT_SYNONYMS = 6

function usableSynonym(e: string): boolean {
  if (e.includes(",")) return false // "Pain, Radiating": a subtype, not a synonym
  if (/[\d()[\]/\\]/.test(e)) return false
  if (/[^\x20-\x7e]/.test(e)) return false
  if (e.length > MAX_CHARS) return false
  const words = e.trim().split(/\s+/)
  if (words.length > MAX_WORDS) return false
  if (words.length === 1 && e.length > 22) return false // chemical and Latin names
  if (isMeshAcronym(e)) return false // "MS[tiab]" finds milliseconds
  return true
}

/**
 * Free-text words for a descriptor: the heading in natural order plus a handful
 * of entry terms. Skips subtypes ("Mechanical Low Back Pain" is already found by
 * the phrase "low back pain"), permutations of words already chosen, acronyms,
 * chemical-looking and very long terms. At most six; the rest stays available
 * in the entry term list for the user to add.
 */
export function defaultFreeText(d: Pick<MeshChoice, "name" | "entryTerms">, max = DEFAULT_SYNONYMS): string[] {
  const name = naturalName(d.name)
  const chosen: string[] = [name]
  const keys = new Set<string>([phraseKey(name)])
  const nameNorm = normalizeMeshTerm(name)
  for (const e of d.entryTerms) {
    if (chosen.length >= max) break
    if (!usableSynonym(e)) continue
    const norm = normalizeMeshTerm(e)
    if (!norm) continue
    if (` ${norm} `.includes(` ${nameNorm} `)) continue
    if (nameNorm.includes(norm)) continue // a part of the heading ("Habilitation" in "Rehabilitation") is broader, not a synonym
    const key = phraseKey(e)
    const sorted = key.split(" ").sort().join(" ")
    if (keys.has(key) || [...keys].some((k) => k.split(" ").sort().join(" ") === sorted)) continue
    keys.add(key)
    chosen.push(e)
  }
  return chosen
}

/** Entry terms the default selection left out, for "weitere Synonyme". Acronyms and long terms stay out of reach on purpose. */
export function moreSynonyms(d: Pick<MeshChoice, "name" | "entryTerms">, current: string[]): string[] {
  const have = new Set(current.map((c) => phraseKey(c)))
  const out: string[] = []
  for (const e of d.entryTerms) {
    if (e.length > 60 || /[\d]/.test(e)) continue
    const shown = uninvertMeshTerm(e) ?? e
    if (have.has(phraseKey(shown))) continue
    have.add(phraseKey(shown))
    out.push(shown)
  }
  return out
}

export interface DescriptorConceptOptions {
  matchedText?: string
  alternatives?: MeshChoice[]
}

/** A Suchkomponente built from a descriptor of the index. */
export function conceptFromDescriptor(d: MeshChoice, block: Block, opts: DescriptorConceptOptions = {}): Concept {
  return {
    id: `mesh-${d.ui}`,
    termId: null,
    label: descriptorLabel(d),
    block,
    mesh: [{ heading: d.name, explode: true }],
    freeText: defaultFreeText(d).map((text) => ({ text })),
    origin: "mesh",
    matchedText: opts.matchedText,
    descriptor: d,
    alternatives: opts.alternatives?.length ? opts.alternatives : undefined,
  }
}
