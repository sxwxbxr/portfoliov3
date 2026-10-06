/**
 * "PICO formulieren": a PICO table pre-filled from the student's case, and a
 * Fragestellung built from it. Rule-based. The student edits everything; an edit
 * is stored as an override, so a new analysis of the same case never clobbers it.
 */
import type { PicoInput } from "../search-string"
import type { CaseReading, ReadConcept } from "./case-reading"

export type PicoKey = "P" | "I" | "C" | "O"
export const PICO_KEYS: readonly PicoKey[] = ["P", "I", "C", "O"]

export const PICO_FIELD: Record<PicoKey, keyof PicoInput> = {
  P: "population",
  I: "intervention",
  C: "comparison",
  O: "outcome",
}

export interface PicoCell {
  /** Text for the table cell. */
  text: string
  /** "typed": the student's own PICO field. "case": built from the case. "none": nothing found. */
  source: "typed" | "case" | "none"
  /** Parts the text was built from, for the "Bei deinem Fall" lines. */
  basis: string[]
}

export type PicoSuggestion = Record<PicoKey, PicoCell>

export const PLURAL_CONDITION: Record<string, string> = {
  "low-back-pain": "Rückenschmerzen im unteren Rücken (LWS)",
  "back-pain": "Rückenschmerzen",
  "neck-pain": "Nackenschmerzen",
  "shoulder-pain": "Schulterschmerzen",
}

const QUALIFIER_DATIVE: Record<string, string> = { chronisch: "chronischen", akut: "akuten", subakut: "subakuten" }

const GROUP_NOUN: Record<string, string> = {
  "office-workers": "Büroangestellte",
  "older-adults": "Ältere Menschen",
  athletes: "Sportlerinnen und Sportler",
  children: "Kinder",
}

/** "Rückentraining / Rumpfstabilisation" -> "Rückentraining"; "Dry Needling (Trockennadeln)" -> "Dry Needling". */
export function shortLabel(label: string): string {
  const first = label.split(" / ")[0].trim()
  const bare = first.replace(/\s*\([^)]*\)\s*$/, "").trim()
  return bare || first
}

function groupByAge(years: number | null): string {
  if (years === null) return "Personen"
  if (years < 13) return "Kinder"
  if (years < 19) return "Jugendliche"
  if (years < 65) return "Erwachsene"
  return "Ältere Menschen"
}

/** The case's own word if it is a usable word, otherwise the tool's label. */
function caseWord(c: ReadConcept): string {
  const m = c.matched.trim()
  return m && m.length >= 4 && m.length <= 40 && !/^[A-ZÄÖÜ]{2,5}$/.test(m) ? m : shortLabel(c.label)
}

function conditionPhrase(c: ReadConcept, qualifier: string | null): string {
  const plural = c.termId ? PLURAL_CONDITION[c.termId] : undefined
  if (plural) {
    const q = qualifier ? QUALIFIER_DATIVE[qualifier] : null
    return q ? `${q} ${plural}` : plural
  }
  return qualifier ? `${c.label}, ${qualifier}` : c.label
}

export function joinUnd(parts: string[]): string {
  if (parts.length <= 1) return parts.join("")
  return `${parts.slice(0, -1).join(", ")} und ${parts[parts.length - 1]}`
}

function populationFromCase(r: CaseReading): { text: string; basis: string[] } {
  const years = r.age?.years ?? null
  const group = r.groups[0]
  const head = group?.termId ? (GROUP_NOUN[group.termId] ?? shortLabel(group.label)) : groupByAge(years)
  const age = years !== null ? ` (${years} Jahre)` : ""
  const conds = r.conditions.map((c) => conditionPhrase(c, r.chronicity))
  const basis = [
    ...(r.age ? [r.age.years !== null ? `${r.age.years} Jahre` : (r.age.group ?? "")] : []),
    ...r.groups.map((g) => g.label),
    ...r.conditions.map((c) => c.label),
  ].filter(Boolean)
  const text = conds.length ? `${head}${age} mit ${joinUnd(conds)}` : `${head}${age}`
  // Without any group, age or condition the case gave nothing to fill in.
  const empty = !r.groups.length && !r.conditions.length && !r.age
  return { text: empty ? "" : text, basis }
}

const normKey = (s: string) =>
  s
    .toLowerCase()
    .replace(/ä/g, "a")
    .replace(/ö/g, "o")
    .replace(/ü/g, "u")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]/g, "")

/** "Rückenschmerzen" as a goal is the pain outcome: "Schmerzen". */
function goalToOutcome(noun: string): string {
  return /schmerz/i.test(noun) ? "Schmerzen" : noun
}

function outcomeFromCase(r: CaseReading): { text: string; basis: string[] } {
  const items: string[] = []
  const seen = new Set<string>()
  const add = (s: string) => {
    const k = normKey(s)
    if (!k) return
    for (const have of seen) if (have === k || have.includes(k) || k.includes(have)) return
    seen.add(k)
    items.push(s)
  }
  for (const g of r.goals) add(goalToOutcome(g.noun))
  for (const o of r.outcomes) add(shortLabel(o.label))
  return { text: items.join(", "), basis: [...r.goals.map((g) => `${g.noun} ${g.verb}`), ...r.outcomes.map((o) => o.label)] }
}

export function suggestPico(reading: CaseReading, typed: PicoInput = {}): PicoSuggestion {
  const cell = (field: keyof PicoInput, built: { text: string; basis: string[] }): PicoCell => {
    const t = (typed[field] ?? "").trim()
    if (t) return { text: t, source: "typed", basis: [] }
    return built.text ? { text: built.text, source: "case", basis: built.basis } : { text: "", source: "none", basis: [] }
  }
  const intervention = reading.interventions.map(caseWord)
  const comparison = reading.comparisons.map(caseWord)
  return {
    P: cell("population", populationFromCase(reading)),
    I: cell("intervention", { text: joinUnd(intervention), basis: reading.interventions.map((c) => c.label) }),
    C: cell("comparison", { text: joinUnd(comparison), basis: reading.comparisons.map((c) => c.label) }),
    O: cell("outcome", outcomeFromCase(reading)),
  }
}

/* ── Fragestellung ───────────────────────────────────────────────── */

const DATIVE_WORDS: Array<[string, string]> = [
  ["Erwachsene", "Erwachsenen"],
  ["Büroangestellte", "Büroangestellten"],
  ["Ältere Menschen", "älteren Menschen"],
  ["Ältere", "Älteren"],
  ["Jugendliche", "Jugendlichen"],
  ["Kinder", "Kindern"],
  ["Sportlerinnen und Sportler", "Sportlerinnen und Sportlern"],
  ["Männer", "Männern"],
  ["Schmerzmittel", "Schmerzmitteln"],
  ["Medikamente", "Medikamenten"],
  ["keine Intervention", "keiner Intervention"],
  ["Keine Intervention", "Keiner Intervention"],
  ["übliche Behandlung", "üblicher Behandlung"],
  ["Übliche Behandlung", "Üblicher Behandlung"],
]

/** Dative plural for the few words the prefill produces; everything else stays as typed. */
export function dativeify(text: string): string {
  let out = text
  for (const [nom, dat] of DATIVE_WORDS) {
    out = out.replace(new RegExp(`(?<![\\p{L}])${nom}(?![\\p{L}])`, "gu"), dat)
  }
  return out
}

function trimEnd(s: string): string {
  return s.trim().replace(/[.?!:;,\s]+$/, "")
}

/** "Schmerzen, Arbeitsfähigkeit" -> "Schmerzen und Arbeitsfähigkeit". */
function outcomeList(s: string): string {
  return joinUnd(
    trimEnd(s)
      .split(/\s*[,;]\s*/)
      .filter(Boolean),
  )
}

/** "Wie wirkt I im Vergleich zu C bei P auf O?" The student edits the result. */
export function buildFragestellung(p: Record<PicoKey, string>): string {
  const I = trimEnd(p.I)
  const C = trimEnd(p.C)
  const P = trimEnd(p.P)
  const O = trimEnd(p.O)
  if (!I && !C && !P && !O) return ""
  const parts = [`Wie wirkt ${I || "…"}`]
  if (C) parts.push(`im Vergleich zu ${dativeify(C)}`)
  parts.push(`bei ${P ? dativeify(P) : "…"}`)
  parts.push(`auf ${O ? outcomeList(O) : "…"}?`)
  return parts.join(" ")
}

/* ── Student edits on top of the suggestion ──────────────────────── */

export interface ResolvedCell {
  text: string
  suggested: string
  edited: boolean
  source: PicoCell["source"]
  basis: string[]
}

export interface ResolvedPico {
  cells: Record<PicoKey, ResolvedCell>
  question: { text: string; suggested: string; edited: boolean }
  /** Population, intervention and outcome are filled: the minimum for a search. */
  complete: boolean
}

export interface PicoEdits {
  cells?: Partial<Record<PicoKey, string>>
  question?: string
}

export function resolvePico(suggestion: PicoSuggestion, edits: PicoEdits = {}): ResolvedPico {
  const cells = {} as Record<PicoKey, ResolvedCell>
  for (const k of PICO_KEYS) {
    const edit = edits.cells?.[k]
    const s = suggestion[k]
    cells[k] = { text: edit !== undefined ? edit : s.text, suggested: s.text, edited: edit !== undefined, source: s.source, basis: s.basis }
  }
  const suggestedQuestion = buildFragestellung({ P: cells.P.text, I: cells.I.text, C: cells.C.text, O: cells.O.text })
  const q = edits.question
  return {
    cells,
    question: { text: q !== undefined ? q : suggestedQuestion, suggested: suggestedQuestion, edited: q !== undefined },
    complete: !!(cells.P.text.trim() && cells.I.text.trim() && cells.O.text.trim()),
  }
}
