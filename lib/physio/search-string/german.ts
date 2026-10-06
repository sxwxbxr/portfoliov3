/**
 * German word handling in front of the MeSH index: light inflection stripping,
 * a compound splitter and the list of words that must never become a concept.
 *
 * Everything here works on folded text (see normalizeMeshTerm: lowercase,
 * ae/oe/ue/ss). The index only knows whole German words, so the matcher tries
 * a few likely base forms of a typed word before it gives up.
 */

/** Words that stay out of the MeSH lookup and out of the unmapped list. */
const NOISE = `
patient patienten patientin patientinnen proband probanden teilnehmer teilnehmende studie studien therapie therapien
behandlung behandlungen mensch menschen person personen jahr jahre jahren woche wochen monat monate monaten tag tage tagen
stunde stunden minute minuten mann maenner frau frauen herr junge maedchen freund freunde freundin kollege kollegen
kollegin familie angehoerige anamnese diagnose diagnosen befund befunde verlauf ursache ursachen effekt effekte wirkung
wirkungen ergebnis ergebnisse massnahme massnahmen methode methoden ansatz ansaetze rolle bedeutung einfluss vergleich
unterschied unterschiede gruppe gruppen fall faelle beispiel beispiele aufgabe aufgaben problem probleme symptom symptome
beschwerden beschwerde hinweis hinweise thema themen frage fragen fragestellung arbeitsauftrag aufgabenstellung
ausgangslage fallbeispiel situation zeit dauer phase phasen art arten form formen weise bereich bereiche stelle stellen
teil teile seite seiten richtung linderung verbesserung verschlechterung reduktion abnahme zunahme erhoehung senkung
besserung verringerung steigerung zustand zustaende wirksamkeit effektivitaet nutzen vorteil vorteile nachteil nachteile
empfehlung empfehlungen erfahrung erfahrungen wunsch ziel ziele grund gruende
verschiedene verschiedenen weitere weiteren bestimmte bestimmten gewisse typische zahlreiche wiederholte kurzfristige
kurzfristigen langfristige langfristigen kurzzeitige langzeit unteren unterer unteres untere obere oberen oberer oberes
aufgrund wegen gelegentlich manchmal oft haeufig selten meist taeglich woechentlich vorwiegend hauptsaechlich
patient patients study studies therapy therapies treatment treatments intervention interventions people person persons
year years week weeks month months day days hour hours man men woman women boy girl case cases group groups
effect effects effectiveness efficacy result results outcome outcomes program programs programme programmes
question questions role approach approaches method methods impact influence difference differences comparison
condition conditions problem problems symptom symptoms history diagnosis
syndrome syndromes syndrom disease diseases disorder disorders dysfunction erkrankung erkrankungen krankheit krankheiten
stoerung stoerungen chronic acute upper lower middle recurrent persistent severe mild moderate common general specific
primary secondary significant clinical early late high low new old long short
she he her his him they them their we our you your it its also asks ask asked reports reported report presents present presented
poor good bad wants want wanted needs need needed task tasks formulate build builds built write create search find found
after before while since because however therefore due current currently recent recently several many some few much very
repair says said seems seem comes come came goes go went made make makes takes take took gets get got has have had does did
chronische chronischen chronischer chronisches akute akuten akuter akutes
`

const NOISE_SET: ReadonlySet<string> = new Set(NOISE.split(/\s+/).filter(Boolean))

/** True for words that carry no search concept ("Patient", "Studie", "Jahr", "Linderung"). Input is folded text. */
export function isNoiseWord(norm: string): boolean {
  return NOISE_SET.has(norm)
}

/** Titles before a patient's name: the next word is a surname, not a concept. */
const TITLES = new Set(["herr", "frau", "hr", "fr", "mr", "mrs", "mister", "fraeulein", "dr"])
export function isTitleWord(norm: string): boolean {
  return TITLES.has(norm)
}

/** Verbs that say "something should change": they mark the outcome clause of a case. */
const CUE_STEMS_DE = [
  "reduzier",
  "verbesser",
  "senk",
  "steiger",
  "verring",
  "lindern",
  "linder",
  "erhoeh",
  "foerder",
  "verhindern",
  "vorbeug",
  "vermeiden",
  "erreichen",
  "erhalten",
  "wiederherstell",
  "zurueckerlang",
  "wiedererlang",
]
const CUE_STEMS_EN = ["reduc", "improv", "increas", "enhanc", "lower", "decreas", "prevent", "restor", "relie", "alleviat", "diminish"]

/** "reduzieren", "zu verbessern", "improving": true when the word is such a verb. Input is folded text. */
export function cueVerb(norm: string): "de" | "en" | null {
  if (norm.length < 5) return null
  if (CUE_STEMS_DE.some((s) => norm.startsWith(s))) return "de"
  if (CUE_STEMS_EN.some((s) => norm.startsWith(s))) return "en"
  return null
}

/* ── Inflection ────────────────────────────────────────────────── */

const ADJECTIVE_ENDINGS = ["en", "er", "es", "em", "e"]

function reduceUmlaut(s: string): string | null {
  // The folded plural umlaut: "haend" -> "hand", "baend" -> "band", "fuess" is handled by the index itself.
  const m = /^(.*?)(ae|oe|ue)([^aeiou]*)$/.exec(s)
  if (!m) return null
  return `${m[1]}${m[2][0]}${m[3]}`
}

/**
 * Likely base forms of a word, the word itself first. Plural and case endings
 * are stripped one step ("Beschwerden" gives beschwerden, beschwerd, beschwerde)
 * and a plural umlaut is undone ("Haende" gives hand). At most five forms.
 * The caller tries them in order and keeps the first that the index knows, so a
 * word that is indexed as typed is never shortened.
 */
export function germanForms(norm: string): string[] {
  const out = [norm]
  const add = (s: string | null) => {
    if (s && s.length >= 4 && !out.includes(s)) out.push(s)
  }
  if (norm.length < 5 || /\d/.test(norm)) return out
  if (norm.endsWith("ies")) add(`${norm.slice(0, -3)}y`)
  if (norm.endsWith("innen")) add(norm.slice(0, -5))
  else if (norm.endsWith("ungen")) add(norm.slice(0, -2))
  else {
    if (norm.endsWith("en")) add(norm.slice(0, -2))
    if (norm.endsWith("er")) add(norm.slice(0, -2))
    if (norm.endsWith("es")) add(norm.slice(0, -2))
  }
  if (norm.endsWith("e") && !norm.endsWith("ee")) add(norm.slice(0, -1))
  if (norm.endsWith("n") && !norm.endsWith("nn")) add(norm.slice(0, -1))
  // "s" is a plural in English and a genitive in German; never after ss/us/is/as/os.
  if (norm.endsWith("s") && !/(ss|us|is|as|os)$/.test(norm)) add(norm.slice(0, -1))
  for (const f of [...out]) add(reduceUmlaut(f))
  return out.slice(0, 5)
}

/** Forms for a word that is not the last of a phrase: adjective endings only, at most two. */
export function leadForms(norm: string): string[] {
  const out = [norm]
  if (norm.length < 6 || /\d/.test(norm)) return out
  for (const e of ADJECTIVE_ENDINGS) {
    if (norm.endsWith(e) && norm.length - e.length >= 4) {
      out.push(norm.slice(0, -e.length))
      break
    }
  }
  return out
}

/* ── Compounds ─────────────────────────────────────────────────── */

export type HeadKind =
  | "exercise"
  | "therapy"
  | "pain"
  | "injury"
  | "surgery"
  | "rupture"
  | "prosthesis"
  | "fracture"
  | "instability"
  | "inflammation"
  | "region"

const HEADS: Array<{ words: string[]; kind: HeadKind }> = [
  { kind: "exercise", words: ["training", "uebung", "uebungen", "gymnastik", "programm"] },
  { kind: "therapy", words: ["therapie", "therapien", "behandlung", "behandlungen"] },
  { kind: "pain", words: ["schmerz", "schmerzen", "beschwerden", "beschwerde"] },
  { kind: "injury", words: ["verletzung", "verletzungen", "trauma"] },
  { kind: "surgery", words: ["operation", "operationen", "chirurgie"] },
  { kind: "rupture", words: ["riss", "ruptur", "rupturen"] },
  { kind: "prosthesis", words: ["prothese", "prothesen", "implantat", "implantate"] },
  { kind: "fracture", words: ["fraktur", "frakturen"] },
  { kind: "instability", words: ["instabilitaet"] },
  { kind: "inflammation", words: ["entzuendung", "entzuendungen"] },
  { kind: "region", words: ["bereich", "gegend", "region"] },
]

/** What a known head stands for. `term` is looked up in the index (a MeSH name); `curated` is a curated concept id; neither: the head is dropped. */
export const HEAD_TARGET: Record<HeadKind, { term?: string; curated?: string }> = {
  exercise: { curated: "exercise-therapy" },
  therapy: {},
  region: {},
  pain: { term: "pain" },
  injury: { term: "wounds and injuries" },
  surgery: { term: "surgical procedures operative" },
  rupture: { term: "rupture" },
  prosthesis: { term: "prostheses and implants" },
  fracture: { term: "fractures bone" },
  instability: { term: "joint instability" },
  inflammation: { term: "inflammation" },
}

export interface CompoundSplit {
  /** The part in front, as typed (folded). */
  modifier: string
  /** Lookup forms of the modifier with the linking element removed ("bewegungs" gives bewegung). */
  modifierForms: string[]
  head: string
  /** Set when the head is one of the known heads. */
  kind: HeadKind | null
}

function modifierForms(m: string): string[] {
  const out = [m]
  for (const link of ["es", "en", "er", "s", "n", "e"]) {
    if (m.endsWith(link) && m.length - link.length >= 3) {
      const base = m.slice(0, -link.length)
      if (!out.includes(base)) out.push(base)
    }
  }
  return out
}

/** Splits at a known head ("schultertraining" gives schulter + training). Modifier at least three letters. */
export function knownHeadSplits(norm: string): CompoundSplit[] {
  const out: CompoundSplit[] = []
  for (const { words, kind } of HEADS) {
    for (const head of words) {
      if (norm.length - head.length >= 3 && norm.endsWith(head)) {
        const modifier = norm.slice(0, norm.length - head.length)
        out.push({ modifier, modifierForms: modifierForms(modifier), head, kind })
      }
    }
  }
  return out
}

/** Every split with both parts of at least four letters, for the "two known index terms" pass. */
export function genericSplits(norm: string): CompoundSplit[] {
  const out: CompoundSplit[] = []
  for (let k = 4; k <= norm.length - 4; k++) {
    const modifier = norm.slice(0, k)
    out.push({ modifier, modifierForms: modifierForms(modifier), head: norm.slice(k), kind: null })
  }
  return out
}
