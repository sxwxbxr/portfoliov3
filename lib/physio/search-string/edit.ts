/**
 * Immutable edit operations on the search model. Every UI action goes through
 * one of these, so the same rules are tested without React.
 */
import { conceptFromDescriptor, defaultFreeText, descriptorLabel, naturalName } from "./mesh-concepts"
import { analyze, conceptFromTerm, TERMINOLOGY } from "./parser"
import { DATABASES, cleanFreeText } from "./profiles"
import { normalizeText } from "./normalize"
import type { AnalysisResult, Block, Concept, DatabaseId, Filters, MeshChoice, SearchModel, StudyTypeId, Terminology } from "./types"

export const DEFAULT_FILTERS: Filters = {
  language: "",
  yearFrom: null,
  yearTo: null,
  studyTypes: [],
  humansOnly: false,
  ageGroups: [],
  sex: "",
}

export function createModel(analysis: AnalysisResult, filters: Partial<Filters> = {}): SearchModel {
  return {
    concepts: analysis.concepts.map((c) => ({ ...c, mesh: c.mesh.map((m) => ({ ...m })), freeText: c.freeText.map((f) => ({ ...f })) })),
    filters: { ...DEFAULT_FILTERS, studyTypes: analysis.studyTypes, ...filters },
    includedBlocks: { population: true, intervention: true, comparison: false, outcome: true },
    databases: ["pubmed"],
  }
}

/** The databases the result is written for: available ones only, in picker order, PubMed when nothing is set. */
export function selectedDatabases(model: SearchModel): DatabaseId[] {
  const wanted = model.databases ?? ["pubmed"]
  const chosen = DATABASES.filter((d) => d.available && wanted.includes(d.id)).map((d) => d.id)
  return chosen.length ? chosen : ["pubmed"]
}

/** Switches one database on or off. The last remaining database cannot be switched off. */
export function toggleDatabase(model: SearchModel, id: DatabaseId): SearchModel {
  const current = selectedDatabases(model)
  const next = current.includes(id) ? current.filter((d) => d !== id) : [...current, id]
  if (!next.length) return model
  return { ...model, databases: DATABASES.filter((d) => next.includes(d.id)).map((d) => d.id) }
}

/** Replaces the selection (a single database: "switch"). Unavailable databases are ignored. */
export function setDatabases(model: SearchModel, ids: DatabaseId[]): SearchModel {
  const next = DATABASES.filter((d) => d.available && ids.includes(d.id)).map((d) => d.id)
  return next.length ? { ...model, databases: next } : model
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

/* ── MeSH-backed edits ─────────────────────────────────────────── */

/** Adds a Suchkomponente built from a MeSH descriptor (MeSH browser, "als Komponente übernehmen"). Same descriptor twice: no change. */
export function addMeshConcept(
  model: SearchModel,
  descriptor: MeshChoice,
  block: Block,
  matchedText?: string,
): { model: SearchModel; added: boolean } {
  const id = `mesh-${descriptor.ui}`
  if (model.concepts.some((c) => c.id === id || c.descriptor?.ui === descriptor.ui)) return { model, added: false }
  return { model: { ...model, concepts: [...model.concepts, conceptFromDescriptor(descriptor, block, { matchedText })] }, added: true }
}

/**
 * Switches an ambiguous MeSH concept to one of its alternatives. The block and the
 * position stay, the heading and the default synonyms come from the new descriptor,
 * and the previous descriptor becomes an alternative.
 */
export function switchMeshAlternative(model: SearchModel, conceptId: string, ui: string): SearchModel {
  return {
    ...model,
    concepts: model.concepts.map((c) => {
      if (c.id !== conceptId || c.origin !== "mesh" || !c.descriptor) return c
      const next = c.alternatives?.find((a) => a.ui === ui)
      if (!next) return c
      const alternatives = [c.descriptor, ...(c.alternatives ?? []).filter((a) => a.ui !== ui)]
      return { ...conceptFromDescriptor(next, c.block, { matchedText: c.matchedText, alternatives }) }
    }),
  }
}

/**
 * Replaces one MeSH heading of a concept by another descriptor (broader or narrower term from the tree).
 * Keeps the explode setting. The new heading's natural name is added as a synonym when it is not there yet.
 * For a concept that was built from the replaced descriptor itself (origin "mesh"), the descriptor follows.
 */
export function replaceMeshHeading(model: SearchModel, conceptId: string, oldHeading: string, next: MeshChoice): SearchModel {
  return mapConcept(model, conceptId, (c) => {
    if (!c.mesh.some((m) => m.heading === oldHeading) || c.mesh.some((m) => m.heading === next.name && m.heading !== oldHeading)) return c
    const mesh = c.mesh.map((m) => (m.heading === oldHeading ? { ...m, heading: next.name, removed: false } : m))
    const name = naturalName(next.name)
    const has = c.freeText.some((f) => normalizeText(f.text) === normalizeText(name) && !f.removed)
    const freeText = has
      ? c.freeText
      : [...c.freeText.filter((f) => normalizeText(f.text) !== normalizeText(name)), { text: name, custom: true }]
    if (c.origin !== "mesh") return { ...c, mesh, freeText }
    // A MeSH-built concept follows its heading: title, definition and synonym list come from the new descriptor.
    return { ...c, mesh, freeText, descriptor: next, label: descriptorLabel(next), alternatives: undefined }
  })
}

/** Offers or removes a trailing * on one free-text term. A term that already ends in * is left as typed. */
export function toggleTruncation(model: SearchModel, conceptId: string, text: string): SearchModel {
  return mapConcept(model, conceptId, (c) => ({
    ...c,
    freeText: c.freeText.map((f) => (f.text === text && !f.text.includes("*") ? { ...f, trunc: !f.trunc } : f)),
  }))
}

/** True when the default synonyms of a MeSH concept are still the shipped selection (nothing edited). */
export function hasDefaultSynonyms(c: Concept): boolean {
  if (!c.descriptor) return false
  const def = defaultFreeText(c.descriptor)
  return c.freeText.length === def.length && c.freeText.every((f, i) => f.text === def[i] && !f.removed && !f.custom)
}

export function toggleAgeGroup(model: SearchModel, group: string): SearchModel {
  const has = model.filters.ageGroups.includes(group)
  return setFilters(model, { ageGroups: has ? model.filters.ageGroups.filter((g) => g !== group) : [...model.filters.ageGroups, group] })
}

/* ── Subject-heading suggestions (CINAHL, Embase) ───────────────── */

/** Databases whose headings are suggestions derived from MeSH (CINAHL Headings, Emtree) and can be left out. */
export function headingOptionDatabases(): DatabaseId[] {
  return DATABASES.filter((d) => d.available && d.headingSuggestions).map((d) => d.id)
}

/** True when the string for this database contains headings. PubMed and Cochrane always do (MeSH is their own vocabulary). */
export function headingsEnabled(model: SearchModel, id: DatabaseId): boolean {
  return !headingOptionDatabases().includes(id) || !(model.headingsOff ?? []).includes(id)
}

/** Switches the subject-heading suggestions of one database on or off. Off means free text only. Other databases are ignored. */
export function setHeadings(model: SearchModel, id: DatabaseId, on: boolean): SearchModel {
  if (!headingOptionDatabases().includes(id)) return model
  const off = (model.headingsOff ?? []).filter((d) => d !== id)
  return { ...model, headingsOff: on ? off : [...off, id] }
}
