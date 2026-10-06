/**
 * Concept detection, first layer: rule based and curated. Normalise, drop task
 * boilerplate, find explicit PICO lines and inline markers, match the curated
 * terminology longest n-gram first. Whatever stays unmatched is handed to the
 * MeSH layer (pipeline.ts) or reported as unmapped candidates. Nothing is
 * guessed: a word that no table knows never gets a MeSH heading.
 *
 * `analyze` runs this layer alone (synchronous, offline). `analyzeAsync` in
 * pipeline.ts adds the MeSH index and calls `assemble` with its hits.
 */
import occupationsJson from "./occupations.json"
import terminologyJson from "./terminology.json"
import { extractDemographics } from "./demographics"
import { isNoiseWord, isTitleWord, cueVerb } from "./german"
import { KIND_BLOCK, conceptFromDescriptor, meshKind, type MeshKind } from "./mesh-concepts"
import { isStopword, normalizeText, phraseKey, tokenize, type Token } from "./normalize"
import type {
  AnalysisResult,
  AnalyzeInput,
  Block,
  Candidate,
  Category,
  Concept,
  MeshChoice,
  Notice,
  PicoInput,
  StudyTypeId,
  TermConcept,
  Terminology,
} from "./types"

const BASE_TERMINOLOGY = terminologyJson as unknown as Terminology

/** The curated table: topics, interventions, outcomes and occupations. Not reviewed by a person yet. */
export const TERMINOLOGY: Terminology = {
  ...BASE_TERMINOLOGY,
  concepts: [...BASE_TERMINOLOGY.concepts, ...(occupationsJson as unknown as TermConcept[])],
}

const MAX_ALIAS_TOKENS = 7
const MAX_CANDIDATES = 20

/* ── Terminology index ──────────────────────────────────────────── */

interface AliasEntry {
  termId: string
  /** Short acronyms ("MS", "LWS") only match when typed in capitals. */
  requireUpper: boolean
}

export interface TermIndex {
  byKey: Map<string, AliasEntry>
  byId: Map<string, TermConcept>
}

const indexCache = new WeakMap<Terminology, TermIndex>()

export function getIndex(t: Terminology): TermIndex {
  const cached = indexCache.get(t)
  if (cached) return cached
  const byKey = new Map<string, AliasEntry>()
  const byId = new Map<string, TermConcept>()
  for (const c of t.concepts) {
    byId.set(c.id, c)
    const aliases = [c.label, ...c.aliasesDe, ...c.aliasesEn]
    for (const alias of aliases) {
      const key = phraseKey(alias)
      if (!key || byKey.has(key)) continue
      const single = key.split(" ").length === 1
      byKey.set(key, { termId: c.id, requireUpper: single && /^[A-Z][A-Z0-9]{1,5}s?$/.test(alias) })
    }
  }
  const index = { byKey, byId }
  indexCache.set(t, index)
  return index
}

/** Aliases that are too vague to carry a concept on their own. */
const GENERIC_ALIASES = new Set([
  "training",
  "bewegung",
  "exercise",
  "exercises",
  "kraft",
  "strength",
  "balance",
  "gleichgewicht",
  "ausdauer",
  "manipulation",
  "taping",
  "tape",
  "laufen",
  "walking",
  "fall",
  "flexibility",
  "flexibilitaet",
  "betagte",
  "alt",
])

/* ── Markers ────────────────────────────────────────────────────── */

export interface Marker {
  words: string[]
  block: Block
  /** Strong markers may move a concept out of its default block. */
  strong: boolean
}

const MARKER_DEFS: Array<{ phrases: string[]; block: Block; strong: boolean }> = [
  {
    block: "outcome",
    strong: true,
    phrases: [
      "auf die",
      "auf den",
      "auf das",
      "wirkung auf",
      "effekt auf",
      "einfluss auf",
      "auswirkung auf",
      "auswirkungen auf",
      "hinsichtlich",
      "outcome",
      "outcomes",
      "zielgrösse",
      "zielgrössen",
      "endpunkt",
      "endpunkte",
      "effect on",
      "effects on",
      "impact on",
      "influence on",
    ],
  },
  {
    block: "comparison",
    strong: true,
    phrases: [
      "im vergleich zu",
      "im vergleich zur",
      "im vergleich mit",
      "verglichen mit",
      "vergleich mit",
      "gegenüber",
      "versus",
      "vs",
      "compared to",
      "compared with",
      "in comparison to",
      "in comparison with",
      "vergleichsintervention",
      "besser als",
      "wirksamer als",
      "effektiver als",
      "comparison",
      "comparator",
      "more effective than",
      "less effective than",
      "better than",
      "superior to",
      "than",
    ],
  },
  {
    block: "intervention",
    strong: true,
    phrases: ["wirkung von", "effekt von", "einfluss von", "effect of", "effects of", "intervention", "behandlung mit", "therapie mit"],
  },
  {
    block: "population",
    strong: false,
    phrases: ["bei", "mit", "population", "in patients", "in people", "in adults", "in individuals", "in persons"],
  },
]

const MARKERS: Marker[] = MARKER_DEFS.flatMap((d) =>
  d.phrases.map((p) => ({ words: normalizeText(p).split(" "), block: d.block, strong: d.strong })),
).sort((a, b) => b.words.length - a.words.length)

const EXPLICIT_RE =
  /(?:^|[\s;,.(])(P|I|C|O|Population|Patienten|Patient|Problem|Intervention|Vergleichsintervention|Vergleich|Kontrolle|Comparison|Comparator|Control|Outcome|Outcomes|Zielgr(?:ö|oe)sse|Endpunkt|Ergebnis|Studientyp|Studiendesign|Study type|Fragestellung|Forschungsfrage|Research question)\s*[:=]/gi

type ExplicitRole = Block | "studytype" | "question"

function explicitRole(key: string): ExplicitRole | null {
  const k = key.toLowerCase()
  if (key.length === 1 && key !== key.toUpperCase()) return null
  if (["p", "population", "patienten", "patient", "problem"].includes(k)) return "population"
  if (["i", "intervention"].includes(k)) return "intervention"
  if (["c", "vergleichsintervention", "vergleich", "kontrolle", "comparison", "comparator", "control"].includes(k)) return "comparison"
  if (["o", "outcome", "outcomes", "zielgrösse", "zielgroesse", "endpunkt", "ergebnis"].includes(k)) return "outcome"
  if (["studientyp", "studiendesign", "study type"].includes(k)) return "studytype"
  if (["fragestellung", "forschungsfrage", "research question"].includes(k)) return "question"
  return null
}

interface Segment {
  text: string
  role: ExplicitRole | null
}

/** Splits at "P:", "Intervention:", "Fragestellung:" and similar prefixes. Text before the first prefix has no role. */
export function splitExplicit(text: string): Segment[] {
  const marks: Array<{ start: number; end: number; role: ExplicitRole }> = []
  EXPLICIT_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = EXPLICIT_RE.exec(text))) {
    const role = explicitRole(m[1])
    if (!role) continue
    const keyStart = m.index + m[0].indexOf(m[1])
    marks.push({ start: keyStart, end: m.index + m[0].length, role })
  }
  if (!marks.length) return [{ text, role: null }]
  const segments: Segment[] = []
  const head = text.slice(0, marks[0].start).trim()
  if (head) segments.push({ text: head, role: null })
  marks.forEach((mark, i) => {
    const next = marks[i + 1]
    segments.push({ text: text.slice(mark.end, next ? next.start : text.length).trim(), role: mark.role })
  })
  return segments
}

/* ── Preparing long input ───────────────────────────────────────── */

/** A sentence with the PICO role it was written under, if any. */
export interface Unit {
  text: string
  explicit: Block | null
  /** Written under "Fragestellung:": its blocks win over the case description. */
  question: boolean
}

const NUMBERING = /^\s*(?:\(?\d{1,2}[.)]|\(?[a-z][.)]|[-*•–—])\s+/i
const HEADING_LINE =
  /^(arbeitsauftrag|arbeitsauftraege|aufgabenstellung|aufgabe|aufgaben|uebung|abgabe|hinweise?|bewertung|bewertungskriterien|lernziele?|ziel der uebung|zeitaufwand|dauer|punkte|name|datum|kurs|modul|dozent|dozentin|auftrag|vorgehen|material)\b/
const IMPERATIVE_EN = /^\W*(?:please\s+)?(?:formulate|write|create|build|develop|search|describe|define|list|identify|design|construct|state|explain|answer|use|choose|select)\b/
const IMPERATIVE =
  /^\W*(?:bitte\s+)?(?:formulier|erstell|such|notier|beschreib|definier|entwickel|leit|ueberleg|nenn|erklaer|beantwort|recherchier|waehl|bestimm|identifizier|fuehr|schreib|bearbeit|arbeit|halt|geb|zeig|begruend|ueberpruef|pruef|verwend|nutz|beacht|acht|ordn|erarbeit|erlaeuter|stell|erweiter|ergaenz|kopier|speicher|dokumentier|vergleich)\w*\s+sie\b/

function foldForMatch(s: string): string {
  return normalizeText(s)
}

/** Removes numbering, task headings and "Formulieren Sie ..." lines. What is left is the case or the question. */
export function cleanTaskText(raw: string): string {
  const out: string[] = []
  for (const line of raw.replace(/\r\n?/g, "\n").split("\n")) {
    let l = line.replace(NUMBERING, "").trim()
    if (!l) continue
    const folded = foldForMatch(l)
    if (HEADING_LINE.test(folded)) {
      // A short heading ("Übung 3 Suchstrategie", "Hinweise:") is dropped, a long line only loses its label.
      if (l.length <= 70) continue
      const colon = l.indexOf(":")
      if (colon > -1 && colon < 40) l = l.slice(colon + 1).trim()
    }
    if (l) out.push(l)
  }
  return out.join("\n")
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\bvs\./gi, "vs ")
    .replace(/\b(z\.\s?B|d\.\s?h|u\.\s?a|bzw|ca|etc|ggf|inkl|evtl)\./gi, (m) => m.replace(".", ""))
    .split(/[.!?;:\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

/**
 * Turns the question and the PICO fields into sentences with their roles.
 * PICO fields and "P:"-style lines are explicit, "Fragestellung:" counts as
 * the question, task boilerplate and imperative instructions are dropped.
 */
export function prepareUnits(input: AnalyzeInput): Unit[] {
  const units: Unit[] = []
  const pushSegment = (seg: Segment, cleaned: boolean) => {
    const explicit: Block | null = seg.role && seg.role !== "studytype" && seg.role !== "question" ? seg.role : null
    for (const sentence of splitSentences(seg.text)) {
      if (cleaned && (IMPERATIVE.test(foldForMatch(sentence)) || IMPERATIVE_EN.test(foldForMatch(sentence)) || /^(?:task|tasks|exercise|assignment)\s*\d*$/.test(foldForMatch(sentence)))) continue
      units.push({ text: sentence, explicit, question: seg.role === "question" })
    }
  }

  for (const key of PICO_ORDER) {
    const value = input.pico?.[key]?.trim()
    if (value) pushSegment({ text: value, role: PICO_ROLE[key] }, false)
  }
  const text = input.text?.trim()
  if (text) {
    for (const seg of splitExplicit(cleanTaskText(text))) pushSegment(seg, true)
  }
  return units
}

/* ── Scanning ───────────────────────────────────────────────────── */

/** One comma-separated clause with the state of every token. */
export interface Span {
  tokens: Token[]
  /** Token already explained by a marker, a curated alias or a patient name. */
  consumed: boolean[]
  /** Curated hit that explains the token, if any. */
  hit: Array<Hit | null>
  /** Marker in force at each token. */
  role: Array<Marker | null>
  /** Token sits in a "should change" clause ("um X zu reduzieren"). */
  cue: boolean[]
  explicit: Block | null
  question: boolean
  /** Global position of the first token, for ordering concepts. */
  base: number
}

/** A curated concept found in the text. */
export interface Hit {
  termId: string
  matched: string
  explicit: Block | null
  role: Marker | null
  question: boolean
  pos: number
  /** Number of tokens of the match. */
  len: number
}

export interface Scan {
  spans: Span[]
  hits: Hit[]
  /** Nouns are capitalised in this text: only capitalised words are looked up and reported. */
  capsMode: boolean
}

function matchesWords(tokens: Token[], i: number, words: string[]): boolean {
  if (i + words.length > tokens.length) return false
  for (let k = 0; k < words.length; k++) if (tokens[i + k].norm !== words[k]) return false
  return true
}

const DE_MARK = new Set("der die das und mit bei von ist im den dem ein eine einen auf zu nicht auch fuer wie wird sind zum zur nach seit er sie".split(" "))
const EN_MARK = new Set("the of and with in for to is are was were that this from by on at".split(" "))

/** German text with capitalised nouns. English and all-lowercase input keep every word. */
function detectCapsMode(spans: Span[]): boolean {
  let de = 0
  let en = 0
  let long = 0
  let upper = 0
  for (const s of spans) {
    for (const t of s.tokens) {
      if (DE_MARK.has(t.norm)) de++
      if (EN_MARK.has(t.norm)) en++
      if (t.norm.length >= 4 && !/\d/.test(t.norm)) {
        long++
        if (t.orig[0] !== t.orig[0].toLowerCase()) upper++
      }
    }
  }
  if (en > de) return false
  if (long < 2) return false
  return upper / long >= (long < 6 ? 0.5 : 0.2)
}

function scanUnit(unit: Unit, index: TermIndex, hits: Hit[], spans: Span[], base: number): number {
  let role: Marker | null = null
  let pos = base
  for (const clause of unit.text.split(",")) {
    const tokens = tokenize(clause)
    if (!tokens.length) continue
    const span: Span = {
      tokens,
      consumed: tokens.map(() => false),
      hit: tokens.map(() => null),
      role: tokens.map(() => null),
      cue: tokens.map(() => false),
      explicit: unit.explicit,
      question: unit.question,
      base: pos,
    }
    let i = 0
    while (i < tokens.length) {
      const marker = MARKERS.find((mk) => matchesWords(tokens, i, mk.words))
      if (marker) {
        for (let k = 0; k < marker.words.length; k++) {
          span.consumed[i + k] = true
          span.role[i + k] = role
        }
        role = marker
        i += marker.words.length
        continue
      }

      let matched = false
      for (let n = Math.min(MAX_ALIAS_TOKENS, tokens.length - i); n >= 1; n--) {
        const slice = tokens.slice(i, i + n)
        const entry = index.byKey.get(slice.map((t) => t.stem).join(" "))
        if (!entry) continue
        if (entry.requireUpper && n === 1 && slice[0].orig !== slice[0].orig.toUpperCase()) continue
        const hit: Hit = {
          termId: entry.termId,
          matched: slice.map((t) => t.orig).join(" "),
          explicit: unit.explicit,
          role,
          question: unit.question,
          pos: pos + i,
          len: n,
        }
        hits.push(hit)
        for (let k = 0; k < n; k++) {
          span.consumed[i + k] = true
          span.hit[i + k] = hit
          span.role[i + k] = role
        }
        i += n
        matched = true
        break
      }
      if (matched) continue

      span.role[i] = role
      // "Herr Müller": the word after a title is a surname.
      if (isTitleWord(tokens[i].norm) && i + 1 < tokens.length && tokens[i + 1].orig[0] !== tokens[i + 1].orig[0].toLowerCase()) {
        span.consumed[i] = true
        if (!index.byKey.has(tokens[i + 1].stem)) span.consumed[i + 1] = true
      }
      i++
    }
    // Cue clause: German puts the verb last ("Schmerzen zu reduzieren"), English first ("to reduce pain").
    const cueIdx = tokens.findIndex((t) => cueVerb(t.norm))
    if (cueIdx > -1) {
      const lang = cueVerb(tokens[cueIdx].norm)
      for (let k = 0; k < tokens.length; k++) span.cue[k] = lang === "de" ? k < cueIdx : k > cueIdx
    }
    spans.push(span)
    pos += tokens.length
  }
  return pos
}

export function scanCurated(units: Unit[], terminology: Terminology = TERMINOLOGY): Scan {
  const index = getIndex(terminology)
  const hits: Hit[] = []
  const spans: Span[] = []
  let pos = 0
  for (const unit of units) pos = scanUnit(unit, index, hits, spans, pos)
  return { spans, hits, capsMode: detectCapsMode(spans) }
}

/** "patellofemoralem", "neurologische": lowercase German adjectives of medical stems are worth a lookup, verbs and filler are not. */
function looksMedicalAdjective(norm: string): boolean {
  return norm.length >= 9 && /(?:al|ar|ell|isch|iv)(?:e|en|er|em|es)?$/.test(norm)
}

/** True for a token the later stages may look up or report: a content word that nothing explained yet. */
export function isOpenToken(span: Span, i: number, capsMode: boolean): boolean {
  if (span.consumed[i]) return false
  const t = span.tokens[i]
  if (isStopword(t.norm) || isNoiseWord(t.norm)) return false
  // Two capital letters can be an acronym (MS, OA); the index only answers them for acronym entries.
  const acronym2 = t.norm.length === 2 && /^[A-Z]{2}$/.test(t.orig)
  if ((t.norm.length < 3 && !acronym2) || /^\d+$/.test(t.norm)) return false
  if (capsMode && t.orig[0] === t.orig[0].toLowerCase() && !looksMedicalAdjective(t.norm)) return false
  return true
}

/* ── Blocks ─────────────────────────────────────────────────────── */

function blockFor(category: Category, explicit: Block | null, role: Marker | null): Block {
  if (explicit) return explicit
  if (role?.strong) {
    if (role.block === "outcome" && (category === "population" || category === "outcome" || category === "setting")) return "outcome"
    if (role.block === "comparison" && (category === "intervention" || category === "comparison")) return "comparison"
    if (role.block === "intervention" && (category === "intervention" || category === "comparison")) return "intervention"
  }
  if (category === "setting") return "population"
  if (category === "studytype") return "intervention"
  return category
}

/**
 * Block of a weak descriptor (body part, social term). Only a compound with a known head ("Handgelenkschmerzen")
 * or a multi-word phrase ("return to sport") is specific enough to add on its own. Null: leave it to the user.
 */
function weakBlock(d: MeshChoice, words: number, force: boolean): Block | null {
  if (force) return "population"
  if (words >= 2 && d.treeNumbers.some((t) => t.startsWith("I"))) return "outcome"
  return null
}

/** Block of a MeSH-derived concept: explicit field, then marker, then the tree. Null for descriptors that need a person's decision. */
export function meshBlockFor(hit: Pick<MeshHit, "descriptor" | "explicit" | "role" | "words" | "force" | "sole">): Block | null {
  const { explicit, role } = hit
  const kind = meshKind(hit.descriptor)
  // A body part is a concept only when the user wrote nothing but that term into a PICO field, or a compound says so.
  if (explicit && (kind !== "weak" || hit.sole || hit.force)) return explicit
  if (kind === "weak") return weakBlock(hit.descriptor, hit.words, !!hit.force)
  const dflt = KIND_BLOCK[kind]
  if (role?.strong) {
    if (role.block === "outcome" && (kind === "condition" || kind === "outcome" || kind === "person")) return "outcome"
    if (role.block === "comparison" && (kind === "intervention" || kind === "activity" || kind === "drug")) return "comparison"
    if (role.block === "intervention" && (kind === "intervention" || kind === "activity" || kind === "drug")) return "intervention"
  }
  return dflt
}

const CONF = { explicit: 4, marker: 3, cue: 2, normal: 1 }

export function conceptFromTerm(term: TermConcept, block: Block, matchedText?: string): Concept {
  return {
    id: term.id,
    termId: term.id,
    label: term.label,
    block,
    mesh: term.mesh.map((heading) => ({ heading, explode: true })),
    freeText: term.freeText.map((text) => ({ text })),
    origin: "terminology",
    matchedText,
  }
}

const PICO_ORDER: Array<keyof PicoInput> = ["population", "intervention", "comparison", "outcome", "studyType"]
const PICO_ROLE: Record<keyof PicoInput, ExplicitRole> = {
  population: "population",
  intervention: "intervention",
  comparison: "comparison",
  outcome: "outcome",
  studyType: "studytype",
}

/* ── MeSH hits (produced by pipeline.ts) ───────────────────────── */

/** A descriptor found by the MeSH layer. */
export interface MeshHit {
  descriptor: MeshChoice
  /** Other descriptors the same word could mean, best first. */
  alternatives: MeshChoice[]
  matched: string
  pos: number
  explicit: Block | null
  role: Marker | null
  question: boolean
  /** In a "should change" clause. */
  cue: boolean
  /** Number of words of the match. */
  words: number
  /** The match is the whole clause ("Population: Rücken"). */
  sole?: boolean
  /** Add the concept even if the descriptor is a body part or similar (modifier of a compound with a known head). */
  force?: boolean
}

export interface AssembleInput {
  terminology: Terminology
  scan: Scan
  /** Extra curated hits from the MeSH stage (compound heads such as "-training"). */
  extraHits?: Hit[]
  /** Curated hits a longer MeSH phrase has taken over ("myofascial pain syndrome" over "pain"). */
  droppedHits?: Set<Hit>
  meshHits?: MeshHit[]
  extraNotices?: Notice[]
  /** Text the age and sex suggestions are read from. */
  demographicsText: string
  /** True when a MeSH index took part. Changes the wording of the "unmapped" hint. */
  withMesh: boolean
  /** Spans consumed by the MeSH stage, keyed by span index and token index. */
  meshConsumed?: Array<Set<number>>
}

interface Chosen {
  key: string
  block: Block
  conf: number
  pos: number
  hit: { kind: "term"; hit: Hit } | { kind: "mesh"; hit: MeshHit }
}

/** The curated concept that stands for a descriptor, when there is one. Prefers the broader of several. */
function curatedForDescriptor(terminology: Terminology): Map<string, TermConcept> {
  const map = new Map<string, TermConcept>()
  for (const c of terminology.concepts) {
    if (c.category === "studytype") continue
    for (const heading of c.mesh) {
      const prev = map.get(heading)
      if (!prev || (prev.broader && !c.broader)) map.set(heading, c)
    }
  }
  return map
}

function isAncestor(a: string, b: string): boolean {
  return b.startsWith(`${a}.`)
}

export function assemble(input: AssembleInput): AnalysisResult {
  const { terminology, scan } = input
  const index = getIndex(terminology)
  const notices: Notice[] = [...(input.extraNotices ?? [])]
  const byMesh = curatedForDescriptor(terminology)

  /* 1. Every occurrence becomes a candidate for its concept key. */
  const occurrences: Array<{ key: string; block: Block; conf: number; pos: number; cue: boolean; condition: boolean; src: Chosen["hit"] }> = []
  const termHit = (hit: Hit) => {
    const term = index.byId.get(hit.termId)
    if (!term) return
    const block = blockFor(term.category, hit.explicit, hit.role)
    const dflt = blockFor(term.category, null, null)
    const conf = (hit.explicit ? CONF.explicit : hit.role?.strong && block !== dflt ? CONF.marker : CONF.normal) + (hit.question ? 0.25 : 0)
    occurrences.push({ key: term.id, block, conf, pos: hit.pos, cue: false, condition: false, src: { kind: "term", hit } })
  }
  for (const hit of scan.hits) if (!input.droppedHits?.has(hit)) termHit(hit)
  for (const hit of input.extraHits ?? []) termHit(hit)

  for (const mh of input.meshHits ?? []) {
    const cur = byMesh.get(mh.descriptor.name)
    if (cur) {
      // The curated entry is richer: use it for the same descriptor.
      termHit({ termId: cur.id, matched: mh.matched, explicit: mh.explicit, role: mh.role, question: mh.question, pos: mh.pos, len: mh.words })
      continue
    }
    const kind = meshKind(mh.descriptor)
    const block = meshBlockFor(mh)
    if (!block) continue
    const dflt = meshBlockFor({ ...mh, role: null }) ?? block
    const conf = (mh.explicit ? CONF.explicit : block !== dflt ? CONF.marker : CONF.normal) + (mh.question ? 0.25 : 0)
    occurrences.push({
      key: `mesh-${mh.descriptor.ui}`,
      block,
      conf,
      pos: mh.pos,
      cue: mh.cue,
      condition: kind === "condition" && !mh.explicit,
      src: { kind: "mesh", hit: mh },
    })
  }

  /* 2. Cue clauses: a condition named only in "um X zu reduzieren" is an outcome, provided the case has another population anchor. */
  const nonCue = new Set(occurrences.filter((o) => !o.cue).map((o) => o.key))
  const anchor = (key: string) => occurrences.some((o) => !o.cue && o.key !== key && o.block === "population")
  const usable = occurrences.filter((o) => {
    if (!o.cue || !o.condition) return true
    if (nonCue.has(o.key)) return false
    if (anchor(o.key)) {
      o.block = "outcome"
      o.conf = CONF.cue + (o.src.kind === "mesh" && o.src.hit.question ? 0.25 : 0)
    }
    return true
  })

  /* 3. One concept per key: highest confidence, then earliest. */
  const chosen = new Map<string, Chosen>()
  for (const o of usable) {
    const prev = chosen.get(o.key)
    if (!prev || o.conf > prev.conf) chosen.set(o.key, { key: o.key, block: o.block, conf: o.conf, pos: Math.min(o.pos, prev?.pos ?? o.pos), hit: o.src })
    else if (prev && o.pos < prev.pos) prev.pos = o.pos
  }

  const studyTypes: StudyTypeId[] = []
  const concepts: Concept[] = []
  for (const c of [...chosen.values()].sort((a, b) => a.pos - b.pos)) {
    if (c.hit.kind === "term") {
      const term = index.byId.get(c.hit.hit.termId)!
      if (term.category === "studytype") {
        if (!studyTypes.includes(term.id as StudyTypeId)) studyTypes.push(term.id as StudyTypeId)
        notices.push({
          severity: "info",
          code: "studytype-filter",
          message: `Studientyp «${term.label}» erkannt. Er wird als Filter vorgeschlagen, nicht als Suchkomponente.`,
        })
        continue
      }
      concepts.push(conceptFromTerm(term, c.block, c.hit.hit.matched))
    } else {
      const mh = c.hit.hit
      concepts.push(conceptFromDescriptor(mh.descriptor, c.block, { matchedText: mh.matched, alternatives: mh.alternatives }))
    }
  }

  /* 4. Redundancy: a narrower concept makes the broader one superfluous. */
  const present = new Set(concepts.map((c) => c.id))
  let kept = concepts.filter((c) => {
    const narrower = concepts.find((o) => o.id !== c.id && index.byId.get(o.id)?.broader === c.id)
    if (!narrower) return true
    notices.push({
      severity: "info",
      code: "subsumed",
      message: `«${c.label}» wird nicht separat gesucht, weil «${narrower.label}» sie schon abdeckt.`,
    })
    return false
  })
  // Same for MeSH-derived concepts in one block: [Mesh] already explodes the narrower terms.
  kept = kept.filter((c) => {
    if (c.origin !== "mesh" || !c.descriptor) return true
    const narrower = kept.find(
      (o) =>
        o.id !== c.id &&
        o.origin === "mesh" &&
        o.block === c.block &&
        o.descriptor &&
        c.descriptor!.treeNumbers.some((a) => o.descriptor!.treeNumbers.some((b) => isAncestor(a, b))),
    )
    if (!narrower) return true
    notices.push({
      severity: "info",
      code: "subsumed",
      message: `«${c.label}» wird nicht separat gesucht, weil «${narrower.label}» ein engerer Begriff davon ist.`,
    })
    return false
  })
  kept = kept.filter((c) => {
    const redundantIf = index.byId.get(c.id)?.redundantIf
    const by = redundantIf?.find((id) => present.has(id) && kept.some((k) => k.id === id))
    if (!by) return true
    const byLabel = kept.find((k) => k.id === by)?.label ?? by
    notices.push({
      severity: "info",
      code: "redundant",
      message: `«${c.label}» steckt schon in «${byLabel}» und steht darum nicht als eigene Komponente im String. Unten kannst du die Komponente wieder hinzufügen.`,
    })
    return false
  })

  /* 5. Notices per concept. */
  for (const c of kept) {
    const matched = c.matchedText ?? ""
    if (c.origin === "terminology" && GENERIC_ALIASES.has(normalizeText(matched))) {
      notices.push({
        severity: "warning",
        code: "generic-input",
        conceptId: c.id,
        message: `«${matched}» ist sehr allgemein und wurde als «${c.label}» gelesen. Schreib genauer, was gemeint ist, sonst wird die Suche unscharf.`,
      })
    }
    if (c.origin === "terminology" && !c.mesh.length) {
      notices.push({
        severity: "info",
        code: "no-mesh",
        conceptId: c.id,
        message: `Für «${c.label}» ist kein passendes Schlagwort (MeSH) hinterlegt. Diese Komponente wird nur mit Stichworten gesucht.`,
      })
    }
    if (c.alternatives?.length) {
      const alts = c.alternatives.slice(0, 3).map((a) => a.name).join(", ")
      notices.push({
        severity: "info",
        code: "ambiguous",
        conceptId: c.id,
        message: `«${matched}» kann mehrere Schlagworte meinen. Das Tool hat «${c.descriptor?.name ?? c.label}» gewählt, andere wären ${alts}. Bei der Komponente kannst du unter «Anderes Schlagwort wählen» umschalten.`,
      })
    }
    if (c.block === "comparison") {
      notices.push({
        severity: "info",
        code: "comparison-off",
        conceptId: c.id,
        message: `«${c.label}» steht im Block Vergleich. Der Vergleich wird standardmässig nicht in den Suchstring aufgenommen, weil er die Treffer meist zu stark einschränkt.`,
      })
    }
  }
  const meshMade = kept.filter((c) => c.origin === "mesh").length
  if (meshMade) {
    notices.push({
      severity: "info",
      code: "mesh-derived",
      message: `${meshMade === 1 ? "Eine Komponente hat das Tool direkt im MeSH-Wörterbuch gefunden" : `${meshMade} Komponenten hat das Tool direkt im MeSH-Wörterbuch gefunden`}, nicht in der eigenen Begriffstabelle. Schlagwort und Stichworte sind dort automatisch zugeordnet; prüfe sie besonders, bevor du den String übernimmst.`,
    })
  }

  /* 6. Words nothing explained: unmapped candidates, and weak MeSH matches the user may adopt. */
  const seen = new Set<string>(kept.flatMap((c) => c.freeText.map((f) => normalizeText(f.text))))
  const candidates: Candidate[] = []
  const addCandidate = (text: string, block: Block, suggestion?: MeshChoice) => {
    const key = normalizeText(text)
    if (!key || seen.has(key)) return
    seen.add(key)
    candidates.push({ id: `cand-${candidates.length}`, text, block, suggestion })
  }
  scan.spans.forEach((span, si) => {
    const taken = input.meshConsumed?.[si]
    span.tokens.forEach((t, i) => {
      if (taken?.has(i)) return
      if (!isOpenToken(span, i, scan.capsMode)) return
      addCandidate(t.raw, span.explicit ?? span.role[i]?.block ?? "population")
    })
  })
  const adopted = new Set(kept.map((c) => c.descriptor?.ui).filter(Boolean))
  let suggested = 0
  for (const mh of (input.meshHits ?? []).slice().sort((a, b) => a.pos - b.pos)) {
    if (byMesh.has(mh.descriptor.name) || adopted.has(mh.descriptor.ui)) continue
    if (meshBlockFor(mh)) continue
    const before = candidates.length
    addCandidate(mh.matched.toLowerCase(), mh.explicit ?? mh.role?.block ?? "population", mh.descriptor)
    if (candidates.length > before) suggested++
  }
  const shown = candidates.slice(0, MAX_CANDIDATES)
  const unmapped = shown.filter((c) => !c.suggestion).length
  if (unmapped) {
    notices.push({
      severity: "warning",
      code: "unmapped",
      message: `${unmapped === 1 ? "Ein Wort hat das Tool nicht erkannt" : `${unmapped} Wörter hat das Tool nicht erkannt`}. Unter «Nicht übernommene Wörter» kannst du ${unmapped === 1 ? "es" : "sie"} als Stichwort übernehmen, aber auf Englisch: PubMed findet mit deutschen Wörtern meist nichts.`,
    })
  }
  if (suggested) {
    notices.push({
      severity: "info",
      code: "mesh-suggestions",
      message: `${suggested === 1 ? "Ein Wort steht" : `${suggested} Wörter stehen`} im MeSH-Wörterbuch, ${suggested === 1 ? "ist" : "sind"} aber zu allgemein für eine eigene Komponente (zum Beispiel eine Körperregion). Unter «Nicht übernommene Wörter» übernimmst du ${suggested === 1 ? "es" : "sie"} mit einem Klick.`,
    })
  }
  if (!kept.length) {
    notices.push({
      severity: "warning",
      code: "no-concepts",
      message: "Das Tool hat keine Suchkomponente erkannt. Nenne Erkrankung, Intervention oder Outcome konkreter, oder füge unten eine Komponente hinzu.",
    })
  }

  return {
    concepts: kept,
    candidates: shown,
    notices,
    studyTypes,
    filterSuggestions: extractDemographics(input.demographicsText),
  }
}

/**
 * Synchronous analysis with the curated terminology only (no MeSH index).
 * The terminology can be swapped (tests); the default is the shipped table.
 */
export function analyze(input: AnalyzeInput, terminology: Terminology = TERMINOLOGY): AnalysisResult {
  const units = prepareUnits(input)
  const scan = scanCurated(units, terminology)
  return assemble({ terminology, scan, demographicsText: demographicsText(units), withMesh: false })
}

/** The case text the age and sex suggestions are read from: every kept sentence, comma-separated parts included. */
export function demographicsText(units: Unit[]): string {
  return units.map((u) => u.text).join(". ")
}
