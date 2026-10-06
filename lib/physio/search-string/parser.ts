/**
 * Concept detection. Rule based: normalise, find PICO markers, match the
 * terminology longest n-gram first, report everything else as unmapped
 * candidates. Nothing is guessed: a word that is not in the terminology never
 * gets a MeSH heading.
 */
import terminologyJson from "./terminology.json"
import { isStopword, normalizeText, phraseKey, tokenize, type Token } from "./normalize"
import type {
  AnalysisResult,
  AnalyzeInput,
  Block,
  Candidate,
  Category,
  Concept,
  Notice,
  PicoInput,
  StudyTypeId,
  TermConcept,
  Terminology,
} from "./types"

export const TERMINOLOGY = terminologyJson as unknown as Terminology

const MAX_ALIAS_TOKENS = 7

/* ── Terminology index ──────────────────────────────────────────── */

interface AliasEntry {
  termId: string
  /** Short acronyms ("MS", "LWS") only match when typed in capitals. */
  requireUpper: boolean
}

interface TermIndex {
  byKey: Map<string, AliasEntry>
  byId: Map<string, TermConcept>
}

const indexCache = new WeakMap<Terminology, TermIndex>()

function getIndex(t: Terminology): TermIndex {
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

type RoleBlock = Block

interface Marker {
  words: string[]
  block: RoleBlock
  /** Strong markers may move a concept out of its default block. */
  strong: boolean
}

const MARKER_DEFS: Array<{ phrases: string[]; block: RoleBlock; strong: boolean }> = [
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
      "comparison",
      "comparator",
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
  /(?:^|[\s;,.(])(P|I|C|O|Population|Patienten|Patient|Problem|Intervention|Vergleichsintervention|Vergleich|Kontrolle|Comparison|Comparator|Control|Outcome|Outcomes|Zielgr(?:ö|oe)sse|Endpunkt|Ergebnis|Studientyp|Studiendesign|Study type)\s*[:=]/gi

type ExplicitRole = Block | "studytype"

function explicitRole(key: string): ExplicitRole | null {
  const k = key.toLowerCase()
  if (key.length === 1 && key !== key.toUpperCase()) return null
  if (["p", "population", "patienten", "patient", "problem"].includes(k)) return "population"
  if (["i", "intervention"].includes(k)) return "intervention"
  if (["c", "vergleichsintervention", "vergleich", "kontrolle", "comparison", "comparator", "control"].includes(k)) return "comparison"
  if (["o", "outcome", "outcomes", "zielgrösse", "zielgroesse", "endpunkt", "ergebnis"].includes(k)) return "outcome"
  if (["studientyp", "studiendesign", "study type"].includes(k)) return "studytype"
  return null
}

interface Segment {
  text: string
  role: ExplicitRole | null
}

/** Splits at "P:", "Intervention:" and similar prefixes. Text before the first prefix has no role. */
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

/* ── Matching ───────────────────────────────────────────────────── */

interface Hit {
  termId: string
  matched: string
  explicit: Block | null
  role: Marker | null
  order: number
}

interface RawCandidate {
  text: string
  block: Block
}

function matchesWords(tokens: Token[], i: number, words: string[]): boolean {
  if (i + words.length > tokens.length) return false
  for (let k = 0; k < words.length; k++) if (tokens[i + k].norm !== words[k]) return false
  return true
}

function scanSentence(
  clauses: Token[][],
  index: TermIndex,
  explicit: Block | null,
  hits: Hit[],
  candidates: RawCandidate[],
  orderStart: number,
): number {
  let role: Marker | null = null
  let order = orderStart
  let run: Token[] = []

  const flushRun = () => {
    if (!run.length) return
    const block = explicit ?? role?.block ?? "population"
    // One candidate per word: German compounds are single tokens, and a phrase can be added by hand.
    for (const t of run) candidates.push({ text: t.raw, block })
    run = []
  }

  for (const tokens of clauses) {
    let i = 0
    while (i < tokens.length) {
      const marker = MARKERS.find((mk) => matchesWords(tokens, i, mk.words))
      if (marker) {
        flushRun()
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
        flushRun()
        hits.push({
          termId: entry.termId,
          matched: slice.map((t) => t.orig).join(" "),
          explicit,
          role,
          order: order++,
        })
        i += n
        matched = true
        break
      }
      if (matched) continue

      const t = tokens[i]
      if (isStopword(t.norm) || t.norm.length < 3 || /^\d+$/.test(t.norm)) flushRun()
      else run.push(t)
      i++
    }
    flushRun()
  }
  return order
}

function splitSentences(text: string): string[] {
  return text
    .replace(/\bvs\./gi, "vs ")
    .split(/[.!?;:\n]+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

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

/**
 * Analyses a question and optional PICO fields.
 * The terminology can be swapped (tests); the default is the shipped table.
 */
export function analyze(input: AnalyzeInput, terminology: Terminology = TERMINOLOGY): AnalysisResult {
  const index = getIndex(terminology)
  const hits: Hit[] = []
  const rawCandidates: RawCandidate[] = []
  let order = 0

  const segments: Segment[] = []
  for (const key of PICO_ORDER) {
    const value = input.pico?.[key]?.trim()
    if (value) segments.push({ text: value, role: PICO_ROLE[key] })
  }
  const text = input.text?.trim()
  if (text) segments.push(...splitExplicit(text))

  for (const seg of segments) {
    const explicit: Block | null = seg.role && seg.role !== "studytype" ? seg.role : null
    for (const sentence of splitSentences(seg.text)) {
      order = scanSentence(sentence.split(",").map(tokenize), index, explicit, hits, rawCandidates, order)
    }
  }

  const notices: Notice[] = []

  // One concept per terminology id. An explicit block wins over a guessed one.
  const chosen = new Map<string, Hit>()
  for (const hit of hits) {
    const prev = chosen.get(hit.termId)
    if (!prev || (!prev.explicit && hit.explicit)) chosen.set(hit.termId, hit)
  }

  const studyTypes: StudyTypeId[] = []
  const concepts: Concept[] = []
  for (const hit of [...chosen.values()].sort((a, b) => a.order - b.order)) {
    const term = index.byId.get(hit.termId)!
    if (term.category === "studytype") {
      if (!studyTypes.includes(term.id as StudyTypeId)) studyTypes.push(term.id as StudyTypeId)
      notices.push({
        severity: "info",
        code: "studytype-filter",
        message: `Studientyp «${term.label}» erkannt. Er wird als Filter vorgeschlagen, nicht als Suchkomponente.`,
      })
      continue
    }
    concepts.push(conceptFromTerm(term, blockFor(term.category, hit.explicit, hit.role), hit.matched))
  }

  // Narrower concept present: the broader one adds nothing.
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
  kept = kept.filter((c) => {
    const redundantIf = index.byId.get(c.id)?.redundantIf
    const by = redundantIf?.find((id) => present.has(id) && kept.some((k) => k.id === id))
    if (!by) return true
    const byLabel = kept.find((k) => k.id === by)?.label ?? by
    notices.push({
      severity: "info",
      code: "redundant",
      message: `«${c.label}» ist in «${byLabel}» schon enthalten und wurde weggelassen. Du kannst sie unten wieder hinzufügen.`,
    })
    return false
  })

  for (const c of kept) {
    const matched = c.matchedText ?? ""
    if (GENERIC_ALIASES.has(normalizeText(matched))) {
      notices.push({
        severity: "warning",
        code: "generic-input",
        conceptId: c.id,
        message: `«${matched}» ist sehr allgemein und wurde als «${c.label}» gelesen. Schreib genauer, was gemeint ist, sonst wird die Suche unscharf.`,
      })
    }
    if (!c.mesh.length) {
      notices.push({
        severity: "info",
        code: "no-mesh",
        conceptId: c.id,
        message: `Für «${c.label}» ist kein passendes Schlagwort (MeSH) hinterlegt. Diese Komponente wird nur mit Stichworten gesucht.`,
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

  const seen = new Set<string>(kept.flatMap((c) => c.freeText.map((f) => normalizeText(f.text))))
  const candidates: Candidate[] = []
  for (const rc of rawCandidates) {
    const key = normalizeText(rc.text)
    if (!key || seen.has(key)) continue
    seen.add(key)
    candidates.push({ id: `cand-${candidates.length}`, text: rc.text, block: rc.block })
  }
  const shown = candidates.slice(0, 14)
  if (shown.length) {
    notices.push({
      severity: "warning",
      code: "unmapped",
      message: `${shown.length === 1 ? "Ein Wort wurde" : `${shown.length} Wörter wurden`} nicht erkannt. Du kannst sie als eigenes Stichwort übernehmen. Die Datenbank ist englisch: deutsche Wörter finden dort meist nichts.`,
    })
  }
  if (!kept.length) {
    notices.push({
      severity: "warning",
      code: "no-concepts",
      message: "Es wurde keine Suchkomponente erkannt. Formuliere die Frage konkreter oder füge unten eine Komponente hinzu.",
    })
  }

  return { concepts: kept, candidates: shown, notices, studyTypes }
}
