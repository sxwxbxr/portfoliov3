/**
 * Immutable edit operations on the search model. Every UI action goes through
 * one of these, so the same rules are tested without React.
 */
import { analyze, conceptFromTerm, TERMINOLOGY } from "./parser"
import { cleanFreeText } from "./profiles"
import { normalizeText } from "./normalize"
import type { AnalysisResult, Block, Concept, Filters, SearchModel, StudyTypeId, Terminology } from "./types"

export const DEFAULT_FILTERS: Filters = { language: "", yearFrom: null, yearTo: null, studyTypes: [], humansOnly: false }

export function createModel(analysis: AnalysisResult, filters: Partial<Filters> = {}): SearchModel {
  return {
    concepts: analysis.concepts.map((c) => ({ ...c, mesh: c.mesh.map((m) => ({ ...m })), freeText: c.freeText.map((f) => ({ ...f })) })),
    filters: { ...DEFAULT_FILTERS, studyTypes: analysis.studyTypes, ...filters },
    includedBlocks: { population: true, intervention: true, comparison: false, outcome: true },
  }
}

/** Convenience for tests and callers without UI: question in, model out. */
export function modelFromText(text: string, filters: Partial<Filters> = {}): SearchModel {
  return createModel(analyze({ text }), filters)
}

function mapConcept(model: SearchModel, id: string, fn: (c: Concept) => Concept): SearchModel {
  return { ...model, concepts: model.concepts.map((c) => (c.id === id ? fn(c) : c)) }
}

export function removeConcept(model: SearchModel, id: string): SearchModel {
  return { ...model, concepts: model.concepts.filter((c) => c.id !== id) }
}

export function moveConcept(model: SearchModel, id: string, block: Block): SearchModel {
  return mapConcept(model, id, (c) => ({ ...c, block }))
}

export function setMeshRemoved(model: SearchModel, conceptId: string, heading: string, removed: boolean): SearchModel {
  return mapConcept(model, conceptId, (c) => ({
    ...c,
    mesh: c.mesh.map((m) => (m.heading === heading ? { ...m, removed } : m)),
  }))
}

export function toggleExplode(model: SearchModel, conceptId: string, heading: string): SearchModel {
  return mapConcept(model, conceptId, (c) => ({
    ...c,
    mesh: c.mesh.map((m) => (m.heading === heading ? { ...m, explode: !m.explode } : m)),
  }))
}

/** Removing a shipped synonym keeps it listed (restorable). Removing a custom one deletes it. */
export function setFreeTextRemoved(model: SearchModel, conceptId: string, text: string, removed: boolean): SearchModel {
  return mapConcept(model, conceptId, (c) => ({
    ...c,
    freeText: removed
      ? c.freeText.flatMap((f) => (f.text !== text ? [f] : f.custom ? [] : [{ ...f, removed: true }]))
      : c.freeText.map((f) => (f.text === text ? { ...f, removed: false } : f)),
  }))
}

export type FreeTextCheck = { ok: true; text: string } | { ok: false; error: string }

/** Checks a user-typed free-text term. Quotes and brackets are stripped, operators are refused. */
export function checkFreeText(raw: string): FreeTextCheck {
  const text = cleanFreeText(raw)
  if (!text) return { ok: false, error: "Das Stichwort ist leer." }
  if (text.length > 80) return { ok: false, error: "Das Stichwort ist zu lang. Ein Stichwort ist ein Wort oder eine kurze Phrase." }
  if (/(^|\s)(AND|OR|NOT)(\s|$)/.test(text)) {
    return { ok: false, error: "Operatoren wie AND und OR gehören nicht in ein Stichwort. Füge jedes Wort einzeln hinzu." }
  }
  if (/[;:]/.test(text)) return { ok: false, error: "Doppelpunkt und Semikolon sind in einem Stichwort nicht erlaubt." }
  return { ok: true, text }
}

export function addFreeText(model: SearchModel, conceptId: string, raw: string): { model: SearchModel; error?: string } {
  const checked = checkFreeText(raw)
  if (!checked.ok) return { model, error: checked.error }
  const key = normalizeText(checked.text)
  const concept = model.concepts.find((c) => c.id === conceptId)
  if (!concept) return { model, error: "Diese Komponente gibt es nicht mehr." }
  const existing = concept.freeText.find((f) => normalizeText(f.text) === key)
  if (existing && !existing.removed) return { model, error: "Dieses Stichwort steht schon in der Komponente." }
  return {
    model: mapConcept(model, conceptId, (c) => ({
      ...c,
      freeText: existing
        ? c.freeText.map((f) => (f === existing ? { ...f, removed: false } : f))
        : [...c.freeText, { text: checked.text, custom: true }],
    })),
  }
}

function nextCustomId(model: SearchModel): string {
  let n = 1
  while (model.concepts.some((c) => c.id === `custom-${n}`)) n++
  return `custom-${n}`
}

/** A new Suchkomponente from the user's own words (also used for unmapped candidates). */
export function addCustomConcept(model: SearchModel, label: string, block: Block): { model: SearchModel; error?: string } {
  const checked = checkFreeText(label)
  if (!checked.ok) return { model, error: checked.error }
  const concept: Concept = {
    id: nextCustomId(model),
    termId: null,
    label: checked.text,
    block,
    mesh: [],
    freeText: [{ text: checked.text, custom: true }],
    origin: "custom",
  }
  return { model: { ...model, concepts: [...model.concepts, concept] } }
}

export function addConceptFromTerminology(
  model: SearchModel,
  termId: string,
  block?: Block,
  terminology: Terminology = TERMINOLOGY,
): SearchModel {
  if (model.concepts.some((c) => c.id === termId)) return model
  const term = terminology.concepts.find((t) => t.id === termId)
  if (!term || term.category === "studytype") return model
  const defaultBlock: Block = term.category === "setting" ? "population" : (term.category as Block)
  return { ...model, concepts: [...model.concepts, conceptFromTerm(term, block ?? defaultBlock)] }
}

export function setFilters(model: SearchModel, patch: Partial<Filters>): SearchModel {
  return { ...model, filters: { ...model.filters, ...patch } }
}

export function toggleStudyType(model: SearchModel, id: StudyTypeId): SearchModel {
  const has = model.filters.studyTypes.includes(id)
  return setFilters(model, { studyTypes: has ? model.filters.studyTypes.filter((t) => t !== id) : [...model.filters.studyTypes, id] })
}

export function setBlockIncluded(model: SearchModel, block: Block, included: boolean): SearchModel {
  return { ...model, includedBlocks: { ...model.includedBlocks, [block]: included } }
}
