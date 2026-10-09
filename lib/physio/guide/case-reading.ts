/**
 * "Fragestellung prüfen": what the engine took out of the student's own question (or,
 * for a pasted case, out of the case), and what it ignored. Pure; reads the analysed
 * model and the raw text, invents nothing.
 */
import { TERMINOLOGY, cleanTaskText, normalizeText, prepareUnits } from "../search-string"
import type { AnalysisResult, Block, Concept, PicoInput } from "../search-string"

/** Population concepts that name a group of people, not a complaint. */
export const GROUP_TERM_IDS = ["office-workers", "older-adults", "athletes", "children"] as const
export const OCCUPATION_TERM_IDS = ["office-workers", "athletes"] as const

export interface ReadConcept {
  id: string
  label: string
  /** The words of the case that triggered it. */
  matched: string
  termId: string | null
}

export interface CaseGoal {
  /** "Rückenschmerzen" */
  noun: string
  /** "reduzieren" */
  verb: string
  /** The sentence of the case it comes from. */
  sentence: string
}

export interface CaseReading {
  empty: boolean
  age: { years: number | null; group: string | null; evidence: string } | null
  sex: { value: "Male" | "Female"; evidence: string } | null
  /** Occupation or group of people ("Bürokaufmann" -> Büroangestellte). */
  groups: ReadConcept[]
  conditions: ReadConcept[]
  /** MeSH-derived population words that are neither group nor complaint ("Sitzen"). */
  otherPopulation: ReadConcept[]
  interventions: ReadConcept[]
  outcomes: ReadConcept[]
  comparisons: ReadConcept[]
  goals: CaseGoal[]
  /** The words after "auf …" / "for improving …": the outcome as the student wrote it ("Schmerzen und Arbeitsfähigkeit"), or null. */
  outcomePhrase: string | null
  /** "chronisch", "akut", "subakut", or null. Only what the text says. */
  chronicity: string | null
  /** "seit etwa einem Jahr", or null. */
  duration: string | null
  /** The text says the pain radiates ("strahlen in die Beine aus"). */
  radiating: boolean
  /** Lines and sentences that are task-sheet boilerplate ("Formulieren Sie ..."). */
  ignored: string[]
  /** Words the tool did not turn into a Suchkomponente. */
  unmapped: string[]
}

const fold = (s: string) => normalizeText(s)

function termCategory(c: Concept): string | null {
  if (!c.termId) return null
  return TERMINOLOGY.concepts.find((t) => t.id === c.termId)?.category ?? null
}

function toRead(c: Concept): ReadConcept {
  return { id: c.id, label: c.label, matched: c.matchedText ?? "", termId: c.termId }
}

const AGE_FROM_EVIDENCE = /(\d{1,3})/

const NUMBER_WORDS = String.raw`\d+|einem|einer|zwei|drei|vier|fünf|sechs|sieben|acht|neun|zehn|zwölf`
const DURATION_RE = new RegExp(
  String.raw`\bseit\s+(?:etwa|ca\.?|circa|über|rund|mehr als|knapp|fast)?\s*(?:${NUMBER_WORDS})\s+(?:Jahr(?:en)?|Monat(?:en)?|Woche(?:n)?)\b`,
  "i",
)

/** "um seine Rückenschmerzen zu reduzieren und seine Arbeitsfähigkeit zu verbessern" -> goals. */
const GOAL_RE =
  /(?:(?:seine|ihre|die|den|das|der|sein|ihr|eine|einen)\s+)?([A-ZÄÖÜ][\wäöüÄÖÜß-]+(?:\s+[a-zäöü]\w+)?)\s+zu\s+((?:wieder\s+)?[a-zäöü]+(?:ern|eln|en))\b/g

const STOP_GOAL_NOUNS = /^(?:Es|Ihn|Ihm|Ihr|Sie|Er)$/

export function extractGoals(text: string): CaseGoal[] {
  const goals: CaseGoal[] = []
  for (const sentence of text.split(/(?<=[.!?])\s+|\n+/)) {
    if (!/\b(?:um|damit|ziel|möchte|will|wünscht|sucht)\b/i.test(sentence)) continue
    GOAL_RE.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = GOAL_RE.exec(sentence))) {
      let noun = m[1].trim()
      // "Arbeitsfähigkeit zu" is the noun; a trailing lowercase word ("Rückenschmerzen im") is not.
      noun = noun.replace(/\s+[a-zäöü]\w+$/, "")
      if (STOP_GOAL_NOUNS.test(noun) || noun.length < 4) continue
      const s = sentence.trim()
      goals.push({ noun, verb: m[2], sentence: s.length > 150 ? `${s.slice(0, 149)}…` : s })
    }
  }
  const seen = new Set<string>()
  return goals.filter((g) => {
    const k = fold(g.noun)
    if (seen.has(k)) return false
    seen.add(k)
    return true
  })
}

const OUTCOME_DE = /\bauf\s+(?:(?:die|den|das|der|dem|eine?n?)\s+)?([^?.;:]+?)(?=\s+(?:bei|von|nach|im|mit|für|in|an|beim|durch|gegenüber)\b|[?.;:,]|$)/i
const OUTCOME_EN = /\b(?:for|on)\s+(?:improving|reducing|increasing|decreasing|improvement of|reduction of)\s+([^?.;:]+?)(?=\s+(?:in|among|after|with|compared)\b|[?.;:,]|$)/i

/** "… auf die Schmerzen und die Funktion bei älteren Menschen" -> "Schmerzen und Funktion". */
export function extractOutcomePhrase(text: string): string | null {
  const flat = text.replace(/\s+/g, " ")
  const m = OUTCOME_DE.exec(flat) ?? OUTCOME_EN.exec(flat)
  if (!m) return null
  const phrase = m[1].replace(/\b(?:die|den|das|der|dem)\s+/gi, "").trim()
  return phrase.length >= 4 && phrase.length <= 80 ? phrase : null
}

export function findChronicity(text: string): string | null {
  if (/\bsubakut\w*/i.test(text)) return "subakut"
  if (/\bchronisch\w*/i.test(text)) return "chronisch"
  if (/\bakut\w*/i.test(text)) return "akut"
  return null
}

export function findDuration(text: string): string | null {
  const m = DURATION_RE.exec(text.replace(/\s+/g, " "))
  return m ? m[0].charAt(0).toLowerCase() + m[0].slice(1) : null
}

/** "Folgen Sie ...", "Beschreiben Sie ...": an instruction of the task sheet, not part of the case. */
const INSTRUCTION = /^\W*(?:\d+[.)]\s*)?\p{L}+(?:en|ieren)\s+sie\b/iu

/** Task-sheet lines and instruction sentences the engine does not read. */
export function ignoredParts(text: string): string[] {
  const raw = text.replace(/\r\n?/g, "\n")
  const cleaned = cleanTaskText(raw)
  const foldedCleaned = fold(cleaned)
  const out: string[] = []

  for (const line of raw.split("\n")) {
    const l = line.trim()
    if (!l) continue
    const stripped = l.replace(/^\W*(?:\d+[.)]|[a-z][.)]|[-•*])\s*/i, "")
    if (!foldedCleaned.includes(fold(stripped)) && !foldedCleaned.includes(fold(l))) out.push(l)
  }

  const units = prepareUnits({ text }).map((u) => fold(u.text))
  for (const sentence of cleaned.split(/(?<=[.!?])\s+|\n+/)) {
    const s = sentence.trim()
    if (s.length < 12) continue
    if (INSTRUCTION.test(s)) {
      out.push(s)
      continue
    }
    const fs = fold(s)
    const covered = units.some((u) => u.length >= fs.length * 0.5 && fs.includes(u))
    if (!covered) out.push(s)
  }
  return [...new Set(out)]
}

export interface CaseReadingInput {
  text: string
  pico: PicoInput
  analysis: AnalysisResult | null
}

export function readCase({ text, pico, analysis }: CaseReadingInput): CaseReading {
  const concepts = analysis?.concepts ?? []
  const byBlock = (b: Block) => concepts.filter((c) => c.block === b)

  const ageSug = analysis?.filterSuggestions.find((s) => s.kind === "age")
  const sexSug = analysis?.filterSuggestions.find((s) => s.kind === "sex")
  const years = ageSug ? Number.parseInt(AGE_FROM_EVIDENCE.exec(ageSug.evidence)?.[1] ?? "", 10) : NaN

  const population = byBlock("population")
  const groups: ReadConcept[] = []
  const conditions: ReadConcept[] = []
  const otherPopulation: ReadConcept[] = []
  for (const c of population) {
    if (c.termId && (GROUP_TERM_IDS as readonly string[]).includes(c.termId)) groups.push(toRead(c))
    else if (termCategory(c) === "setting") otherPopulation.push(toRead(c))
    else if (c.origin === "mesh") otherPopulation.push(toRead(c))
    else conditions.push(toRead(c))
  }

  const all = [text, ...Object.values(pico)].filter(Boolean).join("\n")
  const goals = extractGoals(text)
  const ignored = text.trim() ? ignoredParts(text) : []
  const foldedIgnored = fold(ignored.join(" "))

  return {
    empty: concepts.length === 0,
    age: ageSug ? { years: Number.isFinite(years) ? years : null, group: ageSug.value, evidence: ageSug.evidence } : null,
    sex: sexSug ? { value: sexSug.value as "Male" | "Female", evidence: sexSug.evidence } : null,
    groups,
    conditions,
    otherPopulation,
    interventions: byBlock("intervention").map(toRead),
    outcomes: byBlock("outcome").map(toRead),
    comparisons: byBlock("comparison").map(toRead),
    goals,
    outcomePhrase: extractOutcomePhrase(cleanTaskText(text)),
    chronicity: findChronicity(all),
    duration: findDuration(all),
    radiating: /ausstrahl|strahl\w*\s+(?:\w+\s+){0,4}aus\b|radiat/i.test(all),
    ignored,
    unmapped: (analysis?.candidates ?? []).map((c) => c.text).filter((w) => !foldedIgnored.includes(fold(w))),
  }
}

/** The sentence of the case that contains `matched`, shortened, for "Im Fall: «…»". */
export function evidenceSentence(text: string, matched: string): string | null {
  const m = fold(matched)
  if (!m || m.length < 3) return null
  for (const raw of text.split(/(?<=[.!?])\s+|\n+/)) {
    const s = raw.trim()
    if (s && fold(s).includes(m)) return s.length > 150 ? `${s.slice(0, 149)}…` : s
  }
  return null
}
