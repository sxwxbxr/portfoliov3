/**
 * The guided mode of the Suchstring-Generator, case-driven: the steps mirror the
 * OST assignment (PICO, Ein- und Ausschlusskriterien, RefHunter steps a to c) and
 * every observation is derived from the student's own case, model and counts.
 * Pure: SearchStringTool builds the context, the panel renders the steps.
 *
 * Anchors (`data-guide` in components/physio/search-string): ss-case (the input), ss-result (the string
 * and the hit count), and the folded areas under it: ss-pico, ss-filters, ss-concepts, ss-mesh, ss-table.
 * A folded area opens itself while its step is the current one (Disclosure reads GuideApi.anchors).
 */
import {
  DATABASES,
  buildQuery,
  selectedDatabases,
  type AnalysisResult,
  type BuiltQuery,
  type Block,
  type CountRow,
  type DatabaseId,
  type PicoInput,
  type SearchModel,
} from "../search-string"
import { guideCopy } from "../copy/guide"
import { evidenceSentence, readCase, type CaseReading } from "./case-reading"
import { readCounts } from "./counts"
import { activeCriteria, resolveCriteria, suggestCriteria, type CriteriaEdits, type Criterion, type ResolvedCriterion } from "./criteria"
import { PICO_KEYS, resolvePico, suggestPico, type PicoEdits, type PicoKey, type PicoSuggestion, type ResolvedPico } from "./pico"
import type { GuideDefinition, GuideObservation, GuideStep } from "./types"
import { buildWorksheet, type Worksheet } from "./worksheet"

const t = guideCopy.suchstring
const obs = t.obs

/** What the student changed on top of the suggestions. Kept in memory, per case. */
export interface WorksheetEdits {
  pico: PicoEdits
  criteria: CriteriaEdits
}

export const EMPTY_EDITS: WorksheetEdits = { pico: {}, criteria: {} }

export interface SuchstringGuideInput {
  mode: "demo" | "full"
  text: string
  pico: PicoInput
  busy: boolean
  analysis: AnalysisResult | null
  model: SearchModel | null
  /** PubMed hit counts from ResultPanel (empty when not counted). */
  counts: CountRow[]
  edits: WorksheetEdits
  /** Today, for the default time span. */
  now: Date
  /** The tool's setters, used by the panels (no-ops in tests). */
  setEdits?: (update: (e: WorksheetEdits) => WorksheetEdits) => void
  resetEdits?: () => void
}

export interface BuiltFor {
  id: DatabaseId
  label: string
  built: BuiltQuery
}

export interface SuchstringGuideCtx extends SuchstringGuideInput {
  hasCase: boolean
  reading: CaseReading
  suggestion: PicoSuggestion
  resolved: ResolvedPico
  suggestedCriteria: Criterion[]
  criteria: ResolvedCriterion[]
  databases: DatabaseId[]
  builds: BuiltFor[]
  /** The first selected database. */
  built: BuiltQuery | null
  pubmed: BuiltQuery | null
}

export const dbLabel = (id: DatabaseId): string => DATABASES.find((d) => d.id === id)?.label ?? id

export function buildFor(model: SearchModel | null): { databases: DatabaseId[]; builds: BuiltFor[] } {
  if (!model) return { databases: [], builds: [] }
  const databases = selectedDatabases(model)
  const builds: BuiltFor[] = []
  for (const id of databases) {
    try {
      builds.push({ id, label: dbLabel(id), built: buildQuery(model, id) })
    } catch {
      /* a database without a profile yet: the other agent's engine decides what is available */
    }
  }
  return { databases, builds }
}

export function makeSuchstringCtx(input: SuchstringGuideInput): SuchstringGuideCtx {
  const reading = readCase({ text: input.text, pico: input.pico, analysis: input.analysis })
  const suggestion = suggestPico(reading, input.pico)
  const pico = resolvePico(suggestion, input.edits.pico)
  const suggestedCriteria = suggestCriteria({ reading, pico, studyTypes: input.analysis?.studyTypes ?? [], now: input.now })
  const criteria = resolveCriteria(suggestedCriteria, input.edits.criteria)
  const { databases, builds } = buildFor(input.model)
  return {
    ...input,
    hasCase: !!input.model,
    reading,
    suggestion,
    resolved: pico,
    suggestedCriteria,
    criteria,
    databases,
    builds,
    built: builds[0]?.built ?? null,
    pubmed: builds.find((b) => b.id === "pubmed")?.built ?? null,
  }
}

export function worksheetOf(ctx: SuchstringGuideCtx): Worksheet {
  return buildWorksheet({
    date: ctx.now.toISOString().slice(0, 10),
    caseText: ctx.text,
    pico: ctx.resolved,
    criteria: ctx.criteria,
    built: ctx.builds.map((b) => ({ label: b.label, built: b.built })),
    counts: ctx.counts.map((r) => ({ id: r.id, count: r.count })),
  })
}

/* ── Observations ────────────────────────────────────────────────── */

const o = (text: string, label?: string, tone: GuideObservation["tone"] = "info"): GuideObservation => ({ text, label, tone })

const capitalise = (words: string[]) => words.map((w) => w.charAt(0).toUpperCase() + w.slice(1))

function waiting(ctx: SuchstringGuideCtx): GuideObservation[] | null {
  if (ctx.model) return null
  return [o(ctx.busy ? obs.busy : obs.empty, undefined, "info")]
}

function observeCase(ctx: SuchstringGuideCtx): GuideObservation[] {
  const w = waiting(ctx)
  if (w) return w
  const r = ctx.reading
  const out: GuideObservation[] = []
  if (r.empty) out.push(o(obs.nothingFound, undefined, "warn"))
  if (r.age) out.push(o(obs.age(r.age.years, r.age.group, r.age.evidence), obs.ageLabel))
  if (r.sex) out.push(o(`${obs.sex(r.sex.value, r.sex.evidence)}. ${obs.sexNote}`, obs.sexLabel))
  if (r.groups.length) out.push(o(obs.groups(r.groups), obs.groupsLabel))
  if (r.conditions.length) out.push(o(obs.conditions(r.conditions), obs.conditionsLabel))
  if (r.duration) out.push(o(obs.duration(r.duration, r.chronicity), obs.durationLabel))
  if (r.radiating) out.push(o(obs.radiating, obs.radiatingLabel))
  if (r.interventions.length) out.push(o(obs.interventions(r.interventions), obs.interventionsLabel))
  else out.push(o(obs.noIntervention, obs.interventionsLabel, "warn"))
  if (r.goals.length) out.push(o(obs.goals(r.goals), obs.goalsLabel))
  if (r.outcomes.length) out.push(o(obs.outcomes(r.outcomes), obs.outcomesLabel))
  if (r.comparisons.length) out.push(o(obs.comparisons(r.comparisons), obs.comparisonsLabel))
  else out.push(o(obs.noComparison, obs.comparisonsLabel))
  if (r.ignored.length) out.push(o(obs.ignored(r.ignored), obs.ignoredLabel))
  if (r.unmapped.length) out.push(o(obs.unmapped(capitalise(r.unmapped)), obs.unmappedLabel))
  return out
}

const PICO_BLOCK: Record<PicoKey, Block> = { P: "population", I: "intervention", C: "comparison", O: "outcome" }

function observePico(ctx: SuchstringGuideCtx): GuideObservation[] {
  const w = waiting(ctx)
  if (w) return w
  const p = ctx.resolved
  const r = ctx.reading
  const out: GuideObservation[] = []
  const evidenceFor: Record<PicoKey, string | null> = {
    P: r.conditions[0] ? evidenceSentence(ctx.text, r.conditions[0].matched) : null,
    I: r.interventions[0] ? evidenceSentence(ctx.text, r.interventions[0].matched) : null,
    C: r.comparisons[0] ? evidenceSentence(ctx.text, r.comparisons[0].matched) : null,
    O: r.goals[0]?.sentence ?? null,
  }
  for (const k of PICO_KEYS) {
    const c = p.cells[k]
    if (k === "C" && !c.text.trim()) {
      out.push(o(obs.picoCMissing, k, "warn"))
      continue
    }
    const base = obs.picoCell(c.basis, c.source, c.edited)
    const ev = !c.edited && evidenceFor[k] ? ` ${obs.picoEvidence(evidenceFor[k]!)}` : ""
    out.push(o(`${base}${ev}`, k, c.text.trim() ? "info" : "warn"))
  }
  const missing = PICO_KEYS.filter((k) => k !== "C" && !p.cells[k].text.trim()).map((k) => guideCopy.suchstring.panels.pico.letters[k].label)
  out.push(missing.length ? o(obs.picoMissing(missing), undefined, "warn") : o(obs.picoOk, undefined, "good"))
  if (p.question.edited) out.push(o(obs.picoQuestionEdited))
  out.push(o(obs.picoGrammar))
  return out
}

function filterStateOf(ctx: SuchstringGuideCtx, criterion: ResolvedCriterion): boolean {
  const f = ctx.model?.filters
  if (!f || !criterion.filter) return false
  switch (criterion.filter) {
    case "studyTypes":
      return f.studyTypes.length > 0
    case "language":
      return !!f.language
    case "years":
      return f.yearFrom !== null || f.yearTo !== null
    case "humans":
      return f.humansOnly
    case "age":
      return f.ageGroups.length > 0
  }
}

const FILTER_NAME: Record<string, string> = { studyTypes: "Studientyp", language: "Sprache", years: "Erscheinungsjahr", humans: "Nur Studien am Menschen", age: "Alter" }

function observeCriteria(ctx: SuchstringGuideCtx): GuideObservation[] {
  const w = waiting(ctx)
  if (w) return w
  const active = activeCriteria(ctx.criteria)
  const inc = active.filter((c) => c.kind === "include").length
  const exc = active.filter((c) => c.kind === "exclude").length
  const out: GuideObservation[] = []
  if (!active.length) {
    out.push(o(obs.criteriaNone, undefined, "warn"))
  } else {
    out.push(o(obs.criteriaCount(inc, exc)))
    const filterable = active.filter((c) => c.where !== "screening")
    const screening = active.filter((c) => c.where === "screening")
    if (screening.length) out.push(o(obs.criteriaScreeningOnly(screening.length)))
    const unset = filterable.filter((c) => c.filter && !filterStateOf(ctx, c))
    const set = filterable.filter((c) => c.filter && filterStateOf(ctx, c))
    if (set.length) out.push(o(obs.criteriaFilterSet(set.map((c) => FILTER_NAME[c.filter!])), undefined, "good"))
    if (unset.length) out.push(o(obs.criteriaFilterMissing(unset.map((c) => FILTER_NAME[c.filter!]))))
  }
  const demo = ctx.analysis?.filterSuggestions ?? []
  if (demo.length) {
    const parts = demo.map((d) => (d.kind === "age" ? `Alter («${d.evidence}»)` : `Geschlecht («${d.evidence}»)`))
    out.push(o(obs.criteriaDemographics(parts)))
  }
  if (ctx.builds.length) out.push(o(obs.criteriaDatabases(ctx.builds.map((b) => b.label))))
  return out
}

function componentsOf(model: SearchModel, block: Block) {
  return model.concepts.filter((c) => c.block === block)
}

function observeComponents(ctx: SuchstringGuideCtx): GuideObservation[] {
  const w = waiting(ctx)
  if (w) return w
  const model = ctx.model!
  const out: GuideObservation[] = []
  const labels: Record<Block, string> = { population: "P", intervention: "I", comparison: "C", outcome: "O" }
  for (const b of ["population", "intervention", "comparison", "outcome"] as Block[]) {
    const cs = componentsOf(model, b)
    const off = !model.includedBlocks[b] && cs.length > 0
    const names = cs.map((c) => c.label)
    out.push(o(`${names.length ? names.join(", ") : obs.mappingEmpty}${off ? " (nicht im String)" : ""}`, `${labels[b]} →`, names.length || b === "comparison" ? "info" : "warn"))
  }
  const cmp = componentsOf(model, "comparison")
  if (cmp.length && !model.includedBlocks.comparison) out.push(o(obs.comparisonOff(cmp.map((c) => c.label))))
  else if (cmp.length) out.push(o(obs.comparisonOn(cmp.map((c) => c.label)), undefined, "warn"))

  const built = ctx.built
  const noMesh = (built?.components ?? []).filter((c) => !c.schlagworte.length).map((c) => c.label)
  if (noMesh.length) out.push(o(obs.noMesh(noMesh)))

  // PICO parts without a component
  const uncovered: string[] = []
  let painNote = false
  for (const k of ["P", "I", "O"] as PicoKey[]) {
    const text = ctx.resolved.cells[k].text.trim()
    if (!text || componentsOf(model, PICO_BLOCK[k]).length) continue
    if (k === "O" && /^schmerz\w*$/i.test(text.replace(/\s/g, "")) && model.concepts.some((c) => c.block === "population" && c.freeText.some((f) => /pain/i.test(f.text)))) painNote = true
    else uncovered.push(`${k} (${text})`)
  }
  if (uncovered.length) out.push(o(obs.picoUncovered(uncovered), undefined, "warn"))
  if (painNote) out.push(o(obs.painInCondition))

  const n = built?.components.length ?? 0
  if (n) out.push(n > 4 ? o(obs.many(n), undefined, "warn") : o(obs.fine(n), undefined, "good"))
  if (ctx.reading.unmapped.length) out.push(o(obs.unmapped(capitalise(ctx.reading.unmapped)), obs.unmappedLabel))
  return out
}

function truncationHints(model: SearchModel): string[] {
  const hints: string[] = []
  for (const c of model.concepts) {
    if (!model.includedBlocks[c.block]) continue
    for (const f of c.freeText) {
      if (f.removed || f.trunc || f.text.includes("*")) continue
      const last = f.text.trim().split(/\s+/).pop() ?? ""
      if (/ing$/i.test(last) && last.length >= 7) hints.push(`${f.text.trim().slice(0, -3)}*`)
    }
  }
  return [...new Set(hints)].slice(0, 3)
}

function observeTerms(ctx: SuchstringGuideCtx): GuideObservation[] {
  const w = waiting(ctx)
  if (w) return w
  const built = ctx.built
  if (!built || built.empty) return [o(obs.nothingFound, undefined, "warn")]
  const out: GuideObservation[] = []
  const mesh = built.components.reduce((n, c) => n + c.schlagworte.length, 0)
  const text = built.components.reduce((n, c) => n + c.stichworte.length, 0)
  out.push(o(obs.termsCounts(mesh, text)))
  for (const c of ctx.reading.conditions.concat(ctx.reading.groups, ctx.reading.interventions).slice(0, 3)) {
    const comp = built.components.find((x) => x.conceptId === c.id)
    if (comp && c.matched) out.push(o(obs.termsGerman(c.matched, comp.schlagworte[0] ?? null, comp.stichworte[0] ?? null), "Deutsch → Englisch"))
  }
  const noMesh = built.components.filter((c) => !c.schlagworte.length).map((c) => c.label)
  if (noMesh.length) out.push(o(obs.termsMissingMesh(noMesh), undefined, "warn"))
  for (const c of built.components) {
    const n = c.stichworte.length + c.schlagworte.length
    if (n >= 12) out.push(o(obs.termsBroad(c.label, n)))
  }
  const hints = ctx.model ? truncationHints(ctx.model) : []
  if (hints.length) out.push(o(obs.termsTrunc(hints)))
  return out
}

function observeString(ctx: SuchstringGuideCtx): GuideObservation[] {
  const w = waiting(ctx)
  if (w) return w
  const built = ctx.built
  if (!built || built.empty) return [o(obs.nothingFound, undefined, "warn")]
  const out: GuideObservation[] = []
  out.push(o(obs.stringGroups(built.components.length), obs.groupLabel))
  built.components.slice(0, 6).forEach((c, i) => out.push(o(obs.group(i + 1, c.label, c.schlagworte.length, c.stichworte.length))))
  out.push(o(obs.combine))
  const first = built.components[0]
  if (first?.parts?.length) {
    const meshSample = first.schlagworte.length ? first.parts[0] : null
    const textSample = first.parts[first.schlagworte.length] ?? null
    out.push(o(`${obs.sample(meshSample, textSample)}. ${obs.sampleNote}`, obs.sampleLabel))
  }
  const allParts = built.components.flatMap((c) => c.parts ?? [])
  const phrases = allParts.filter((p) => /["][^"]*\s[^"]*["]/.test(p) || /^"/.test(p))
  if (phrases.length) out.push(o(obs.phrases(phrases.length, phrases[0]), obs.phrasesLabel))
  const trunc = allParts.filter((p) => p.includes("*"))
  out.push(trunc.length ? o(obs.trunc(trunc.slice(0, 3)), obs.truncLabel) : o(obs.noTrunc, obs.truncLabel))
  out.push(built.filterClauses.length ? o(obs.filters(built.filterClauses), obs.filtersLabel) : o(obs.noFilters, obs.filtersLabel))
  for (const b of ctx.builds) {
    if (b.built.lines?.length) out.push(o(`${b.label}: ${obs.lines(b.built.lines.length)}`, obs.linesLabel))
  }
  out.push(o(obs.database(ctx.builds.map((b) => b.label).join(" und ")), obs.databaseLabel))
  return out
}

function observeCheck(ctx: SuchstringGuideCtx): GuideObservation[] {
  const w = waiting(ctx)
  if (w) return w
  const out: GuideObservation[] = []
  const others = ctx.builds.filter((b) => b.id !== "pubmed")
  if (!ctx.pubmed) {
    out.push(o(obs.checkOther(ctx.builds.map((b) => b.label).join(" und ") || "der Datenbank")))
    out.push(o(obs.checkOtherSteps))
    out.push(o(obs.checkReference))
    return out
  }
  const reading = readCounts(ctx.counts, ctx.pubmed)
  if (reading.state === "none") out.push(o(obs.checkNone))
  else {
    if (reading.state === "partial") out.push(o(obs.checkPartial(ctx.counts.filter((r) => r.count !== null).length), undefined, "warn"))
    if (reading.error) out.push(o(obs.checkError, undefined, "warn"))
    if (reading.components.length) out.push(o(obs.checkComponents(reading.components), obs.checkComponentsLabel))
    if (reading.total !== null) {
      out.push(o(obs.checkTotal(reading.total), undefined, reading.verdict === "ok" ? "good" : "warn"))
      switch (reading.verdict) {
        case "zero": {
          out.push(o(obs.checkZero(reading.narrowest, reading.empty.map((c) => c.label)), undefined, "warn"))
          const optional = reading.components.filter((c) => c.block === "population" || c.block === "comparison").map((c) => c.label)
          out.push(o(obs.checkZeroAdvice(reading.narrowest?.label ?? null, optional)))
          break
        }
        case "few":
          out.push(o(obs.checkFew(reading.total, reading.narrowest?.label ?? null)))
          break
        case "many":
          out.push(o(obs.checkMany(reading.total, reading.widest?.label ?? null)))
          break
        default:
          out.push(o(obs.checkOk(reading.total)))
      }
    }
  }
  for (const b of others) out.push(o(obs.checkOther(b.label), b.label))
  out.push(o(obs.checkReference))
  return out
}

function observeWorksheet(ctx: SuchstringGuideCtx): GuideObservation[] {
  const w = waiting(ctx)
  if (w) return w
  const ws = worksheetOf(ctx)
  const open: string[] = []
  if (!ws.question) open.push(obs.worksheetNoQuestion)
  if (!ws.pico.C) open.push(obs.worksheetNoComparison)
  if (!ws.include.length && !ws.exclude.length) open.push(obs.worksheetNoCriteria)
  if (ws.empty) open.push(obs.worksheetNoComponents)
  const out = [o(obs.worksheetContents(ws.include.length + ws.exclude.length, ws.components.length))]
  if (open.length) out.push(o(obs.worksheetOpen(open), undefined, "warn"))
  out.push(o(obs.worksheetDraft))
  return out
}

/* ── Definition ──────────────────────────────────────────────────── */

const steps: GuideStep<SuchstringGuideCtx>[] = [
  {
    id: "case",
    title: t.steps.case.title,
    anchor: "ss-case",
    body: t.steps.case.body,
    observe: observeCase,
    ready: (c) => !!c.model,
    action: (c) => (c.mode === "demo" ? t.steps.case.actionDemo : t.steps.case.actionFull),
  },
  {
    id: "pico",
    title: t.steps.pico.title,
    anchor: "ss-pico",
    body: t.steps.pico.body,
    observe: observePico,
    ready: (c) => !!c.model && c.resolved.complete,
    action: t.steps.pico.action,
    panel: "pico",
  },
  {
    id: "criteria",
    title: t.steps.criteria.title,
    anchor: "ss-filters",
    body: t.steps.criteria.body,
    observe: observeCriteria,
    ready: (c) => !!c.model && activeCriteria(c.criteria).length > 0,
    action: t.steps.criteria.action,
    panel: "criteria",
  },
  {
    id: "components",
    title: t.steps.components.title,
    anchor: "ss-concepts",
    body: t.steps.components.body,
    observe: observeComponents,
    ready: (c) => !!c.built && !c.built.empty,
    action: t.steps.components.action,
  },
  {
    id: "terms",
    title: t.steps.terms.title,
    anchor: ["ss-concepts", "ss-mesh", "ss-table"],
    body: t.steps.terms.body,
    observe: observeTerms,
    ready: (c) => !!c.built && !c.built.empty,
    action: t.steps.terms.action,
    panel: "terms",
  },
  {
    id: "string",
    title: t.steps.string.title,
    anchor: "ss-result",
    body: t.steps.string.body,
    observe: observeString,
    ready: (c) => !!c.built && !c.built.empty,
    action: t.steps.string.action,
  },
  {
    id: "check",
    title: t.steps.check.title,
    anchor: "ss-result",
    body: t.steps.check.body,
    observe: observeCheck,
    action: (c) => (c.pubmed ? t.steps.check.actionPubmed : t.steps.check.actionOther(c.builds.map((b) => b.label).join(" / ") || "der Datenbank")),
  },
  {
    id: "worksheet",
    title: t.steps.worksheet.title,
    anchor: [],
    body: t.steps.worksheet.body,
    observe: observeWorksheet,
    action: t.steps.worksheet.action,
    panel: "worksheet",
  },
]

export const suchstringGuide: GuideDefinition<SuchstringGuideCtx> = {
  id: "suchstring.generate",
  toolSlug: "suchstring",
  steps,
  notice: (c) => (c.mode === "demo" ? guideCopy.panel.demoNotice : null),
  onRestart: (c) => c.resetEdits?.(),
}
