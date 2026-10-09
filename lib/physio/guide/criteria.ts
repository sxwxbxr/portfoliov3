/**
 * "Ein- und Ausschlusskriterien": rule-based suggestions from the student's question,
 * each with a one-line reason and a note whether it can become a filter in the
 * search or is applied when screening the hits. Nothing here claims anything about
 * the literature; the reasons point back to the question. Nothing is assumed that the question does not state (no age
 * limit without an age or an age group in the question).
 */
import type { StudyTypeId } from "../search-string"
import type { CaseReading } from "./case-reading"
import { PLURAL_CONDITION, dativeify, type ResolvedPico } from "./pico"

export type CriterionKind = "include" | "exclude"
/** filter: can become a filter in the search. screening: applied when reading the hits. both: either. */
export type CriterionWhere = "filter" | "screening" | "both"
export type CriterionFilter = "studyTypes" | "language" | "years" | "humans" | "age"

export interface Criterion {
  id: string
  kind: CriterionKind
  text: string
  /** One line: why. */
  reason: string
  where: CriterionWhere
  /** Which control in the tool it maps to, if any. */
  filter?: CriterionFilter
  /** Extra line for the student ("Entscheide selbst: …"). */
  note?: string
  custom?: boolean
}

export interface CriteriaInput {
  reading: CaseReading
  pico: ResolvedPico
  /** Study types the engine read from the question ("nur RCTs"). */
  studyTypes: StudyTypeId[]
  /** For the default time span. */
  now: Date
}

const QUALIFIER_NOM: Record<string, string> = { chronisch: "Chronische", akut: "Akute", subakut: "Subakute" }
const NONSPECIFIC_IDS = ["low-back-pain", "back-pain", "neck-pain", "shoulder-pain"]
const ACTIVE_IDS = [
  "back-exercise",
  "exercise-therapy",
  "resistance-training",
  "aerobic-training",
  "balance-training",
  "gait-training",
  "stretching",
  "yoga",
  "pulmonary-rehabilitation",
  "breathing-exercises",
  "hydrotherapy",
]

export const DEFAULT_YEARS_BACK = 10

export function suggestCriteria({ reading: r, pico, studyTypes, now }: CriteriaInput): Criterion[] {
  const out: Criterion[] = []
  const years = r.age?.years ?? null
  const adultWorking = years !== null && years >= 18 && years < 65
  const hasWork = r.outcomes.some((o) => o.termId === "work-ability") || r.goals.some((g) => /arbeit/i.test(g.noun))
  const occupation = r.groups.find((g) => g.termId === "office-workers" || g.termId === "athletes")

  // Population: age
  if (years !== null) {
    const who = occupation ? `Deine Frage nennt ${years} Jahre und «${occupation.matched || occupation.label}»` : `Deine Frage nennt ${years} Jahre`
    if (adultWorking) {
      out.push({
        id: "age",
        kind: "include",
        text: "Erwachsene im Erwerbsalter (18 bis 65 Jahre)",
        reason: `${who}. Studien mit Kindern oder Hochbetagten passen schlecht dazu.`,
        where: "both",
        filter: "age",
        note: "Als Altersfilter schränkt das die Treffer stark ein, weil nicht jede Studie ein Alter verschlagwortet. Meist prüfst du es besser beim Screening.",
      })
    } else if (years >= 65) {
      out.push({
        id: "age",
        kind: "include",
        text: "Personen ab 65 Jahren",
        reason: `${who}.`,
        where: "both",
        filter: "age",
      })
    } else {
      out.push({
        id: "age",
        kind: "include",
        text: years < 13 ? "Kinder (bis 12 Jahre)" : "Jugendliche (13 bis 18 Jahre)",
        reason: `${who}.`,
        where: "both",
        filter: "age",
      })
    }
  } else if (r.groups.some((g) => g.termId === "older-adults" || g.termId === "children")) {
    const g = r.groups.find((x) => x.termId === "older-adults" || x.termId === "children")!
    out.push({
      id: "age",
      kind: "include",
      text: g.label,
      reason: `Deine Frage nennt «${g.matched || g.label}».`,
      where: "both",
      filter: "age",
    })
  }

  // Population: complaint
  for (const c of r.conditions) {
    const plural = c.termId ? PLURAL_CONDITION[c.termId] : undefined
    const nonspecific = !!c.termId && NONSPECIFIC_IDS.includes(c.termId)
    const q = r.chronicity
    const qNom = q ? QUALIFIER_NOM[q] : null
    let text: string
    if (plural) text = [qNom, nonspecific ? (qNom ? "unspezifische" : "Unspezifische") : null, plural].filter(Boolean).join(" ")
    else text = q ? `${c.label}, ${q}` : c.label
    const parts: string[] = []
    if (r.duration) parts.push(`Deine Frage nennt Beschwerden «${r.duration}»${q ? ` und das Wort «${q}»` : ""}.`)
    else if (q) parts.push(`Deine Frage nennt «${q}».`)
    else parts.push(`Deine Frage nennt «${c.matched || c.label}».`)
    if (nonspecific) parts.push("Eine spezifische Diagnose steht nicht in der Frage.")
    out.push({
      id: `condition-${c.id}`,
      kind: "include",
      text,
      reason: parts.join(" "),
      where: "screening",
      note: nonspecific && r.radiating ? "Die Schmerzen strahlen in die Beine aus. Entscheide selbst, ob du Studien mit Nervenwurzelbeschwerden einschliesst oder ausschliesst, und begründe es." : undefined,
    })
    if (nonspecific) {
      out.push({
        id: `x-specific-${c.id}`,
        kind: "exclude",
        text: "Spezifische Ursachen (zum Beispiel Fraktur, Tumor, Infektion)",
        reason: "In der Frage steht keine solche Diagnose, und bei einer spezifischen Ursache stellt sich eine andere Behandlungsfrage.",
        where: "screening",
      })
    }
  }

  // Exclude: groups that do not match the case
  if (adultWorking) {
    out.push({
      id: "x-children",
      kind: "exclude",
      text: "Kinder und Jugendliche (unter 18 Jahre)",
      reason: `Deine Frage nennt ${years} Jahre, Studien mit Kindern passen nicht zur Population.`,
      where: "screening",
    })
    if (hasWork) {
      out.push({
        id: "x-retired",
        kind: "exclude",
        text: "Personen im Rentenalter (ab 65 Jahren)",
        reason: "Dein Outcome ist die Arbeitsfähigkeit, und die ist für Personen im Ruhestand kein sinnvolles Ziel.",
        where: "screening",
      })
    }
  }

  // Intervention
  const iText = pico.cells.I.text.trim()
  if (iText) {
    const active = r.interventions.some((c) => !!c.termId && ACTIVE_IDS.includes(c.termId))
    out.push({
      id: "intervention",
      kind: "include",
      text: active ? `Aktive Intervention: ${iText}` : `Intervention: ${iText}`,
      reason: `Das ist die Intervention aus deiner PICO-Tabelle${r.interventions.length ? ", und sie steht in deiner Frage" : ""}.`,
      where: "screening",
    })
    if (active) {
      out.push({
        id: "x-passive",
        kind: "exclude",
        text: "Studien ohne Trainingskomponente (nur passive Behandlung)",
        reason: `Deine Frage zielt auf ${iText}. Eine rein passive Behandlung beantwortet sie nicht.`,
        where: "screening",
      })
    }
  }

  // Comparison
  const cText = pico.cells.C.text.trim()
  if (cText) {
    out.push({
      id: "comparison",
      kind: "include",
      text: `Vergleichsgruppe: ${cText}`,
      reason: `Deine Frage vergleicht mit ${dativeify(cText)}. Studien ohne diese Vergleichsgruppe beantworten sie nicht direkt.`,
      where: "screening",
      note: "Der Vergleich steht meist nicht im Suchstring, weil er die Treffer zu stark einschränkt. Du prüfst ihn beim Screening.",
    })
  }

  // Outcome
  const oText = pico.cells.O.text.trim()
  if (oText) {
    out.push({
      id: "outcome",
      kind: "include",
      text: `Zielgrössen: ${oText}`,
      reason: "Das sind die Zielgrössen aus deiner Frage.",
      where: "screening",
    })
  }

  // Study design
  const fromQuestion = studyTypes.length > 0
  out.push({
    id: "design",
    kind: "include",
    text: fromQuestion
      ? studyTypes.map((t) => STUDY_TYPE_LABEL[t]).join(", ")
      : "Randomisierte kontrollierte Studien (RCT) und systematische Übersichtsarbeiten",
    reason: fromQuestion
      ? "Du hast diesen Studientyp in deiner Fragestellung genannt."
      : "Wer die Wirkung einer Behandlung wissen will, braucht kontrollierte Studien und Übersichtsarbeiten (Evidenzhierarchie).",
    where: "both",
    filter: "studyTypes",
    note: "Als Filter über den Publikationstyp. Neue Studien sind dort oft noch nicht verschlagwortet und fehlen dann; ein breiter Suchlauf plus Screening ist sicherer.",
  })

  out.push({
    id: "language",
    kind: "include",
    text: "Sprachen: Deutsch und Englisch",
    reason: "Das sind die Sprachen, die du sicher lesen und beurteilen kannst.",
    where: "both",
    filter: "language",
    note: "Der Sprachfilter im Tool nimmt nur eine Sprache. Für beide lässt du ihn leer und prüfst die Sprache beim Screening.",
  })

  const from = now.getFullYear() - DEFAULT_YEARS_BACK
  out.push({
    id: "years",
    kind: "include",
    text: `Veröffentlicht ab ${from} (letzte ${DEFAULT_YEARS_BACK} Jahre)`,
    reason: "Du legst den Zeitraum fest und begründest ihn. Zehn Jahre sind ein häufiger Ausgangspunkt, damit die Studien zur heutigen Praxis passen; ändere ihn, wenn deine Frage etwas anderes braucht.",
    where: "filter",
    filter: "years",
  })

  out.push({
    id: "humans",
    kind: "include",
    text: "Studien an Menschen",
    reason: "Deine Frage gilt Menschen, Tierstudien beantworten sie nicht.",
    where: "filter",
    filter: "humans",
  })

  return out
}

const STUDY_TYPE_LABEL: Record<StudyTypeId, string> = {
  rct: "Randomisierte kontrollierte Studien (RCT)",
  "systematic-review": "Systematische Übersichtsarbeiten",
  "meta-analysis": "Metaanalysen",
}

/* ── Student edits ───────────────────────────────────────────────── */

export interface CriteriaEdits {
  removed?: string[]
  text?: Record<string, string>
  reason?: Record<string, string>
  custom?: Criterion[]
}

export interface ResolvedCriterion extends Criterion {
  removed: boolean
  edited: boolean
}

export function resolveCriteria(suggested: Criterion[], edits: CriteriaEdits = {}): ResolvedCriterion[] {
  const removed = new Set(edits.removed ?? [])
  const all = [...suggested, ...(edits.custom ?? [])]
  return all.map((c) => ({
    ...c,
    text: edits.text?.[c.id] ?? c.text,
    reason: edits.reason?.[c.id] ?? c.reason,
    removed: removed.has(c.id),
    edited: edits.text?.[c.id] !== undefined || edits.reason?.[c.id] !== undefined,
  }))
}

export const activeCriteria = (c: ResolvedCriterion[]) => c.filter((x) => !x.removed && x.text.trim())

export function whereLabel(w: CriterionWhere): string {
  return w === "filter" ? "als Filter in der Suche" : w === "screening" ? "beim Screening" : "als Filter oder beim Screening"
}

