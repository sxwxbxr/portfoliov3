/**
 * Shared core of the CINAHL (EBSCOhost) and Embase (embase.com) linters: lexer, parser, the checks
 * that do not depend on the platform (brackets, quotes, operators, line references) and the
 * line-by-line handling of strategies. The platform rules (field codes, headings, proximity,
 * truncation, limits) live in lint-cinahl.ts and lint-embase.ts.
 *
 * The lexer is forgiving: it keeps going after an error so one pass reports everything. Every
 * finding carries a character range and, when the repair is unambiguous, a fix made of text edits.
 */
import { wrapOrRuns, type LevelItem } from "./lint-shared"
import type { Edit, LintFinding, LintSeverity, Range } from "./types"

export type Dialect = "cinahl" | "embase"

export const SEVERITY_ORDER: Record<LintSeverity, number> = { error: 0, warning: 1, info: 2 }

const DQ = new Set(['"', "„", "“", "”", "«", "»", "‟"])
const SQ = new Set(["'", "’", "‘", "‚", "´", "`"])
export const isDq = (c: string) => DQ.has(c)
export const isSq = (c: string) => SQ.has(c)

export const toRange = (o: { s: number; e: number }): Range => ({ start: o.s, end: o.e })
export const preview = (s: string, max = 28) => (s.length > max ? `${s.slice(0, max - 1)}…` : s)

/* ── Tokens ─────────────────────────────────────────────────────── */

export interface FieldTok {
  t: "field"
  s: number
  e: number
  /** Raw text: "ti,ab,kw" (colon form, Embase) or "TI" (prefix form, CINAHL). */
  raw: string
  /** Lowercase codes. */
  codes: string[]
  /** True for the prefix form (TI "x"), false for the colon form ("x":ti). */
  prefix: boolean
  trailingComma: boolean
}

export interface SuffixTok {
  t: "suffix"
  s: number
  e: number
  /** "/exp", "/de", "/lim" ... without the case changed. */
  raw: string
}

export interface ProxTok {
  t: "prox"
  s: number
  e: number
  text: string
  /** N, W (CINAHL), NEAR, NEXT (Embase), ADJ (Ovid). */
  kind: "N" | "W" | "NEAR" | "NEXT" | "ADJ"
  /** The distance, null when not written. */
  n: number | null
  slash: boolean
  /** Written with a space: "NEAR 3". */
  spaced?: boolean
}

export type PTok =
  | { t: "lp" | "rp"; s: number; e: number }
  | { t: "phrase"; s: number; e: number; inner: string; closed: boolean; openCh: string; closeCh: string }
  | { t: "bracket"; s: number; e: number; inner: string; closed: boolean }
  | { t: "word"; s: number; e: number; text: string }
  | { t: "op"; s: number; e: number; text: string; op: "AND" | "OR" | "NOT" }
  | ProxTok
  | { t: "ref"; s: number; e: number; n: number; style: "S" | "#" }
  | FieldTok
  | SuffixTok
  | { t: "stray"; s: number; e: number; text: string; afterQuote: boolean }

const FIELD_TAIL = /^:([A-Za-z]+(?:,[A-Za-z]+)*)(,?)$/
const SUFFIX_RE = /^\/[A-Za-z]+(?:\/[A-Za-z]+)?$/

function pushCore(out: PTok[], text: string, s: number, e: number) {
  let m: RegExpExecArray | null
  if (/^(and|or|not)$/i.test(text)) out.push({ t: "op", s, e, text, op: text.toUpperCase() as "AND" | "OR" | "NOT" })
  else if ((m = /^(NEAR|NEXT)(?:\/(\d+))?$/.exec(text) ?? /^(near|next)\/(\d+)$/i.exec(text)))
    out.push({ t: "prox", s, e, text, kind: m[1].toUpperCase() as "NEAR" | "NEXT", n: m[2] ? Number(m[2]) : null, slash: text.includes("/") })
  else if ((m = /^([NW])(\d+)$/.exec(text))) out.push({ t: "prox", s, e, text, kind: m[1] as "N" | "W", n: Number(m[2]), slash: false })
  else if ((m = /^adj(\d*)$/i.exec(text))) out.push({ t: "prox", s, e, text, kind: "ADJ", n: m[1] ? Number(m[1]) : null, slash: false })
  else if ((m = /^S(\d+)$/.exec(text))) out.push({ t: "ref", s, e, n: Number(m[1]), style: "S" })
  else if ((m = /^#(\d+)$/.exec(text))) out.push({ t: "ref", s, e, n: Number(m[1]), style: "#" })
  else if (/^[^\p{L}\p{N}*?#$]+$/u.test(text)) out.push({ t: "stray", s, e, text, afterQuote: false })
  else out.push({ t: "word", s, e, text })
}

function pushWord(out: PTok[], src: string, s: number, e: number) {
  let end = e
  let trailing: { s: number; e: number; text: string } | null = null
  const raw = src.slice(s, e)
  // A trailing comma of a field list (":ti,") stays with the field and is reported there.
  const m0 = /:[A-Za-z]+(?:,[A-Za-z]+)*,$/.test(raw) ? null : /^(.*[\p{L}\p{N}*?)'"])([,;]+)$/u.exec(raw)
  if (m0) {
    end = s + m0[1].length
    trailing = { s: end, e, text: m0[2] }
  }
  const text = src.slice(s, end)

  let head = text
  let field: { s: number; m: RegExpExecArray } | null = null
  const mf = /^(.*?)(:[A-Za-z]+(?:,[A-Za-z]+)*,?)$/.exec(head)
  if (mf && !/^[\d/\-.:]+$/.test(head)) {
    field = { s: s + mf[1].length, m: FIELD_TAIL.exec(mf[2])! }
    head = mf[1]
  }
  let suffix: { s: number; raw: string } | null = null
  if (head.startsWith("/")) {
    if (SUFFIX_RE.test(head)) {
      suffix = { s, raw: head }
      head = ""
    }
  } else {
    const ms = /^(.+?)(\/[A-Za-z]+(?:\/[A-Za-z]+)?)$/.exec(head)
    if (ms) {
      suffix = { s: s + ms[1].length, raw: ms[2] }
      head = ms[1]
    }
  }
  if (head) pushCore(out, head, s, s + head.length)
  if (suffix) out.push({ t: "suffix", s: suffix.s, e: suffix.s + suffix.raw.length, raw: suffix.raw })
  if (field) {
    out.push({
      t: "field",
      s: field.s,
      e: end,
      raw: field.m[1],
      codes: field.m[1].toLowerCase().split(","),
      prefix: false,
      trailingComma: field.m[2] === ",",
    })
  }
  if (trailing) out.push({ t: "stray", s: trailing.s, e: trailing.e, text: trailing.text, afterQuote: false })
}

export function lex(src: string): PTok[] {
  const out: PTok[] = []
  const n = src.length
  const isBreak = (c: string) => /\s/.test(c) || c === "(" || c === ")" || c === "[" || c === "]" || isDq(c)
  const afterPhrase = (i: number): number => {
    // Directly behind a closing quote only a field (:ti), a suffix (/exp) or a break may follow.
    if (i >= n || isBreak(src[i]) || src[i] === ":" || src[i] === "/") return i
    let k = i
    while (k < n && !isBreak(src[k]) && src[k] !== ":" && src[k] !== "/") k++
    out.push({ t: "stray", s: i, e: k, text: src.slice(i, k), afterQuote: true })
    return k
  }
  let i = 0
  while (i < n) {
    const c = src[i]
    if (/\s/.test(c)) {
      i++
    } else if (c === "(" || c === ")") {
      out.push({ t: c === "(" ? "lp" : "rp", s: i, e: i + 1 })
      i++
    } else if (c === "[") {
      const close = src.indexOf("]", i + 1)
      if (close === -1) {
        let j = i + 1
        while (j < n && !/\s/.test(src[j])) j++
        out.push({ t: "bracket", s: i, e: j, inner: src.slice(i + 1, j), closed: false })
        i = j
      } else {
        out.push({ t: "bracket", s: i, e: close + 1, inner: src.slice(i + 1, close), closed: true })
        i = close + 1
      }
    } else if (c === "]") {
      out.push({ t: "stray", s: i, e: i + 1, text: c, afterQuote: false })
      i++
    } else if (isDq(c)) {
      let j = i + 1
      while (j < n && !isDq(src[j])) j++
      if (j >= n) {
        out.push({ t: "phrase", s: i, e: n, inner: src.slice(i + 1), closed: false, openCh: c, closeCh: "" })
        i = n
      } else {
        out.push({ t: "phrase", s: i, e: j + 1, inner: src.slice(i + 1, j), closed: true, openCh: c, closeCh: src[j] })
        i = afterPhrase(j + 1)
      }
    } else if (isSq(c) && (i === 0 || /[\s(]/.test(src[i - 1]))) {
      // A single quote opens a phrase at the start of a term and closes at the next one that is not followed by a letter.
      let j = i + 1
      while (j < n && !(isSq(src[j]) && !/[\p{L}\p{N}]/u.test(src[j + 1] ?? ""))) j++
      if (j >= n) {
        out.push({ t: "phrase", s: i, e: n, inner: src.slice(i + 1), closed: false, openCh: c, closeCh: "" })
        i = n
      } else {
        out.push({ t: "phrase", s: i, e: j + 1, inner: src.slice(i + 1, j), closed: true, openCh: c, closeCh: src[j] })
        i = afterPhrase(j + 1)
      }
    } else {
      let j = i
      while (j < n && !isBreak(src[j])) j++
      pushWord(out, src, i, j)
      i = j
    }
  }
  return out
}

/* ── Parser ─────────────────────────────────────────────────────── */

export interface Operand {
  kind: "operand"
  s: number
  e: number
  sub: "term" | "ref" | "limit" | "chain"
  tok?: Extract<PTok, { t: "word" | "phrase" | "bracket" | "ref" }>
  /** Text of the term: the phrase without quotes, or the word. */
  text: string
  quoted: boolean
  unclosed: boolean
  /** Number of words in the term. */
  words: number
  /** Range of the term itself (without field code and suffix). */
  textS: number
  textE: number
  /** The field code written for this term (prefix form TI "x", colon form "x":ti). */
  field: FieldTok | null
  suffix: SuffixTok | null
  /** Field codes that apply: own, else inherited from the group. Lowercase. Null: none written. */
  eff: string[] | null
  ref?: number
  refStyle?: "S" | "#"
  chain?: Item[]
  /** The term is one side of a proximity operator (a NEAR/3 b). */
  inProx?: boolean
}

export interface OpItem {
  kind: "op"
  s: number
  e: number
  op: "AND" | "OR" | "NOT"
  text: string
}

export interface GroupItem {
  kind: "group"
  s: number
  e: number
  items: Item[]
  closed: boolean
  field: FieldTok | null
  suffix: SuffixTok | null
}

export interface ProxItem {
  kind: "prox"
  tok: ProxTok
  s: number
  e: number
}

export type Item = Operand | OpItem | GroupItem | ProxItem

export interface Ctx {
  d: Dialect
  src: string
  toks: PTok[]
  pos: number
  findings: LintFinding[]
  terms: Operand[]
  limits: Operand[]
  strays: Array<Extract<PTok, { t: "stray" }>>
  lowerOps: OpItem[]
  prox: ProxTok[]
  /** Proximity chains (a NEAR/3 b), for the platform checks. */
  chains: Operand[]
  fieldToks: FieldTok[]
  suffixToks: Array<{ tok: SuffixTok; operand: Operand | GroupItem | null }>
  foreignBrackets: Array<Extract<PTok, { t: "bracket" }>>
  lineNo: number
  defined: Set<number>
  used: Set<number>
  refs: Operand[]
  typographic: Array<{ pos: number; ch: string; to: string }>
  singleQuoted: Array<{ s: number; e: number; closed: boolean }>
}

function newCtx(src: string, d: Dialect, lineNo: number, defined: Set<number>, used: Set<number>): Ctx {
  return {
    d, src, toks: lex(src), pos: 0, findings: [], terms: [], limits: [], strays: [], lowerOps: [], prox: [], chains: [],
    fieldToks: [], suffixToks: [], foreignBrackets: [], lineNo, defined, used, refs: [], typographic: [], singleQuoted: [],
  }
}

/** Field codes that EBSCO writes in front of a term (TI "x"). Used to tell a prefix code from an ordinary word. */
export const PREFIX_CODES = new Set([
  "ti", "ab", "tx", "su", "mh", "mm", "au", "af", "so", "pt", "la", "py", "dt", "em", "an", "de", "kw", "sh", "ud", "zu", "rv", "jn", "is", "ib", "pg", "sb", "tw", "mp",
])

function isPrefixField(tok: PTok, next: PTok | undefined): boolean {
  if (tok.t !== "word" || !next) return false
  if (!/^[A-Za-z]{2}$/.test(tok.text)) return false
  const upper = tok.text === tok.text.toUpperCase()
  const known = PREFIX_CODES.has(tok.text.toLowerCase())
  if (next.t === "lp" || next.t === "phrase") return known || upper
  if (next.t === "word") return known && upper
  return false
}

function blank(partial: Partial<Operand> & Pick<Operand, "sub" | "s" | "e" | "text">): Operand {
  return { kind: "operand", quoted: false, unclosed: false, words: 1, textS: partial.s, textE: partial.e, field: null, suffix: null, eff: null, ...partial }
}

function applyInherit(items: Item[], codes: string[]) {
  for (const it of items) {
    if (it.kind === "operand") {
      if (it.sub === "chain" && it.chain) applyInherit(it.chain, codes)
      else if (it.sub === "term" && !it.field && it.eff === null) it.eff = codes
    } else if (it.kind === "group" && !it.field) {
      applyInherit(it.items, codes)
    }
  }
}

function parseUnit(ctx: Ctx, depth: number, inherit: FieldTok | null): Operand | GroupItem | null {
  const { toks } = ctx
  const tok = toks[ctx.pos]
  if (!tok) return null

  let prefix: FieldTok | null = null
  if (isPrefixField(tok, toks[ctx.pos + 1])) {
    const w = tok as Extract<PTok, { t: "word" }>
    prefix = { t: "field", s: w.s, e: w.e, raw: w.text, codes: [w.text.toLowerCase()], prefix: true, trailingComma: false }
    ctx.fieldToks.push(prefix)
    ctx.pos++
  }
  const cur = toks[ctx.pos]
  const eff = prefix ?? inherit

  let unit: Operand | GroupItem
  if (cur.t === "lp") {
    ctx.pos++
    const inner = parseLevel(ctx, depth + 1, eff)
    const last = toks[ctx.pos - 1]
    const e = inner.closed ? inner.endPos : last ? last.e : cur.e
    unit = { kind: "group", s: prefix ? prefix.s : cur.s, e, items: inner.items, closed: inner.closed, field: prefix, suffix: null }
    if (!inner.closed) {
      ctx.findings.push({
        code: "paren-unclosed",
        severity: "error",
        message: "Öffnende Klammer wird nie geschlossen.",
        start: cur.s,
        end: cur.e,
        fix: { label: "Schliessende Klammer am Ende ergänzen", edits: [{ start: ctx.src.length, end: ctx.src.length, text: ")" }] },
      })
    }
  } else if (cur.t === "phrase" || cur.t === "word" || cur.t === "bracket" || cur.t === "ref") {
    ctx.pos++
    if (cur.t === "ref") {
      unit = blank({ sub: "ref", s: cur.s, e: cur.e, text: `${cur.style}${cur.n}`, tok: cur, ref: cur.n, refStyle: cur.style })
    } else if (cur.t === "bracket") {
      unit = blank({ sub: "limit", s: cur.s, e: cur.e, text: cur.inner, tok: cur, unclosed: !cur.closed })
      ctx.limits.push(unit)
    } else if (cur.t === "phrase") {
      unit = blank({
        sub: "term",
        s: cur.s,
        e: cur.e,
        text: cur.inner.trim(),
        tok: cur,
        quoted: true,
        unclosed: !cur.closed,
        words: cur.inner.trim() ? cur.inner.trim().split(/\s+/).length : 0,
      })
    } else {
      unit = blank({ sub: "term", s: cur.s, e: cur.e, text: cur.text, tok: cur })
    }
    if (prefix) {
      unit.s = prefix.s
      unit.field = prefix
    }
    unit.eff = unit.field ? unit.field.codes : inherit ? inherit.codes : null
    if (unit.sub === "term") ctx.terms.push(unit)
    if (unit.sub === "ref") ctx.refs.push(unit)
  } else {
    // A prefix code with nothing behind it.
    if (prefix) {
      ctx.findings.push({
        code: "field-orphan",
        severity: "error",
        message: `Hinter dem Feldcode ${prefix.raw} fehlt der Begriff.`,
        start: prefix.s,
        end: prefix.e,
        fix: { label: "Feldcode entfernen", edits: [{ start: prefix.s, end: prefix.e, text: "" }] },
      })
    }
    return null
  }

  // Colon fields and suffixes behind the unit: "x":ti,ab,kw  'x'/exp  (a OR b):ti,ab
  for (;;) {
    const nx = toks[ctx.pos]
    if (nx && nx.t === "field" && !nx.prefix) {
      ctx.pos++
      ctx.fieldToks.push(nx)
      if (unit.field) {
        ctx.findings.push({
          code: "field-double",
          severity: "error",
          message: "Ein Begriff hat zwei Feldcodes. Behalte einen.",
          start: nx.s,
          end: nx.e,
          fix: { label: "Zweiten Feldcode entfernen", edits: [{ start: nx.s, end: nx.e, text: "" }] },
        })
      } else {
        unit.field = nx
        unit.e = nx.e
        if (unit.kind === "group") applyInherit(unit.items, nx.codes)
        else unit.eff = nx.codes
      }
    } else if (nx && nx.t === "suffix") {
      ctx.pos++
      ctx.suffixToks.push({ tok: nx, operand: unit })
      unit.suffix = nx
      unit.e = nx.e
    } else break
  }
  return unit
}

function parseChain(ctx: Ctx, depth: number, inherit: FieldTok | null): Operand | GroupItem | null {
  const first = parseUnit(ctx, depth, inherit)
  if (!first) return null
  const next = ctx.toks[ctx.pos]
  if (!next || next.t !== "prox") return first
  const chain: Item[] = [first]
  while (ctx.toks[ctx.pos] && ctx.toks[ctx.pos].t === "prox") {
    let p = ctx.toks[ctx.pos] as ProxTok
    ctx.pos++
    const num = ctx.toks[ctx.pos]
    if ((p.kind === "NEAR" || p.kind === "NEXT") && !p.slash && p.n === null && num && num.t === "word" && /^\d+$/.test(num.text)) {
      ctx.pos++
      p = { ...p, e: num.e, n: Number(num.text), text: ctx.src.slice(p.s, num.e), spaced: true }
      if (ctx.d === "embase") {
        ctx.findings.push({
          code: "prox-space",
          severity: "error",
          message: `${p.text}: Der Abstand steht ohne Leerzeichen hinter einem Schrägstrich: ${p.kind}/${p.n}.`,
          start: p.s,
          end: p.e,
          fix: { label: `${p.kind}/${p.n} schreiben`, edits: [{ start: p.s, end: p.e, text: `${p.kind}/${p.n}` }] },
        })
      }
    }
    ctx.prox.push(p)
    chain.push({ kind: "prox", tok: p, s: p.s, e: p.e })
    const nu = parseUnit(ctx, depth, inherit)
    if (!nu) {
      ctx.findings.push({
        code: "prox-dangling",
        severity: "error",
        message: `Hinter ${p.text} fehlt der zweite Begriff.`,
        start: p.s,
        end: p.e,
        fix: { label: `${p.text} entfernen`, edits: [{ start: p.s, end: p.e, text: "" }] },
      })
      break
    }
    chain.push(nu)
  }
  const s = first.s
  const e = (chain[chain.length - 1] as { e: number }).e
  for (const c of chain) if (c.kind === "operand") c.inProx = true
  const op = blank({ sub: "chain", s, e, text: ctx.src.slice(s, e), chain })
  ctx.chains.push(op)
  return op
}

export function parseLevel(ctx: Ctx, depth: number, inherit: FieldTok | null): { items: Item[]; closed: boolean; endPos: number } {
  const items: Item[] = []
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
      case "op": {
        const item: OpItem = { kind: "op", s: tok.s, e: tok.e, op: tok.op, text: tok.text }
        if (tok.text !== tok.op) ctx.lowerOps.push(item)
        items.push(item)
        ctx.pos++
        break
      }
      case "stray":
        ctx.strays.push(tok)
        ctx.pos++
        break
      case "field":
        ctx.fieldToks.push(tok)
        ctx.findings.push({
          code: "field-orphan",
          severity: "error",
          message: `Der Feldcode :${tok.raw} gehört zu keinem Begriff. Er steht direkt hinter dem Begriff oder der Klammer.`,
          start: tok.s,
          end: tok.e,
          fix: { label: "Feldcode entfernen", edits: [{ start: tok.s, end: tok.e, text: "" }] },
        })
        ctx.pos++
        break
      case "suffix":
        ctx.findings.push({
          code: "suffix-orphan",
          severity: "error",
          message: `Der Zusatz ${tok.raw} gehört zu keinem Begriff.`,
          start: tok.s,
          end: tok.e,
          fix: { label: "Zusatz entfernen", edits: [{ start: tok.s, end: tok.e, text: "" }] },
        })
        ctx.pos++
        break
      case "prox": {
        // A proximity operator without a left operand.
        ctx.prox.push(tok)
        ctx.findings.push({
          code: "prox-dangling",
          severity: "error",
          message: `${tok.text} steht ohne Begriff davor.`,
          start: tok.s,
          end: tok.e,
          fix: { label: `${tok.text} entfernen`, edits: [{ start: tok.s, end: tok.e, text: "" }] },
        })
        ctx.pos++
        break
      }
      default: {
        const before = ctx.pos
        const unit = parseChain(ctx, depth, inherit)
        if (unit) items.push(unit)
        else if (ctx.pos === before) ctx.pos++
      }
    }
  }
  return { items, closed: false, endPos: ctx.src.length }
}

/* ── Level checks ───────────────────────────────────────────────── */

const isTermLike = (x: Item | undefined): x is Operand | GroupItem => !!x && (x.kind === "operand" || x.kind === "group")

/** A run of bare words that probably is a phrase typed without quotes. */
function barePhraseRun(items: Item[], from: number): Operand[] {
  const run: Operand[] = []
  for (let i = from; i < items.length; i++) {
    const it = items[i]
    if (it.kind !== "operand" || it.sub !== "term" || it.quoted || it.tok?.t !== "word") break
    if (run.length > 0 && it.field?.prefix) break
    run.push(it)
    // A colon field or suffix ends the phrase.
    if (it.suffix || (it.field && !it.field.prefix)) break
  }
  return run
}

export interface LevelOptions {
  /** German text of the "mixed AND/OR" finding. */
  mixedMessage: string
  /** German hint about what an unquoted run of words means on this platform. */
  unquotedMessage: string
}

export function checkLevel(items: Item[], ctx: Ctx, closedGroup: boolean, groupRange: Range | null, opt: LevelOptions) {
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
          message: atStart ? `Der Operator ${it.op} steht am Anfang, davor fehlt ein Begriff.` : `Zwei Operatoren hintereinander (${(prev as OpItem).op} ${it.op}). Es darf nur einer stehen.`,
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
    }
  }

  // Two terms without an operator: a phrase typed without quotes, or a missing AND/OR.
  for (let i = 0; i < items.length; i++) {
    const it = items[i]
    if (!isTermLike(it) || !isTermLike(items[i + 1])) continue
    if (it.kind === "operand" && it.sub === "term" && !it.quoted && it.tok?.t === "word" && !it.suffix && !(it.field && !it.field.prefix)) {
      const run = barePhraseRun(items, i)
      // The run must be preceded by an operator, a prefix code or the start: otherwise it continues a longer run.
      if (run.length >= 2) {
        const first = run[0]
        const last = run[run.length - 1]
        const qs = first.textS
        const qe = last.textE
        findings.push({
          code: "phrase-unquoted",
          severity: "warning",
          message: `«${preview(ctx.src.slice(qs, qe))}» steht ohne Anführungszeichen. ${opt.unquotedMessage}`,
          start: qs,
          end: qe,
          fix: { label: "In Anführungszeichen setzen", edits: [{ start: qs, end: qs, text: '"' }, { start: qe, end: qe, text: '"' }] },
        })
        i += run.length - 1
        continue
      }
    }
    const nx = items[i + 1]
    findings.push({
      code: "op-missing",
      severity: "warning",
      message: "Zwischen zwei Begriffen fehlt ein Operator.",
      start: nx.s,
      end: nx.e,
      fix: { label: "AND einfügen", edits: [{ start: nx.s, end: nx.s, text: "AND " }] },
    })
  }

  const ops = items.filter((x): x is OpItem => x.kind === "op")
  const kinds = new Set(ops.map((o) => o.op))
  if (kinds.has("OR") && (kinds.has("AND") || kinds.has("NOT"))) {
    const first = ops[0].op
    const switches = ops.filter((o) => o.op !== first)
    findings.push({
      code: "mixed-operators",
      severity: "warning",
      message: opt.mixedMessage,
      start: switches[0].s,
      end: switches[0].e,
      more: switches.slice(1).map(toRange),
      fix: wrapOrRuns(items as LevelItem[]),
    })
  }
}

export function walk(items: Item[], ctx: Ctx, closed: boolean, range: Range | null, opt: LevelOptions) {
  checkLevel(items, ctx, closed, range, opt)
  for (const it of items) {
    if (it.kind === "group") walk(it.items, ctx, it.closed, { start: it.s, end: it.e }, opt)
    else if (it.kind === "operand" && it.sub === "chain" && it.chain) {
      for (const c of it.chain) if (c.kind === "group") walk(c.items, ctx, c.closed, { start: c.s, end: c.e }, opt)
    }
  }
}

/* ── Checks every platform shares ───────────────────────────────── */

export interface CommonOptions extends LevelOptions {
  /** Findings the platform wants for its quotes. */
  platformLabel: string
  /** Severity of lowercase operators. */
  lowerOpSeverity: LintSeverity
  lowerOpMessage: string
  /** Returns true when the platform reports this stray token itself (for example a "+" behind a closing quote). */
  handleStray?: (s: Extract<PTok, { t: "stray" }>, ctx: Ctx) => boolean
}

export function runCommon(ctx: Ctx, opt: CommonOptions) {
  const top = parseLevel(ctx, 0, null)
  walk(top.items, ctx, false, null, opt)

  for (const tok of ctx.toks) {
    if (tok.t === "phrase") {
      const doubleFamily = isDq(tok.openCh)
      const open = tok.openCh
      if (open !== '"' && open !== "'") ctx.typographic.push({ pos: tok.s, ch: open, to: doubleFamily ? '"' : "'" })
      if (tok.closed && tok.closeCh !== '"' && tok.closeCh !== "'") ctx.typographic.push({ pos: tok.e - 1, ch: tok.closeCh, to: doubleFamily ? '"' : "'" })
      if (!doubleFamily) ctx.singleQuoted.push({ s: tok.s, e: tok.e, closed: tok.closed })
      if (!tok.closed) {
        ctx.findings.push({
          code: "quote-unclosed",
          severity: "error",
          message: "Anführungszeichen werden nie geschlossen. Alles danach gehört noch zur Phrase.",
          start: tok.s,
          end: tok.s + 1,
          fix: { label: "Anführungszeichen am Ende schliessen", edits: [{ start: ctx.src.length, end: ctx.src.length, text: doubleFamily ? '"' : "'" }] },
        })
      } else if (!tok.inner.trim()) {
        ctx.findings.push({
          code: "phrase-empty",
          severity: "error",
          message: "Leere Anführungszeichen ohne Begriff.",
          start: tok.s,
          end: tok.e,
          fix: { label: "Entfernen", edits: [{ start: tok.s, end: tok.e, text: "" }] },
        })
      }
    } else if (tok.t === "bracket" && ctx.d === "cinahl") {
      ctx.foreignBrackets.push(tok)
    }
  }

  for (const s of ctx.strays) {
    if (opt.handleStray?.(s, ctx)) continue
    const comma = /^[,;]+$/.test(s.text)
    ctx.findings.push({
      code: s.afterQuote ? "stray-after-quote" : "stray-char",
      severity: "error",
      message: s.afterQuote
        ? `Direkt hinter dem Anführungszeichen steht «${s.text}». Das ist ein Tippfehler.`
        : comma
          ? `Ein Komma ist in ${opt.platformLabel} kein OR. Verknüpfe Synonyme mit OR.`
          : `Das Zeichen «${s.text}» gehört nicht in die ${opt.platformLabel}-Syntax.`,
      start: s.s,
      end: s.e,
      fix: comma
        ? { label: "Durch OR ersetzen", edits: [{ start: s.s, end: s.e, text: "OR" }] }
        : { label: "Zeichen entfernen", edits: [{ start: s.s, end: s.e, text: "" }] },
    })
  }

  if (ctx.typographic.length) {
    const sorted = [...ctx.typographic].sort((a, b) => a.pos - b.pos)
    ctx.findings.push({
      code: "quotes-typographic",
      severity: "error",
      message: `Typografische Anführungszeichen (${[...new Set(sorted.map((t) => t.ch))].join(" ")}) kennt ${opt.platformLabel} nicht. Nur gerade Anführungszeichen zählen als Phrase. Word und Mail setzen oft automatisch typografische Zeichen.`,
      start: sorted[0].pos,
      end: sorted[0].pos + 1,
      more: sorted.slice(1).map((t) => ({ start: t.pos, end: t.pos + 1 })),
      fix: { label: `${sorted.length} Anführungszeichen durch gerade ersetzen`, edits: sorted.map((t) => ({ start: t.pos, end: t.pos + 1, text: t.to })) },
    })
  }

  if (ctx.lowerOps.length) {
    const lo = ctx.lowerOps
    ctx.findings.push({
      code: "operator-lowercase",
      severity: opt.lowerOpSeverity,
      message: opt.lowerOpMessage,
      start: lo[0].s,
      end: lo[0].e,
      more: lo.slice(1).map(toRange),
      fix: { label: "Operatoren gross schreiben", edits: lo.map((o) => ({ start: o.s, end: o.e, text: o.op })) },
    })
  }

  // Line references: only to earlier lines.
  for (const o of ctx.refs) {
    const n = o.ref!
    const label = `${o.refStyle}${n}`
    ctx.used.add(n)
    if (!ctx.defined.has(n)) {
      ctx.findings.push({
        code: "line-missing",
        severity: "error",
        message:
          n === ctx.lineNo
            ? `Die Zeile ${label} verweist auf sich selbst. Eine Zeile kann nur auf Zeilen darüber verweisen.`
            : n > ctx.lineNo
              ? `${label} verweist auf eine Zeile, die erst später kommt. Eine Zeile kann nur auf Zeilen darüber verweisen.`
              : `Die Zeile ${label} gibt es nicht.`,
        start: o.s,
        end: o.e,
      })
    }
    if (o.field || o.suffix) {
      const x = (o.field ?? o.suffix)!
      ctx.findings.push({
        code: "field-on-ref",
        severity: "error",
        message: "Hinter einem Zeilenbezug steht kein Feldcode oder Zusatz. Der gehört in die Zeile mit dem Begriff.",
        start: x.s,
        end: x.e,
        fix: { label: "Entfernen", edits: [{ start: x.s, end: x.e, text: "" }] },
      })
    }
  }
}

/* ── Lines ──────────────────────────────────────────────────────── */

interface SourceLine {
  text: string
  start: number
  contentStart: number
  label: number | null
}

function splitLines(src: string, prefix: "S" | "#"): SourceLine[] {
  const re = new RegExp(`^(\\s*)${prefix === "#" ? "#" : "S"}(\\d+)[.:)]?[ \\t]+(?!(?:and|or|not|near|next)\\b)(?=\\S)`, "i")
  const lines: SourceLine[] = []
  let offset = 0
  for (const raw of src.split("\n")) {
    const text = raw.endsWith("\r") ? raw.slice(0, -1) : raw
    if (text.trim()) {
      const m = re.exec(text)
      // "S3 S1 OR S2" is a label; "S1 OR S2" and "S1 AND S2" are combinations (the lookahead keeps them).
      lines.push({ text, start: offset, contentStart: offset + (m ? m[0].length : 0), label: m ? Number(m[2]) : null })
    }
    offset += raw.length + 1
  }
  return lines
}

export type LineLinter = (content: string, lineNo: number, defined: Set<number>, used: Set<number>, multi: boolean) => LintFinding[]

export function lintStrategy(src: string, prefix: "S" | "#", lintLine: LineLinter): LintFinding[] {
  if (!src.trim()) return []
  const lines = splitLines(src, prefix)
  const all: LintFinding[] = []
  const defined = new Set<number>()
  const used = new Set<number>()
  const lineOf: Array<{ no: number; start: number; end: number }> = []

  lines.forEach((line, idx) => {
    const ordinal = idx + 1
    const no = line.label ?? ordinal
    const content = src.slice(line.contentStart, line.start + line.text.length)
    const base = line.contentStart
    for (const f of lintLine(content, no, defined, used, lines.length > 1)) {
      const shift = (n: number) => n + base
      all.push({
        ...f,
        start: shift(f.start),
        end: shift(f.end),
        more: f.more?.map((r) => ({ start: shift(r.start), end: shift(r.end) })),
        fix: f.fix ? { label: f.fix.label, edits: f.fix.edits.map((e: Edit) => ({ ...e, start: shift(e.start), end: shift(e.end) })) } : undefined,
      })
    }
    if (line.label !== null && line.label !== ordinal && lines.length > 1) {
      all.push({
        code: "line-label",
        severity: "warning",
        message: `Die Zeile steht an Position ${ordinal}, trägt aber die Nummer ${prefix}${line.label}. Die Datenbank nummeriert fortlaufend ab ${prefix}1, die Verweise stimmen sonst nicht.`,
        start: line.start,
        end: line.contentStart,
      })
    }
    defined.add(no)
    lineOf.push({ no, start: line.start, end: line.start + line.text.length })
  })

  if (lines.length > 1 && used.size > 0) {
    const last = lineOf[lineOf.length - 1]
    for (const l of lineOf) {
      if (l === last || used.has(l.no)) continue
      all.push({
        code: "line-orphan",
        severity: "info",
        message: `Die Zeile ${prefix}${l.no} wird in keiner späteren Zeile verwendet und fliesst nicht in das Ergebnis ein.`,
        start: l.start,
        end: Math.min(l.end, l.start + 40),
      })
    }
  }
  return all.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || a.start - b.start)
}

export { newCtx }
