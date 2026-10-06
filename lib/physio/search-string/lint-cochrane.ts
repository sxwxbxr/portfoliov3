/**
 * "Eigenen String prüfen" for the Cochrane Library (CENTRAL, Search Manager).
 *
 * Rules follow the official help (see COCHRANE_SOURCES in profiles.ts):
 *  - MeSH only inside [ ]: [mh "Low Back Pain"] explodes, [mh ^"Low Back Pain"] does not,
 *    quotes for multi-word headings, qualifiers /AE in capitals, [mj] for major topics.
 *  - Field codes follow the term: "lung cancer":ti,ab,kw (comma, no spaces).
 *  - Quoted phrases do not support * or ?; use NEXT: (hearing NEXT aid*).
 *  - Word root of at least three characters, one * per word.
 *  - NOT before AND before OR when there are no parentheses.
 *  - Search Manager lines: #1, #2 ... combined with AND/OR/NOT, no free text in a combination line.
 *
 * Input can be one line (the search box) or a whole strategy, one search per line,
 * optionally numbered "#1 ...".
 */
import { convertLineToCochrane } from "./convert"
import { genericLevel, levenshtein, wrapOrRuns } from "./lint-shared"
import { COCHRANE_MIN_STEM } from "./profiles"
import type { Edit, LintFinding, LintSeverity, Range } from "./types"

export const COCHRANE_FIELD_CODES = ["ti", "ab", "kw", "au", "so", "doi", "pt", "an", "tp", "crg", "la"] as const
const KNOWN_FIELDS = new Set<string>(COCHRANE_FIELD_CODES)

/** Suggestions for field codes people bring over from PubMed or Ovid. */
const FIELD_ALIASES: Record<string, string> = {
  tiab: "ti,ab",
  tw: "ti,ab,kw",
  mp: "ti,ab,kw",
  title: "ti",
  abstract: "ab",
  keyword: "kw",
  keywords: "kw",
  author: "au",
  language: "la",
}

const QUOTE_CHARS = new Set(['"', "„", "“", "”", "«", "»", "‟"])
const isQuote = (c: string) => QUOTE_CHARS.has(c)

/* ── Lexer ──────────────────────────────────────────────────────── */

export interface CField {
  s: number
  e: number
  codes: string[]
  raw: string
  trailingComma: boolean
}

type CTok =
  | { t: "lp" | "rp"; s: number; e: number }
  | { t: "phrase"; s: number; e: number; inner: string; closed: boolean; openCh: string; closeCh: string }
  | { t: "bracket"; s: number; e: number; closed: boolean }
  | { t: "range"; s: number; e: number; closed: boolean }
  | ({ t: "field" } & CField)
  | { t: "ref"; s: number; e: number; n: number }
  | { t: "op"; s: number; e: number; text: string; op: COp["op"]; bad?: "next-dist" | "near-dist" }
  | { t: "word"; s: number; e: number; text: string }
  | { t: "stray"; s: number; e: number; text: string; afterQuote: boolean }

const FIELD_RE = /^:([A-Za-z]+(?:,[A-Za-z]+)*)(,?)/

function lexBracket(src: string, i: number): { e: number; closed: boolean } {
  const n = src.length
  let depth = 0
  let j = i
  while (j < n && src[j] !== "\n") {
    const c = src[j]
    if (isQuote(c)) {
      j++
      while (j < n && !isQuote(src[j]) && src[j] !== "\n") j++
      if (j < n && isQuote(src[j])) j++
      continue
    }
    if (c === "[") depth++
    if (c === "]") {
      depth--
      if (depth === 0) return { e: j + 1, closed: true }
    }
    j++
  }
  // No closing bracket: the bracket covers the heading it opens, not the rest of the line.
  const m = /^\[\s*[A-Za-z]*\s*\^?\s*(?:[“"„«‟”»][^“"„«‟”»]*[“"„«‟”»]?|[^\s[\]/"()]+)?/.exec(src.slice(i))
  return { e: i + (m ? m[0].length : 1), closed: false }
}

function lex(src: string): CTok[] {
  const out: CTok[] = []
  const n = src.length
  const isBreak = (c: string) => /\s/.test(c) || "()[]{}".includes(c) || isQuote(c)
  let i = 0
  while (i < n) {
    const c = src[i]
    if (/\s/.test(c)) {
      i++
    } else if (c === "(" || c === ")") {
      out.push({ t: c === "(" ? "lp" : "rp", s: i, e: i + 1 })
      i++
    } else if (c === "[") {
      const b = lexBracket(src, i)
      out.push({ t: "bracket", s: i, e: b.e, closed: b.closed })
      i = b.e
    } else if (c === "{") {
      const close = src.indexOf("}", i + 1)
      const e = close === -1 ? n : close + 1
      out.push({ t: "range", s: i, e, closed: close !== -1 })
      i = e
    } else if (c === "]" || c === "}") {
      out.push({ t: "stray", s: i, e: i + 1, text: c, afterQuote: false })
      i++
    } else if (isQuote(c)) {
      let j = i + 1
      while (j < n && !isQuote(src[j])) j++
      if (j >= n) {
        out.push({ t: "phrase", s: i, e: n, inner: src.slice(i + 1), closed: false, openCh: c, closeCh: "" })
        i = n
      } else {
        out.push({ t: "phrase", s: i, e: j + 1, inner: src.slice(i + 1, j), closed: true, openCh: c, closeCh: src[j] })
        i = j + 1
        if (i < n && !isBreak(src[i]) && src[i] !== ":") {
          let k = i
          while (k < n && !isBreak(src[k]) && src[k] !== ":") k++
          out.push({ t: "stray", s: i, e: k, text: src.slice(i, k), afterQuote: true })
          i = k
        }
      }
    } else if (c === ":") {
      const m = FIELD_RE.exec(src.slice(i))
      if (m) {
        out.push({ t: "field", s: i, e: i + m[0].length, codes: m[1].split(",").map((x) => x.toLowerCase()), raw: m[1], trailingComma: m[2] === "," })
        i += m[0].length
      } else {
        out.push({ t: "stray", s: i, e: i + 1, text: ":", afterQuote: false })
        i++
      }
    } else {
      let j = i
      while (j < n && !isBreak(src[j]) && !(src[j] === ":" && /[A-Za-z]/.test(src[j + 1] ?? ""))) j++
      pushWord(out, src, i, j)
      i = j
    }
  }
  return out
}

function pushWord(out: CTok[], src: string, s: number, e: number) {
  let end = e
  let trailing: { s: number; e: number; text: string } | null = null
  const text0 = src.slice(s, e)
  const m = /^(.*[\p{L}\p{N}*?])([,;]+)$/u.exec(text0)
  if (m) {
    end = s + m[1].length
    trailing = { s: end, e, text: m[2] }
  }
  const text = src.slice(s, end)
  let ref: RegExpExecArray | null
  if ((ref = /^#(\d+)$/.exec(text))) out.push({ t: "ref", s, e: end, n: Number(ref[1]) })
  else if (/^(and|or|not)$/i.test(text)) out.push({ t: "op", s, e: end, text, op: text.toUpperCase() as COp["op"] })
  else if (/^near(\/\d+)?$/i.test(text)) out.push({ t: "op", s, e: end, text, op: "NEAR" })
  else if (/^next$/i.test(text)) out.push({ t: "op", s, e: end, text, op: "NEXT" })
  else if (/^next\/.*$/i.test(text)) out.push({ t: "op", s, e: end, text, op: "NEXT", bad: "next-dist" })
  else if (/^near\/.*$/i.test(text)) out.push({ t: "op", s, e: end, text, op: "NEAR", bad: "near-dist" })
  else if (/^[^\p{L}\p{N}*?#]+$/u.test(text)) out.push({ t: "stray", s, e: end, text, afterQuote: false })
  else out.push({ t: "word", s, e: end, text })
  if (trailing) out.push({ t: "stray", s: trailing.s, e: trailing.e, text: trailing.text, afterQuote: false })
}

/* ── MeSH bracket ───────────────────────────────────────────────── */

export interface MeshParse {
  /** The label before the heading, normally "mh". */
  label: string
  labelS: number
  labelE: number
  noSpace: boolean
  caret: boolean
  caretInside: boolean
  caretAfter: boolean
  /** Position of the first character after the label (insert point for a missing space). */
  afterLabel: number
  heading: string
  /** Range of the heading text without quotes; for an unquoted heading the trimmed run. */
  headingS: number
  headingE: number
  /** Range including the quotes. */
  fullS: number
  fullE: number
  quoted: boolean
  unclosedQuote: boolean
  major: boolean
  qualifiers: string[]
  qualS: number
  qualE: number
  junk: string
  junkS: number
  closed: boolean
}

/** Reads the inside of a [mh ...] bracket. Used by the linter and by the converter. */
export function parseMesh(src: string, s: number, e: number, closed: boolean): MeshParse {
  const innerEnd = closed ? e - 1 : e
  let p = s + 1
  const skip = () => {
    while (p < innerEnd && /\s/.test(src[p])) p++
  }
  skip()
  const labelS = p
  while (p < innerEnd && /[A-Za-z]/.test(src[p])) p++
  const labelE = p
  const label = src.slice(labelS, labelE)
  const afterLabel = p
  const noSpace = p < innerEnd && (src[p] === "^" || isQuote(src[p]))
  skip()
  let caret = false
  if (src[p] === "^" && p < innerEnd) {
    caret = true
    p++
    skip()
  }
  let heading = ""
  let headingS = p
  let headingE = p
  let fullS = p
  let fullE = p
  let quoted = false
  let unclosedQuote = false
  let caretInside = false
  if (p < innerEnd && isQuote(src[p])) {
    quoted = true
    let j = p + 1
    while (j < innerEnd && !isQuote(src[j])) j++
    unclosedQuote = j >= innerEnd
    heading = src.slice(p + 1, j)
    headingS = p + 1
    headingE = j
    fullS = p
    fullE = unclosedQuote ? j : j + 1
    p = fullE
    if (heading.startsWith("^")) caretInside = true
  } else {
    let j = p
    while (j < innerEnd && src[j] !== "[" && src[j] !== "/" && src[j] !== "^") j++
    const run = src.slice(p, j)
    const trimmed = run.replace(/\s+$/, "")
    heading = trimmed
    headingS = p
    headingE = p + trimmed.length
    fullS = headingS
    fullE = headingE
    p = j
  }
  skip()
  let caretAfter = false
  if (p < innerEnd && src[p] === "^") {
    caretAfter = true
    p++
    skip()
  }
  let major = false
  if (p < innerEnd && src[p] === "[") {
    const close = src.indexOf("]", p)
    const end = close === -1 || close >= innerEnd ? innerEnd : close
    if (/^\[\s*mj\s*$/i.test(src.slice(p, end))) {
      major = true
      p = Math.min(innerEnd, end + 1)
    }
    skip()
  }
  let qualifiers: string[] = []
  let qualS = p
  let qualE = p
  if (p < innerEnd && src[p] === "/") {
    qualS = p + 1
    qualE = innerEnd
    qualifiers = src
      .slice(qualS, qualE)
      .split(",")
      .map((q) => q.trim())
      .filter(Boolean)
    p = innerEnd
  }
  skip()
  const junkS = p
  const junk = p < innerEnd ? src.slice(p, innerEnd).trim() : ""
  return {
    label, labelS, labelE, noSpace, caret, caretInside, caretAfter, afterLabel, heading, headingS, headingE, fullS, fullE,
    quoted, unclosedQuote, major, qualifiers, qualS, qualE, junk, junkS, closed,
  }
}

/** Is this bracket a Cochrane MeSH search ([mh "x"], [mh ^x], [mh /AE]) and not a PubMed tag like [mh] or [tiab]? */
function bracketKind(src: string, t: Extract<CTok, { t: "bracket" }>): "mesh" | "pubmed" {
  const inner = src.slice(t.s + 1, t.closed ? t.e - 1 : t.e)
  if (/^\s*mh\s*$/i.test(inner)) return "pubmed"
  if (/^\s*mh[\s^"“”„«»‟/]/i.test(inner)) return "mesh"
  if (/^\s*mesh[\s^"“”„«»‟]/i.test(inner)) return "mesh"
  if (!t.closed && /^\s*mh/i.test(inner)) return "mesh"
  return "pubmed"
}

/* ── Tree ───────────────────────────────────────────────────────── */

export interface COperand {
  kind: "operand"
  sub: "word" | "phrase" | "mesh" | "ref" | "range"
  s: number
  e: number
  textEnd: number
  text: string
  quoted: boolean
  words: number
  field: CField | null
  /** A PubMed tag such as [tiab] followed the term. */
  hasPm: boolean
  unclosed: boolean
  typographic: Array<{ pos: number; ch: string }>
  bracket?: Extract<CTok, { t: "bracket" }>
  range?: Extract<CTok, { t: "range" }>
  ref?: number
}
export interface COp {
  kind: "op"
  s: number
  e: number
  op: "AND" | "OR" | "NOT" | "NEXT" | "NEAR"
  text: string
  bad?: "next-dist" | "near-dist"
}
export interface CGroup {
  kind: "group"
  s: number
  e: number
  items: CItem[]
  closed: boolean
  field: CField | null
  /** End of the closing parenthesis (before a field code). */
  parenEnd: number
}
interface CRangeMark {
  kind: "range"
  s: number
  e: number
}
export type CItem = COperand | COp | CGroup | CRangeMark

interface Ctx {
  src: string
  toks: CTok[]
  pos: number
  findings: LintFinding[]
  operands: COperand[]
  strays: Array<Extract<CTok, { t: "stray" }>>
  lowerOps: COp[]
  pmBrackets: Array<{ s: number; e: number; text: string }>
  lineNo: number
  defined: Set<number>
  used: Set<number>
  proxOps: COp[]
}

function attachField(ctx: Ctx, target: { field: CField | null; e: number }) {
  const next = ctx.toks[ctx.pos]
  if (next && next.t === "field") {
    target.field = { s: next.s, e: next.e, codes: next.codes, raw: next.raw, trailingComma: next.trailingComma }
    target.e = next.e
    ctx.pos++
  }
}

function parseLevel(ctx: Ctx, depth: number): { items: CItem[]; closed: boolean; endPos: number } {
  const items: CItem[] = []
  const { toks } = ctx
  while (ctx.pos < toks.length) {
    const tok = toks[ctx.pos]
    switch (tok.t) {
      case "rp":
        if (depth > 0) {
          ctx.pos++
          return { items, closed: true, endPos: tok.e }
        }
        ctx.findings.push({
          code: "paren-unmatched-close",
          severity: "error",
          message: "Schliessende Klammer ohne passende öffnende Klammer.",
          start: tok.s,
          end: tok.e,
          fix: { label: "Klammer entfernen", edits: [{ start: tok.s, end: tok.e, text: "" }] },
        })
        ctx.pos++
        break
      case "lp": {
        ctx.pos++
        const inner = parseLevel(ctx, depth + 1)
        const last = ctx.toks[ctx.pos - 1]
        const parenEnd = inner.closed ? inner.endPos : last ? last.e : tok.e
        const group: CGroup = { kind: "group", s: tok.s, e: parenEnd, items: inner.items, closed: inner.closed, field: null, parenEnd }
        if (inner.closed) attachField(ctx, group)
        items.push(group)
        if (!inner.closed) {
          ctx.findings.push({
            code: "paren-unclosed",
            severity: "error",
            message: "Öffnende Klammer wird nie geschlossen.",
            start: tok.s,
            end: tok.e,
            fix: { label: "Schliessende Klammer am Ende ergänzen", edits: [{ start: ctx.src.length, end: ctx.src.length, text: ")" }] },
          })
        }
        break
      }
      case "op": {
        const item: COp = { kind: "op", s: tok.s, e: tok.e, op: tok.op, text: tok.text, bad: tok.bad }
        if (tok.text !== tok.text.toUpperCase() && !tok.bad) ctx.lowerOps.push(item)
        if (tok.op === "NEXT" || tok.op === "NEAR") ctx.proxOps.push(item)
        items.push(item)
        ctx.pos++
        break
      }
      case "field": {
        ctx.findings.push({
          code: "field-orphan",
          severity: "error",
          message: `Der Feldcode ${ctx.src.slice(tok.s, tok.e)} gehört zu keinem Begriff. Er steht direkt hinter dem Begriff oder der Klammer, auf die er sich bezieht.`,
          start: tok.s,
          end: tok.e,
          fix: { label: "Feldcode entfernen", edits: [{ start: tok.s, end: tok.e, text: "" }] },
        })
        ctx.pos++
        break
      }
      case "stray":
        ctx.strays.push(tok)
        ctx.pos++
        break
      case "bracket": {
        if (bracketKind(ctx.src, tok) === "pubmed") {
          ctx.pmBrackets.push({ s: tok.s, e: tok.e, text: ctx.src.slice(tok.s, tok.e) })
          const prev = items[items.length - 1]
          if (prev && prev.kind === "operand") prev.hasPm = true
          ctx.pos++
          break
        }
        const operand = readOperand(ctx)
        items.push(operand)
        ctx.operands.push(operand)
        break
      }
      default: {
        const operand = readOperand(ctx)
        items.push(operand)
        ctx.operands.push(operand)
      }
    }
  }
  return { items, closed: false, endPos: ctx.src.length }
}

function blank(partial: Partial<COperand> & Pick<COperand, "sub" | "s" | "e" | "text">): COperand {
  return {
    kind: "operand", textEnd: partial.e, quoted: false, words: 1, field: null, hasPm: false, unclosed: false, typographic: [], ...partial,
  }
}

function readOperand(ctx: Ctx): COperand {
  const { toks, src } = ctx
  const first = toks[ctx.pos]
  let operand: COperand
  if (first.t === "phrase") {
    const typographic: COperand["typographic"] = []
    if (first.openCh !== '"') typographic.push({ pos: first.s, ch: first.openCh })
    if (first.closed && first.closeCh !== '"') typographic.push({ pos: first.e - 1, ch: first.closeCh })
    operand = blank({
      sub: "phrase", s: first.s, e: first.e, text: first.inner, quoted: true,
      words: first.inner.trim() ? first.inner.trim().split(/\s+/).length : 0, unclosed: !first.closed, typographic,
    })
    ctx.pos++
  } else if (first.t === "word") {
    let last = first
    let count = 1
    ctx.pos++
    while (ctx.pos < toks.length && toks[ctx.pos].t === "word") {
      last = toks[ctx.pos] as typeof first
      count++
      ctx.pos++
    }
    operand = blank({ sub: "word", s: first.s, e: last.e, text: src.slice(first.s, last.e), words: count })
  } else if (first.t === "bracket") {
    operand = blank({ sub: "mesh", s: first.s, e: first.e, text: src.slice(first.s, first.e), bracket: first })
    ctx.pos++
  } else if (first.t === "ref") {
    operand = blank({ sub: "ref", s: first.s, e: first.e, text: src.slice(first.s, first.e), ref: first.n })
    ctx.pos++
  } else if (first.t === "range") {
    operand = blank({ sub: "range", s: first.s, e: first.e, text: src.slice(first.s, first.e), range: first })
    ctx.pos++
  } else {
    throw new Error("readOperand called on a non-operand token")
  }
  attachField(ctx, operand)
  return operand
}

/** Parses one line of Cochrane syntax. Exported for the converter. */
export function parseCochraneLine(src: string): { items: CItem[]; ctx: Ctx } {
  const ctx: Ctx = {
    src, toks: lex(src), pos: 0, findings: [], operands: [], strays: [], lowerOps: [], pmBrackets: [],
    lineNo: 1, defined: new Set(), used: new Set(), proxOps: [],
  }
  const top = parseLevel(ctx, 0)
  return { items: top.items, ctx }
}

/* ── Checks ─────────────────────────────────────────────────────── */

const SEVERITY_ORDER: Record<LintSeverity, number> = { error: 0, warning: 1, info: 2 }
const toRange = (o: { s: number; e: number }): Range => ({ start: o.s, end: o.e })
const preview = (s: string, max = 28) => (s.length > max ? `${s.slice(0, max - 1)}…` : s)
const isBoolean = (o: COp) => o.op === "AND" || o.op === "OR" || o.op === "NOT"
const isNumericTerm = (s: string) => /^[\d/\-:.]+$/.test(s.trim())

interface Aggregates {
  typographic: Array<{ pos: number; ch: string }>
  untagged: COperand[]
  hasRef: boolean
  textOperands: COperand[]
}

/** Words of a phrase that can stand inside (a NEXT b*). */
const NEXT_WORD = /^[\p{L}\p{N}*?'.&%+/]+$/u
const OPERATOR_WORD = /^(and|or|not|near|next)$/i

/** (a NEXT b*) for the words of a phrase, or null when a word cannot stand there. */
export function nextForm(text: string): string | null {
  const words = text.trim().split(/\s+/)
  if (words.length < 2) return null
  if (!words.every((w) => NEXT_WORD.test(w) && !OPERATOR_WORD.test(w))) return null
  return `(${words.join(" NEXT ")})`
}

function checkField(field: CField, ctx: Ctx, target: "operand" | "group", operand?: COperand, group?: CGroup) {
  const { findings } = ctx
  if (field.trailingComma) {
    findings.push({
      code: "field-comma",
      severity: "error",
      message: "Hinter dem Feldcode steht ein Komma. Mehrere Feldcodes trennst du mit Komma ohne Leerzeichen: :ti,ab,kw.",
      start: field.s,
      end: field.e,
      fix: { label: "Komma entfernen", edits: [{ start: field.e - 1, end: field.e, text: "" }] },
    })
  }
  const unknown = field.codes.filter((c) => !KNOWN_FIELDS.has(c))
  if (unknown.length) {
    const code = unknown[0]
    let guess: string | null = FIELD_ALIASES[code] ?? null
    if (!guess) {
      let bestD = 3
      for (const known of COCHRANE_FIELD_CODES) {
        const d = levenshtein(code, known)
        if (d < bestD) {
          guess = known
          bestD = d
        }
      }
    }
    const replaced = guess ? [...new Set(field.codes.flatMap((c) => (c === code ? guess!.split(",") : [c])))].join(",") : null
    findings.push({
      code: "field-unknown",
      severity: "error",
      message: `Unbekannter Feldcode :${code}. Die Cochrane Library kennt :ti, :ab, :kw, :au, :so, :doi, :pt, :an, :tp, :crg und :la.${
        guess ? ` Meintest du :${guess}?` : ""
      }`,
      start: field.s,
      end: field.e,
      fix: replaced ? { label: `Durch :${replaced} ersetzen`, edits: [{ start: field.s + 1, end: field.s + 1 + field.raw.length, text: replaced }] } : undefined,
    })
  }
  if (field.codes.includes("la") && target === "group" && group && group.items.some((i) => i.kind === "op")) {
    findings.push({
      code: "field-la-nesting",
      severity: "error",
      message: "Der Sprachfilter :la unterstützt keine Klammern. Schreib «english:la OR spanish:la» statt «(english OR spanish):la».",
      start: field.s,
      end: field.e,
    })
  }
  void operand
}

function checkMesh(o: COperand, ctx: Ctx, agg: Aggregates) {
  const { findings, src } = ctx
  const b = o.bracket!
  const m = parseMesh(src, b.s, b.e, b.closed)
  const labelOk = m.label === "mh"

  if (!b.closed) {
    findings.push({
      code: "bracket-unclosed",
      severity: "error",
      message: "Die eckige Klammer der MeSH-Suche wird nie geschlossen.",
      start: b.s,
      end: b.s + 1,
      fix: { label: "Klammer schliessen", edits: [{ start: b.e, end: b.e, text: "]" }] },
    })
  }
  if (m.label.toLowerCase() === "mesh") {
    findings.push({
      code: "mesh-label",
      severity: "error",
      message: "Eine MeSH-Suche beginnt in der Cochrane Library mit [mh …], nicht mit [MeSH …].",
      start: m.labelS,
      end: m.labelE,
      fix: { label: "Durch mh ersetzen", edits: [{ start: m.labelS, end: m.labelE, text: "mh" }] },
    })
  } else if (!labelOk && m.label.toLowerCase() !== "mh") {
    findings.push({
      code: "mesh-label",
      severity: "error",
      message: `Unbekannte Bezeichnung «${m.label}» in der MeSH-Suche. Erwartet wird [mh …].`,
      start: m.labelS,
      end: m.labelE,
    })
  }
  if (m.noSpace) {
    findings.push({
      code: "mesh-space",
      severity: "error",
      message: "Zwischen mh und dem Schlagwort fehlt ein Leerzeichen: [mh \"Low Back Pain\"].",
      start: m.labelS,
      end: m.afterLabel + 1,
      fix: { label: "Leerzeichen einfügen", edits: [{ start: m.afterLabel, end: m.afterLabel, text: " " }] },
    })
  }
  if (m.unclosedQuote) {
    findings.push({
      code: "quote-unclosed",
      severity: "error",
      message: "Die Anführungszeichen des Schlagworts werden nie geschlossen.",
      start: m.fullS,
      end: m.fullS + 1,
      fix: { label: "Anführungszeichen schliessen", edits: [{ start: m.fullE, end: m.fullE, text: '"' }] },
    })
  }
  if (m.quoted && !m.unclosedQuote) {
    const typo: Array<{ pos: number; ch: string }> = []
    if (src[m.fullS] !== '"') typo.push({ pos: m.fullS, ch: src[m.fullS] })
    if (src[m.fullE - 1] !== '"') typo.push({ pos: m.fullE - 1, ch: src[m.fullE - 1] })
    agg.typographic.push(...typo)
  }

  // Caret: before the heading, outside the quotes.
  if (m.caretInside) {
    const caretPos = m.headingS
    findings.push({
      code: "mesh-caret",
      severity: "error",
      message: "Das ^ (ohne Unterbegriffe) steht ausserhalb der Anführungszeichen, vor dem Schlagwort: [mh ^\"Low Back Pain\"].",
      start: caretPos,
      end: caretPos + 1,
      fix: {
        label: "^ vor die Anführungszeichen setzen",
        edits: [{ start: caretPos, end: caretPos + 1, text: "" }, ...(m.caret ? [] : [{ start: m.fullS, end: m.fullS, text: "^" }])],
      },
    })
  }
  if (m.caretAfter) {
    // find the caret after the heading
    let p = m.fullE
    while (p < src.length && /\s/.test(src[p])) p++
    findings.push({
      code: "mesh-caret",
      severity: "error",
      message: "Das ^ (ohne Unterbegriffe) steht vor dem Schlagwort, nicht dahinter: [mh ^\"Low Back Pain\"].",
      start: p,
      end: p + 1,
      fix: {
        label: "^ vor das Schlagwort setzen",
        edits: [{ start: p, end: p + 1, text: "" }, ...(m.caret ? [] : [{ start: m.fullS, end: m.fullS, text: "^" }])],
      },
    })
  }

  const heading = m.caretInside ? m.heading.replace(/^\^/, "") : m.heading
  if (!heading.trim() && !m.qualifiers.length) {
    findings.push({
      code: "mesh-empty",
      severity: "error",
      message: "Die MeSH-Suche enthält kein Schlagwort.",
      start: b.s,
      end: b.e,
    })
  }
  if (!m.quoted && heading.trim() && /[\s,]/.test(heading)) {
    findings.push({
      code: "mesh-unquoted",
      severity: "error",
      message: "Ein Schlagwort aus mehreren Wörtern gehört in Anführungszeichen: [mh \"Low Back Pain\"]. Ohne Anführungszeichen liest die Cochrane Library nur das erste Wort als Schlagwort.",
      start: m.headingS,
      end: m.headingE,
      fix: { label: "Anführungszeichen setzen", edits: [{ start: m.headingS, end: m.headingS, text: '"' }, { start: m.headingE, end: m.headingE, text: '"' }] },
    })
  }
  if (heading.includes("*") || heading.includes("?")) {
    findings.push({
      code: "trunc-mesh",
      severity: "error",
      message: "Trunkierung (* oder ?) funktioniert bei Schlagworten [mh …] nicht. Schreib das Schlagwort vollständig aus.",
      start: m.headingS,
      end: m.headingE,
    })
  }
  for (const q of m.qualifiers) {
    if (!/^[A-Za-z]{2}$/.test(q)) {
      findings.push({
        code: "mesh-qualifier",
        severity: "error",
        message: `Qualifier werden mit ihrem Kürzel aus zwei Buchstaben geschrieben, zum Beispiel /AE. «${q}» ist keines.`,
        start: m.qualS,
        end: m.qualE,
      })
    } else if (q !== q.toUpperCase()) {
      const at = src.indexOf(q, m.qualS)
      findings.push({
        code: "mesh-qualifier-case",
        severity: "error",
        message: `Qualifier müssen gross geschrieben werden: /${q.toUpperCase()}, nicht /${q}.`,
        start: at,
        end: at + q.length,
        fix: { label: `${q.toUpperCase()} gross schreiben`, edits: [{ start: at, end: at + q.length, text: q.toUpperCase() }] },
      })
    }
  }
  if (m.junk) {
    findings.push({
      code: "mesh-syntax",
      severity: "error",
      message: `In der MeSH-Suche steht «${preview(m.junk, 24)}», das die Cochrane Library nicht versteht. Erlaubt sind das Schlagwort, [mj] und Qualifier wie /AE.`,
      start: m.junkS,
      end: Math.min(src.length, m.junkS + m.junk.length),
    })
  }
}

function checkOperand(o: COperand, ctx: Ctx, agg: Aggregates, covered: boolean, proximity: boolean) {
  const { findings } = ctx

  if (o.sub === "mesh") {
    agg.textOperands.push(o)
    checkMesh(o, ctx, agg)
    if (o.field) {
      findings.push({
        code: "field-on-mesh",
        severity: "error",
        message: "Hinter einer MeSH-Suche [mh …] steht kein Feldcode. Das Schlagwort wird immer als Schlagwort gesucht.",
        start: o.field.s,
        end: o.field.e,
        fix: { label: "Feldcode entfernen", edits: [{ start: o.field.s, end: o.field.e, text: "" }] },
      })
    }
    return
  }

  if (o.sub === "ref") {
    agg.hasRef = true
    const n = o.ref!
    ctx.used.add(n)
    if (!ctx.defined.has(n)) {
      findings.push({
        code: "line-missing",
        severity: "error",
        message:
          n === ctx.lineNo
            ? `Die Zeile #${n} verweist auf sich selbst. Eine Zeile kann nur auf Zeilen darüber verweisen.`
            : n > ctx.lineNo
              ? `#${n} verweist auf eine Zeile, die erst später kommt. Eine Zeile kann nur auf Zeilen darüber verweisen.`
              : `Die Zeile #${n} gibt es nicht.`,
        start: o.s,
        end: o.textEnd,
      })
    }
    if (o.field) {
      findings.push({
        code: "field-on-ref",
        severity: "error",
        message: "Hinter einem Zeilenbezug steht kein Feldcode. Der Feldcode gehört in die Zeile mit dem Begriff.",
        start: o.field.s,
        end: o.field.e,
        fix: { label: "Feldcode entfernen", edits: [{ start: o.field.s, end: o.field.e, text: "" }] },
      })
    }
    return
  }

  if (o.sub === "range") {
    agg.hasRef = true
    const r = o.range!
    const raw = ctx.src.slice(r.s, r.e)
    if (!r.closed) {
      findings.push({
        code: "range-unclosed",
        severity: "error",
        message: "Die geschweifte Klammer des Zeilenbereichs wird nie geschlossen, zum Beispiel {OR #1-#4}.",
        start: r.s,
        end: r.s + 1,
        fix: { label: "Klammer schliessen", edits: [{ start: r.e, end: r.e, text: "}" }] },
      })
      return
    }
    const m = /^\{\s*(AND|OR)\s+(.+?)\s*\}$/i.exec(raw)
    if (!m) {
      findings.push({
        code: "range-syntax",
        severity: "error",
        message: "Ein Zeilenbereich sieht so aus: {OR #1-#4} oder {AND #1,#7,#9}.",
        start: r.s,
        end: r.e,
      })
      return
    }
    for (const part of m[2].split(",")) {
      const p = part.trim()
      const mm = /^#(\d+)(?:\s*-\s*#(\d+))?$/.exec(p)
      if (!mm) {
        findings.push({
          code: "range-syntax",
          severity: "error",
          message: `«${preview(p, 20)}» gehört nicht in einen Zeilenbereich. Erlaubt sind #n und #a-#b, getrennt durch Kommas.`,
          start: r.s,
          end: r.e,
        })
        continue
      }
      const a = Number(mm[1])
      const z = mm[2] ? Number(mm[2]) : a
      if (z < a) {
        findings.push({
          code: "range-order",
          severity: "error",
          message: `Im Zeilenbereich ${p} steht die kleinere Zeile zuerst: #${z}-#${a}.`,
          start: r.s,
          end: r.e,
        })
        continue
      }
      for (let k = a; k <= z; k++) {
        ctx.used.add(k)
        if (!ctx.defined.has(k)) {
          findings.push({
            code: "line-missing",
            severity: "error",
            message: `Die Zeile #${k} im Bereich ${p} gibt es nicht.`,
            start: r.s,
            end: r.e,
          })
          break
        }
      }
    }
    return
  }

  // word or phrase
  if (o.unclosed) {
    findings.push({
      code: "quote-unclosed",
      severity: "error",
      message: "Anführungszeichen werden nie geschlossen. Alles danach gehört noch zur Phrase.",
      start: o.s,
      end: Math.min(o.s + 1, o.e),
      fix: { label: "Anführungszeichen am Ende schliessen", edits: [{ start: ctx.src.length, end: ctx.src.length, text: '"' }] },
    })
    return
  }
  if (o.quoted && !o.text.trim()) {
    findings.push({
      code: "phrase-empty",
      severity: "error",
      message: "Leere Anführungszeichen ohne Begriff.",
      start: o.s,
      end: o.e,
      fix: { label: "Entfernen", edits: [{ start: o.s, end: o.e, text: "" }] },
    })
    return
  }
  for (const ty of o.typographic) agg.typographic.push(ty)
  agg.textOperands.push(o)

  if (isNumericTerm(o.text)) return

  if (!o.field && !covered && !o.hasPm) agg.untagged.push(o)

  const text = o.text
  const trunc = /[*?]/.test(text)
  if (o.quoted && trunc) {
    const single = o.words === 1
    const form = single ? text.trim() : nextForm(text)
    findings.push({
      code: "trunc-in-phrase",
      severity: "warning",
      message: single
        ? `«${preview(text, 24)}» ist ein einzelnes Wort mit Platzhalter. Lass die Anführungszeichen weg, denn in Anführungszeichen funktioniert die Trunkierung nicht.`
        : `«${preview(text, 24)}»: In Anführungszeichen funktioniert die Trunkierung nicht, die Cochrane Library findet dann nicht alles. Schreib die Phrase mit NEXT: ${form ?? "(hearing NEXT aid*)"}.`,
      start: o.s,
      end: o.textEnd,
      fix: form ? { label: single ? "Anführungszeichen entfernen" : `Als ${form} schreiben`, edits: [{ start: o.s, end: o.textEnd, text: form }] } : undefined,
    })
  }
  if (trunc) {
    for (const w of text.split(/\s+/)) {
      if (!/[*?]/.test(w)) continue
      if ((w.match(/\*/g) ?? []).length > 1) {
        findings.push({
          code: "trunc-multi",
          severity: "error",
          message: `«${preview(w, 24)}» hat mehrere Sterne. In einem Wort ist nur ein * erlaubt.`,
          start: o.s,
          end: o.textEnd,
        })
      }
      if (w.replace(/[*?]/g, "").length < COCHRANE_MIN_STEM) {
        findings.push({
          code: "trunc-short",
          severity: "error",
          message: `Das Wortstück vor dem Platzhalter braucht mindestens ${COCHRANE_MIN_STEM} Zeichen (Cochrane-Hilfe). «${preview(w, 24)}» hat nur ${w.replace(/[*?]/g, "").length}.`,
          start: o.s,
          end: o.textEnd,
          fix: {
            label: "Platzhalter entfernen",
            edits: [{ start: o.s, end: o.textEnd, text: o.quoted ? `"${text.replace(/[*?]/g, "")}"` : text.replace(/[*?]/g, "") }],
          },
        })
      }
    }
  }

  if (!o.quoted && o.words > 1) {
    findings.push({
      code: "phrase-unquoted",
      severity: "warning",
      message: "Mehrere Wörter ohne Anführungszeichen verknüpft die Cochrane Library mit AND. Sie müssen dann nur irgendwo im Text vorkommen, nicht als Phrase. Setze Phrasen in Anführungszeichen.",
      start: o.s,
      end: o.textEnd,
      fix: { label: "Anführungszeichen setzen", edits: [{ start: o.s, end: o.s, text: '"' }, { start: o.textEnd, end: o.textEnd, text: '"' }] },
    })
  } else if (!o.quoted && /[\p{L}\p{N}]-[\p{L}\p{N}]/u.test(text) && !trunc) {
    findings.push({
      code: "hyphen-term",
      severity: "info",
      message: "Die Cochrane Library rät von Bindestrichen ab und empfiehlt Anführungszeichen: «exit site» findet auch «exit-site».",
      start: o.s,
      end: o.textEnd,
      fix: { label: "Als Phrase schreiben", edits: [{ start: o.s, end: o.textEnd, text: `"${text.replace(/-/g, " ")}"` }] },
    })
  }

  if (!o.quoted && o.words === 1 && !proximity) {
    const level = genericLevel(text)
    if (level) {
      findings.push({
        code: "generic-term",
        severity: level,
        message:
          level === "warning"
            ? `«${text.replace(/\*/g, "")}» ist sehr allgemein und trifft fast jede Studie. Formuliere die Komponente genauer, zum Beispiel mit einer Phrase wie «exercise therapy».`
            : `«${text.replace(/\*/g, "")}» ist als Stichwort breit. Meist ist ein Filter oder ein Schlagwort dafür besser geeignet.`,
        start: o.s,
        end: o.textEnd,
      })
    }
  }
}

function checkLevel(items: CItem[], ctx: Ctx, closedGroup: boolean, groupRange: Range | null) {
  const { findings } = ctx

  if (closedGroup && items.length === 0 && groupRange) {
    findings.push({
      code: "group-empty",
      severity: "error",
      message: "Leere Klammer: Zwischen den Klammern steht nichts.",
      start: groupRange.start,
      end: groupRange.end,
      fix: { label: "Leere Klammer entfernen", edits: [{ start: groupRange.start, end: groupRange.end, text: "" }] },
    })
  }

  for (let i = 0; i < items.length; i++) {
    const it = items[i]
    const prev = items[i - 1]
    const next = items[i + 1]
    if (it.kind === "op") {
      if (!prev || prev.kind === "op") {
        const atStart = !prev
        findings.push({
          code: atStart ? "op-leading" : "op-double",
          severity: "error",
          message: atStart
            ? `Der Operator ${it.op} steht am Anfang, davor fehlt ein Begriff.`
            : `Zwei Operatoren hintereinander (${(prev as COp).op} ${it.op}). Die Cochrane Library meldet «this line contains one or more additional operators».`,
          start: it.s,
          end: it.e,
          fix: { label: `${it.op} entfernen`, edits: [{ start: it.s, end: it.e, text: "" }] },
        })
      } else if (!next) {
        findings.push({
          code: "op-trailing",
          severity: "error",
          message: `Der Operator ${it.op} steht am Ende, danach fehlt ein Begriff.`,
          start: it.s,
          end: it.e,
          fix: { label: `${it.op} entfernen`, edits: [{ start: it.s, end: it.e, text: "" }] },
        })
      }
      if (it.bad === "next-dist") {
        findings.push({
          code: "next-distance",
          severity: "error",
          message: "NEXT kennt keinen Abstand. Für einen Abstand brauchst du NEAR/n.",
          start: it.s,
          end: it.e,
          fix: { label: "NEXT ohne Abstand schreiben", edits: [{ start: it.s, end: it.e, text: "NEXT" }] },
        })
      } else if (it.bad === "near-dist") {
        findings.push({
          code: "near-distance",
          severity: "error",
          message: "Der Abstand von NEAR ist eine Zahl: NEAR/3 (ohne Zahl: 6 Wörter).",
          start: it.s,
          end: it.e,
        })
      }
    } else if (it.kind === "operand" || it.kind === "group") {
      if (prev && (prev.kind === "operand" || prev.kind === "group")) {
        findings.push({
          code: "op-missing",
          severity: "warning",
          message: "Zwischen zwei Begriffen fehlt ein Operator. Die Cochrane Library verknüpft sie dann stillschweigend mit AND.",
          start: it.s,
          end: it.e,
          fix: { label: "AND einfügen", edits: [{ start: it.s, end: it.s, text: "AND " }] },
        })
      }
    }
  }

  const ops = items.filter((x): x is COp => x.kind === "op" && isBoolean(x))
  const kinds = new Set(ops.map((o) => o.op))
  if (kinds.has("OR") && (kinds.has("AND") || kinds.has("NOT"))) {
    const first = ops[0].op
    const switches = ops.filter((o) => o.op !== first)
    findings.push({
      code: "mixed-operators",
      severity: "warning",
      message:
        "AND und OR stehen ohne Klammern auf derselben Ebene. Die Cochrane Library wertet zuerst NOT, dann AND und zuletzt OR aus: «A OR B AND C» wird als «A OR (B AND C)» gelesen. Setze jede OR-Gruppe in eine Klammer.",
      start: switches[0].s,
      end: switches[0].e,
      more: switches.slice(1).map(toRange),
      fix: wrapOrRuns(items),
    })
  }
}

function walk(items: CItem[], ctx: Ctx, agg: Aggregates, closed: boolean, range: Range | null, covered: boolean) {
  checkLevel(items, ctx, closed, range)
  items.forEach((it, i) => {
    if (it.kind === "operand") {
      if (it.field) checkField(it.field, ctx, "operand", it)
      const near = (x: CItem | undefined) => x?.kind === "op" && (x.op === "NEXT" || x.op === "NEAR")
      checkOperand(it, ctx, agg, covered, near(items[i - 1]) || near(items[i + 1]))
    } else if (it.kind === "group") {
      if (it.field) checkField(it.field, ctx, "group", undefined, it)
      walk(it.items, ctx, agg, it.closed, { start: it.s, end: it.parenEnd }, covered || it.field !== null)
    }
  })
}

/* ── One line ───────────────────────────────────────────────────── */

function lintLine(src: string, lineNo: number, defined: Set<number>, used: Set<number>): LintFinding[] {
  const ctx: Ctx = {
    src, toks: lex(src), pos: 0, findings: [], operands: [], strays: [], lowerOps: [], pmBrackets: [],
    lineNo, defined, used, proxOps: [],
  }
  const agg: Aggregates = { typographic: [], untagged: [], hasRef: false, textOperands: [] }
  const top = parseLevel(ctx, 0)
  walk(top.items, ctx, agg, false, null, false)

  for (const s of ctx.strays) {
    const comma = /^[,;]+$/.test(s.text)
    ctx.findings.push({
      code: s.afterQuote ? "stray-after-quote" : "stray-char",
      severity: "error",
      message: s.afterQuote
        ? `Direkt hinter dem Anführungszeichen steht «${s.text}». Das ist ein Tippfehler.`
        : comma
          ? "Ein Komma ist in der Cochrane Library kein OR. Verknüpfe Synonyme mit OR."
          : `Das Zeichen «${s.text}» gehört nicht in die Cochrane-Syntax.`,
      start: s.s,
      end: s.e,
      fix: comma
        ? { label: "Durch OR ersetzen", edits: [{ start: s.s, end: s.e, text: "OR" }] }
        : { label: "Zeichen entfernen", edits: [{ start: s.s, end: s.e, text: "" }] },
    })
  }

  if (agg.typographic.length) {
    const sorted = [...agg.typographic].sort((a, b) => a.pos - b.pos)
    ctx.findings.push({
      code: "quotes-typographic",
      severity: "error",
      message: `Typografische Anführungszeichen (${[...new Set(sorted.map((t) => t.ch))].join(" ")}) mag die Cochrane Library nicht: «this line contains missing or unrequired quotes». Die Hilfe empfiehlt gerade Anführungszeichen ". Word und Mail setzen oft automatisch typografische Zeichen.`,
      start: sorted[0].pos,
      end: sorted[0].pos + 1,
      more: sorted.slice(1).map((t) => ({ start: t.pos, end: t.pos + 1 })),
      fix: { label: `${sorted.length} Anführungszeichen durch " ersetzen`, edits: sorted.map((t) => ({ start: t.pos, end: t.pos + 1, text: '"' })) },
    })
  }

  if (ctx.lowerOps.length) {
    const lo = ctx.lowerOps
    ctx.findings.push({
      code: "operator-lowercase",
      severity: "info",
      message: "Die Cochrane Library liest auch kleingeschriebene Operatoren (and, or, not, near, next). Gross geschrieben sind sie aber besser lesbar und gelten in jeder Datenbank.",
      start: lo[0].s,
      end: lo[0].e,
      more: lo.slice(1).map(toRange),
      fix: { label: "Operatoren gross schreiben", edits: lo.map((o) => ({ start: o.s, end: o.e, text: o.text.toUpperCase() })) },
    })
  }

  if (ctx.pmBrackets.length) {
    const p = ctx.pmBrackets
    const converted = convertLineToCochrane(src)
    const first = p[0]
    ctx.findings.push({
      code: "pubmed-syntax",
      severity: "error",
      message: `${p.length === 1 ? "Das Field Tag" : "Field Tags"} ${p
        .slice(0, 3)
        .map((x) => x.text)
        .join(" ")}${p.length > 3 ? " …" : ""} ${p.length === 1 ? "ist" : "sind"} PubMed-Syntax. In der Cochrane Library schreibst du Stichworte mit :ti,ab,kw und Schlagworte mit [mh "…"].${
        converted.unsafe.length ? ` Nicht sicher umwandelbar: ${converted.unsafe.length}.` : ""
      }`,
      start: first.s,
      end: first.e,
      more: p.slice(1).map(toRange),
      fix: converted.changed ? { label: "In Cochrane-Syntax umwandeln", edits: [{ start: 0, end: src.length, text: converted.text }] } : undefined,
    })
  }

  if (agg.untagged.length) {
    const u = agg.untagged
    const edits: Edit[] = []
    for (const o of u) {
      if (!o.quoted && o.words > 1) {
        edits.push({ start: o.s, end: o.s, text: '"' }, { start: o.textEnd, end: o.textEnd, text: '":ti,ab,kw' })
      } else {
        edits.push({ start: o.textEnd, end: o.textEnd, text: ":ti,ab,kw" })
      }
    }
    ctx.findings.push({
      code: "no-field-code",
      severity: "info",
      message: `${u.length === 1 ? "Ein Begriff hat" : `${u.length} Begriffe haben`} keinen Feldcode. Dann sucht die Cochrane Library im gesamten Text («All text», ohne Literaturverzeichnis). Für Stichworte empfiehlt sich :ti,ab,kw (Titel, Abstract, Schlüsselwörter).`,
      start: u[0].s,
      end: u[0].textEnd,
      more: u.slice(1).map((o) => ({ start: o.s, end: o.textEnd })),
      fix: { label: ":ti,ab,kw an alle Begriffe hängen", edits },
    })
  }

  if (agg.hasRef) {
    const free = agg.textOperands
    if (free.length) {
      ctx.findings.push({
        code: "ref-mixed",
        severity: "error",
        message:
          "Zeilenbezüge (#n) lassen sich nicht mit Suchbegriffen in einer Zeile mischen, zum Beispiel «(#1 OR #2) AND tinnitus:ti,ab,kw». Schreib den Begriff in eine eigene Zeile und verweise darauf.",
        start: free[0].s,
        end: free[0].e,
        more: free.slice(1).map(toRange),
      })
    }
    if (ctx.proxOps.length) {
      ctx.findings.push({
        code: "ref-proximity",
        severity: "error",
        message: "Zeilen lassen sich nicht mit NEAR oder NEXT verknüpfen. Dafür gibt es AND, OR und NOT.",
        start: ctx.proxOps[0].s,
        end: ctx.proxOps[0].e,
        more: ctx.proxOps.slice(1).map(toRange),
      })
    }
  }

  return ctx.findings
}

/* ── Detection and public API ───────────────────────────────────── */

const PM_BRACKET = /\[\s*(?:tiab|ti|ab|tw|mesh(?::noexp)?|majr|mh:noexp|pt|dp|la|sb|au|ta|all(?: fields)?|title\/abstract|title|abstract|mesh terms|text word|language|publication type|publication date|subheading|sh|mhda|pdat|tt)\s*(?::[^\]]*)?\]/gi
const PM_MH_PLAIN = /\[\s*mh\s*\]/gi

/** Which syntax does a pasted string use? No signal counts as PubMed (the default); a mix goes to the side with more signals, Cochrane on a tie. */
export function detectLintDatabase(src: string): "pubmed" | "cochrane" {
  let cochrane = 0
  let pubmed = 0
  cochrane += (src.match(/\[\s*mh\s*[\s^"“”„«»‟/]/gi) ?? []).length
  cochrane += (src.match(/["”“)\w*?]:(?:ti|ab|kw|au|so|doi|an|tp|crg|la|pt)\b/gi) ?? []).length
  cochrane += (src.match(/:(?:ti|ab|kw),/gi) ?? []).length
  cochrane += (src.match(/(?:^|[\s(])#\d+(?=$|[\s),])/gm) ?? []).length
  cochrane += (src.match(/\{\s*(?:and|or)\s+#/gi) ?? []).length
  cochrane += (src.match(/\b(?:NEXT|NEAR(?:\/\d+)?)\b/g) ?? []).length
  pubmed += (src.match(PM_BRACKET) ?? []).length
  pubmed += (src.match(PM_MH_PLAIN) ?? []).length
  return cochrane > 0 && cochrane >= pubmed ? "cochrane" : "pubmed"
}

interface SourceLine {
  text: string
  start: number
  /** Where the search itself starts (after a "#3" label). */
  contentStart: number
  label: number | null
}

const LABEL_RE = /^(\s*)#(\d+)[.:)]?[ \t]+(?!(?:and|or|not|next|near)\b)(?=\S)/i

function splitLines(src: string): SourceLine[] {
  const lines: SourceLine[] = []
  let offset = 0
  for (const raw of src.split("\n")) {
    const text = raw.endsWith("\r") ? raw.slice(0, -1) : raw
    if (text.trim()) {
      const m = LABEL_RE.exec(text)
      lines.push({ text, start: offset, contentStart: offset + (m ? m[0].length : 0), label: m ? Number(m[2]) : null })
    }
    offset += raw.length + 1
  }
  return lines
}

export function lintCochrane(src: string): LintFinding[] {
  if (!src.trim()) return []
  const lines = splitLines(src)
  const all: LintFinding[] = []
  const defined = new Set<number>()
  const used = new Set<number>()
  const lineOf: Array<{ no: number; start: number; end: number; refs: boolean }> = []

  lines.forEach((line, idx) => {
    const ordinal = idx + 1
    const no = line.label ?? ordinal
    const content = src.slice(line.contentStart, line.start + line.text.length)
    const base = line.contentStart
    const findings = lintLine(content, no, defined, used)
    for (const f of findings) {
      const shift = (n: number) => n + base
      all.push({
        ...f,
        start: shift(f.start),
        end: shift(f.end),
        more: f.more?.map((r) => ({ start: shift(r.start), end: shift(r.end) })),
        fix: f.fix ? { label: f.fix.label, edits: f.fix.edits.map((e) => ({ ...e, start: shift(e.start), end: shift(e.end) })) } : undefined,
      })
    }
    if (line.label !== null && line.label !== ordinal && lines.length > 1) {
      all.push({
        code: "line-label",
        severity: "warning",
        message: `Die Zeile steht an Position ${ordinal}, trägt aber die Nummer #${line.label}. Der Search Manager nummeriert fortlaufend ab #1, die Verweise stimmen sonst nicht.`,
        start: line.start,
        end: line.contentStart,
      })
    }
    defined.add(no)
    lineOf.push({ no, start: line.start, end: line.start + line.text.length, refs: /#\d+/.test(content) })
  })

  if (lines.length > 1 && used.size > 0) {
    const last = lineOf[lineOf.length - 1]
    for (const l of lineOf) {
      if (l === last || used.has(l.no)) continue
      all.push({
        code: "line-orphan",
        severity: "info",
        message: `Die Zeile #${l.no} wird in keiner späteren Zeile verwendet und fliesst nicht in das Ergebnis ein (im Search Manager: «Highlight orphan lines»).`,
        start: l.start,
        end: Math.min(l.end, l.start + 40),
      })
    }
  }

  return all.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || a.start - b.start)
}

