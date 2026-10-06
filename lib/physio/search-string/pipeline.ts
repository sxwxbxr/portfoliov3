/**
 * Concept detection, second layer: the MeSH index. Runs after the curated
 * terminology has taken what it knows and looks at the remaining words:
 * n-grams of up to four words (longest first), German inflection and compound
 * splitting, ambiguity ranking by source and MeSH tree. Everything runs in the
 * browser; the index only sees normalised word keys (shard names), never the
 * question.
 *
 * Network cost per analysis: one `lookupTerms` round for all candidate keys
 * (one shard per first-two-letters pair), optionally a second round for
 * compound heads, and one `getDescriptors` round for the matched descriptors.
 */
import { HEAD_TARGET, genericSplits, germanForms, knownHeadSplits, leadForms, type CompoundSplit } from "./german"
import { SOURCE_RANK, getMeshIndex, type MeshIndex, type MeshTermRef } from "./mesh-index"
import { descriptorLabel, meshKind, treeRelevance } from "./mesh-concepts"
import { isStopTerm, normalizeMeshTerm } from "./mesh-normalize"
import { isStopword } from "./normalize"
import {
  assemble,
  demographicsText,
  getIndex,
  isOpenToken,
  prepareUnits,
  scanCurated,
  TERMINOLOGY,
  type Hit,
  type MeshHit,
  type Scan,
} from "./parser"
import type { AnalysisResult, AnalyzeInput, MeshChoice, Notice, Terminology } from "./types"

export interface AnalyzeOptions {
  terminology?: Terminology
  /** The MeSH index to use. Default: the shared browser index. `null`: curated terminology only. */
  mesh?: MeshIndex | null
}

const MAX_NGRAM = 4
const MAX_ALTERNATIVES = 4
const MAX_REFS_PER_MATCH = 6
const MIN_COMPOUND_LENGTH = 7

interface Cand {
  span: number
  start: number
  n: number
  keys: string[]
}

interface Match {
  span: number
  start: number
  n: number
  refs: MeshTermRef[]
  /** Curated hits this phrase covers. They are dropped only when the phrase becomes a hit. */
  covers: Hit[]
}

interface CompoundToken {
  span: number
  start: number
  token: string
  norm: string
  known: CompoundSplit[]
  generic: CompoundSplit[]
}

interface CompoundHit {
  token: CompoundToken
  split: CompoundSplit
  modifierRefs: MeshTermRef[]
  headRefs: MeshTermRef[]
}

function formsOf(tokens: Array<{ raw: string }>): string[][] {
  return tokens.map((t, k) => {
    const norm = normalizeMeshTerm(t.raw)
    return k === tokens.length - 1 ? germanForms(norm) : leadForms(norm)
  })
}

function product(parts: string[][]): string[] {
  let out: string[] = [""]
  for (const p of parts) out = out.flatMap((prefix) => p.map((f) => (prefix ? `${prefix} ${f}` : f)))
  return out
}

/** Higher is better: the source decides, the MeSH tree breaks ties between descriptors of one word. */
function score(ref: MeshTermRef, d: MeshChoice): number {
  return (3 - SOURCE_RANK[ref.source]) * 10 + treeRelevance(d.treeNumbers)
}

/** Descriptors for a term's refs, best first, duplicates removed. */
function rank(refs: MeshTermRef[], descriptors: Map<string, MeshChoice>): MeshChoice[] {
  const best = new Map<string, number>()
  for (const ref of refs) {
    const d = descriptors.get(ref.ui)
    if (!d) continue
    const s = score(ref, d)
    if (s > (best.get(ref.ui) ?? -1)) best.set(ref.ui, s)
  }
  return [...best.entries()]
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    .map(([ui]) => descriptors.get(ui)!)
}

function topRefs(refs: MeshTermRef[]): MeshTermRef[] {
  const seen = new Set<string>()
  return refs
    .slice()
    .sort((a, b) => SOURCE_RANK[a.source] - SOURCE_RANK[b.source])
    .filter((r) => (seen.has(r.ui) ? false : (seen.add(r.ui), true)))
    .slice(0, MAX_REFS_PER_MATCH)
}

/** Acronym refs (MS, COPD) count only for a single token typed in capitals. A lowercase "ms" is a unit, not a disease. */
function allowed(refs: MeshTermRef[] | undefined, n: number, upper: boolean): MeshTermRef[] {
  if (!refs) return []
  return refs.filter((r) => !r.acronym || (n === 1 && upper))
}

const isUpper = (s: string) => s === s.toUpperCase() && s !== s.toLowerCase()

interface StageResult {
  meshHits: MeshHit[]
  extraHits: Hit[]
  /** Curated hits taken over by a longer MeSH phrase. */
  dropped: Set<Hit>
  consumed: Array<Set<number>>
  notices: Notice[]
}

async function meshStage(scan: Scan, mesh: MeshIndex, terminology: Terminology): Promise<StageResult> {
  const { spans, capsMode } = scan
  const index = getIndex(terminology)

  /* 1. Candidate keys for every open position, plus compound prefixes for long single words. */
  const cands: Cand[] = []
  const keys = new Set<string>()
  const compounds: CompoundToken[] = []
  spans.forEach((span, si) => {
    const toks = span.tokens
    for (let i = 0; i < toks.length; i++) {
      // A phrase may run over tokens a curated alias took ("myofascial pain syndrome" over "pain"), never over markers or names.
      if (span.consumed[i] && !span.hit[i]) continue
      for (let n = Math.min(MAX_NGRAM, toks.length - i); n >= 1; n--) {
        let free = true
        for (let k = 0; k < n; k++) if (span.consumed[i + k] && !(n > 1 && span.hit[i + k])) free = false
        if (!free) continue
        if (n === 1) {
          if (!isOpenToken(span, i, capsMode)) continue
        } else {
          if (isStopword(toks[i].norm) || isStopword(toks[i + n - 1].norm)) continue
          if (!toks.slice(i, i + n).some((_, k) => isOpenToken(span, i + k, false))) continue
        }
        const forms = product(formsOf(toks.slice(i, i + n))).filter((k) => !isStopTerm(k))
        if (!forms.length) continue
        cands.push({ span: si, start: i, n, keys: forms })
        for (const f of forms) keys.add(f)
      }
      if (!span.consumed[i] && isOpenToken(span, i, capsMode)) {
        const norm = normalizeMeshTerm(toks[i].raw)
        if (norm.length >= MIN_COMPOUND_LENGTH && !/\d/.test(norm)) {
          const known = knownHeadSplits(norm)
          const generic = genericSplits(norm).filter((s) => s.modifier.length >= 5 && s.head.length >= 5)
          if (known.length || generic.length) {
            compounds.push({ span: si, start: i, token: toks[i].orig, norm, known, generic })
            for (const s of [...known, ...generic]) for (const f of s.modifierForms) keys.add(f)
          }
        }
      }
    }
  })

  const found = keys.size ? await mesh.lookupTerms([...keys]) : new Map<string, MeshTermRef[]>()

  /* 2. Greedy resolution, longest n-gram first. */
  const taken = spans.map(() => new Set<number>())
  const byStart = new Map<string, Cand[]>()
  for (const c of cands) {
    const k = `${c.span}:${c.start}`
    const list = byStart.get(k)
    if (list) list.push(c)
    else byStart.set(k, [c])
  }
  const matches: Match[] = []
  spans.forEach((span, si) => {
    for (let i = 0; i < span.tokens.length; i++) {
      if (taken[si].has(i)) continue
      const list = (byStart.get(`${si}:${i}`) ?? []).sort((a, b) => b.n - a.n)
      for (const c of list) {
        let free = true
        for (let k = 0; k < c.n; k++) if (taken[si].has(i + k)) free = false
        if (!free) continue
        // Over curated tokens only when strictly longer than every curated hit it covers, and covering each one completely.
        const covered = new Set<Hit>()
        for (let k = 0; k < c.n; k++) {
          const h = span.hit[i + k]
          if (h) covered.add(h)
        }
        if ([...covered].some((h) => h.len >= c.n || span.hit.slice(i, i + c.n).filter((x) => x === h).length < h.len)) continue
        const upper = c.n === 1 && isUpper(span.tokens[i].orig)
        const hitKey = c.keys.find((k) => allowed(found.get(k), c.n, upper).length > 0)
        if (hitKey === undefined) continue
        matches.push({ span: si, start: i, n: c.n, refs: allowed(found.get(hitKey), c.n, upper), covers: [...covered] })
        for (let k = 0; k < c.n; k++) taken[si].add(i + k)
        i += c.n - 1
        break
      }
    }
  })

  /* 3. Compounds: unmatched long words that split into a known head plus a known modifier. */
  const open = compounds.filter((c) => !taken[c.span].has(c.start) && !spans[c.span].consumed[c.start])
  const known: CompoundHit[] = []
  const pendingGeneric: CompoundHit[] = []
  const phase2 = new Set<string>()
  for (const c of open) {
    const modifierHit = (s: CompoundSplit) => {
      const form = s.modifierForms.find((f) => allowed(found.get(f), 1, false).length > 0)
      return form === undefined ? null : allowed(found.get(form), 1, false)
    }
    const k = c.known.map((s) => ({ s, refs: modifierHit(s) })).find((x) => x.refs)
    if (k?.refs) {
      const target = k.s.kind ? HEAD_TARGET[k.s.kind] : undefined
      if (target?.term) phase2.add(target.term)
      known.push({ token: c, split: k.s, modifierRefs: k.refs, headRefs: [] })
      continue
    }
    for (const s of c.generic) {
      const refs = modifierHit(s)
      if (!refs) continue
      for (const f of germanForms(s.head)) phase2.add(f)
      pendingGeneric.push({ token: c, split: s, modifierRefs: refs, headRefs: [] })
    }
  }
  const found2 = phase2.size ? await mesh.lookupTerms([...phase2]) : new Map<string, MeshTermRef[]>()
  const compoundHits: CompoundHit[] = []
  for (const h of known) {
    const target = h.split.kind ? HEAD_TARGET[h.split.kind] : undefined
    h.headRefs = target?.term ? (found2.get(target.term) ?? []) : []
    compoundHits.push(h)
  }
  const doneTokens = new Set(known.map((h) => `${h.token.span}:${h.token.start}`))
  const genericByToken = new Map<string, CompoundHit>()
  for (const h of pendingGeneric) {
    const tk = `${h.token.span}:${h.token.start}`
    if (doneTokens.has(tk)) continue
    const form = germanForms(h.split.head).find((f) => allowed(found2.get(f), 1, false).length > 0)
    if (form === undefined) continue
    h.headRefs = allowed(found2.get(form), 1, false)
    const prev = genericByToken.get(tk)
    const bal = (x: CompoundHit) => Math.min(x.split.modifier.length, x.split.head.length)
    if (!prev || bal(h) > bal(prev)) genericByToken.set(tk, h)
  }
  compoundHits.push(...genericByToken.values())

  /* 4. Descriptors for everything that matched. */
  const uis = new Set<string>()
  for (const m of matches) for (const r of topRefs(m.refs)) uis.add(r.ui)
  for (const h of compoundHits) for (const r of [...topRefs(h.modifierRefs), ...topRefs(h.headRefs)]) uis.add(r.ui)
  const descriptors = uis.size ? ((await mesh.getDescriptors([...uis])) as Map<string, MeshChoice>) : new Map<string, MeshChoice>()

  /* 5. Hits. A match whose best descriptor is irrelevant for physiotherapy (publication type, place) is dropped. */
  const meshHits: MeshHit[] = []
  const extraHits: Hit[] = []
  const notices: Notice[] = []
  const consumed = spans.map(() => new Set<number>())
  const dropped = new Set<Hit>()

  const hitFor = (si: number, start: number, n: number, ranked: MeshChoice[], matched: string, force: boolean): MeshHit | null => {
    const best = ranked[0]
    if (!best || treeRelevance(best.treeNumbers) === 0) return null
    const span = spans[si]
    return {
      descriptor: best,
      alternatives: ranked.slice(1).filter((d) => treeRelevance(d.treeNumbers) > 0).slice(0, MAX_ALTERNATIVES),
      matched,
      pos: span.base + start,
      explicit: span.explicit,
      role: span.role[start],
      question: span.question,
      cue: span.cue.slice(start, start + n).some(Boolean),
      words: n,
      sole: span.tokens.length === n,
      force,
    }
  }

  for (const m of matches) {
    const span = spans[m.span]
    const matched = span.tokens.slice(m.start, m.start + m.n).map((t) => t.orig).join(" ")
    const hit = hitFor(m.span, m.start, m.n, rank(topRefs(m.refs), descriptors), matched, false)
    if (!hit) continue
    meshHits.push(hit)
    for (let k = 0; k < m.n; k++) consumed[m.span].add(m.start + k)
    for (const h of m.covers) dropped.add(h)
  }

  const split = (token: string, mod: string, head: string): Notice => ({
    severity: "info",
    code: "compound",
    message: `Das Tool hat «${token}» in «${mod}» und «${head}» zerlegt. Beide Teile stehen als eigene Komponenten im String, mit AND verknüpft. Prüfe, ob das gemeint ist.`,
  })

  for (const h of compoundHits) {
    const { span: si, start, token } = h.token
    const kind = h.split.kind
    const target = kind ? HEAD_TARGET[kind] : undefined
    // The modifier is a real concept when the head says what is meant (pain, injury, exercise ...); a bare body part is not.
    const strong = kind ? !!(target?.term || target?.curated) : h.headRefs.length > 0
    const modifier = hitFor(si, start, 1, rank(topRefs(h.modifierRefs), descriptors), token, strong)
    if (!modifier) continue
    const modLabel = descriptorLabel(modifier.descriptor)
    const capital = h.split.head.charAt(0).toUpperCase() + h.split.head.slice(1)
    meshHits.push(modifier)
    consumed[si].add(start)

    if (target?.curated) {
      const term = index.byId.get(target.curated)
      if (term) {
        const span = spans[si]
        extraHits.push({
          termId: target.curated,
          matched: token,
          explicit: span.explicit,
          role: span.role[start],
          question: span.question,
          pos: span.base + start,
          len: 1,
        })
        notices.push(split(token, modLabel, term.label))
      }
    } else if (target?.term) {
      const head = hitFor(si, start, 1, rank(topRefs(h.headRefs), descriptors), token, true)
      if (head) {
        meshHits.push(head)
        notices.push(split(token, modLabel, descriptorLabel(head.descriptor)))
      }
    } else if (kind) {
      // "Kältetherapie", "Rückenbereich": the generic head is left out.
      if (strong || meshKind(modifier.descriptor) !== "weak") {
        notices.push({
          severity: "info",
          code: "compound",
          message: `Das Tool liest «${token}» als «${modLabel}». Der Teil «${capital}» ist zu allgemein für eine eigene Komponente und bleibt weg.`,
        })
      }
    } else if (h.headRefs.length) {
      const head = hitFor(si, start, 1, rank(topRefs(h.headRefs), descriptors), token, true)
      if (head) {
        meshHits.push(head)
        notices.push(split(token, modLabel, descriptorLabel(head.descriptor)))
      }
    }
  }

  return { meshHits, extraHits, dropped, consumed, notices }
}

/**
 * Full analysis: curated terminology first, then the MeSH index on what is
 * left. Never throws on a failing index: the result then holds the curated
 * concepts plus a warning.
 */
export async function analyzeAsync(input: AnalyzeInput, options: AnalyzeOptions = {}): Promise<AnalysisResult> {
  const terminology = options.terminology ?? TERMINOLOGY
  const units = prepareUnits(input)
  const scan = scanCurated(units, terminology)
  const text = demographicsText(units)
  const mesh = options.mesh === undefined ? getMeshIndex() : options.mesh

  if (mesh) {
    try {
      const stage = await meshStage(scan, mesh, terminology)
      return assemble({
        terminology,
        scan,
        extraHits: stage.extraHits,
        droppedHits: stage.dropped,
        meshHits: stage.meshHits,
        meshConsumed: stage.consumed,
        extraNotices: stage.notices,
        demographicsText: text,
        withMesh: true,
      })
    } catch {
      const result = assemble({ terminology, scan, demographicsText: text, withMesh: false })
      result.notices.unshift({
        severity: "warning",
        code: "mesh-unavailable",
        message:
          "Das MeSH-Wörterbuch liess sich nicht laden. Diese Auswertung nutzt nur die eigene Begriffstabelle, darum fehlen vermutlich Schlagworte. Prüfe die Verbindung und klick noch einmal auf «Suchstring erstellen».",
      })
      return result
    }
  }
  return assemble({ terminology, scan, demographicsText: text, withMesh: false })
}
