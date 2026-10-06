/**
 * "Eigenen String prüfen": a linter for hand-written PubMed search strings.
 *
 * The lexer is forgiving (it keeps going after an error) so one pass reports
 * everything. Every finding carries a character range into the input and, when
 * the repair is unambiguous, a fix made of text edits.
 *
 * Rules follow https://pubmed.ncbi.nlm.nih.gov/help/: uppercase Boolean
 * operators, left-to-right evaluation, at least four characters before a
 * wildcard, quotes or a field tag for phrases with a wildcard.
 */
import { PUBMED_MIN_STEM, stemLength } from "./profiles"
import type { Edit, LintFinding, LintFix, LintSeverity, Range } from "./types"

/* ── Vocabulary ─────────────────────────────────────────────────── */

const SIMPLE_TAGS = [
  "all", "all fields", "ab", "abstract", "ad", "affiliation", "aid", "au", "author", "auid", "ci", "cn", "crdt",
  "create date", "doi", "dp", "edat", "entry date", "fau", "fir", "gr", "grant", "isbn", "ip", "issn", "issue", "jid", "jour",
  "journal", "la", "lang", "language", "lastau", "lid", "majr", "mesh major topic", "mh", "mesh", "mesh terms", "mhda",
  "nm", "ot", "other term", "pa", "pdat", "pg", "page", "pmc", "pmid", "ps", "pt", "publication type", "publication date",
  "rn", "sb", "subset", "sh", "subh", "mesh subheading", "subheading", "si", "ta", "title abbreviation", "ti", "title",
  "tiab", "title/abstract", "tt", "tw", "text word", "text words", "uid", "vi", "volume",
] as const

const KNOWN_TAGS = new Set<string>(SIMPLE_TAGS)
const MESH_TAGS = new Set(["mh", "mesh", "majr", "mesh terms", "mesh major topic"])
const NOEXP_RE = /^(mesh|mh|majr|mesh terms):noexp$/

const GENERIC_WARN = new Set([
  "therapy", "therapies", "treatment", "treatments", "training", "exercise", "exercises", "pain", "patient", "patients",
  "effect", "effects", "intervention", "interventions", "health", "care", "function", "study", "studies", "outcome",
  "outcomes", "disease", "disorder", "syndrome", "rehabilitation",
])
const GENERIC_INFO = new Set(["adult", "adults", "human", "humans", "people", "person", "persons", "male", "female", "men", "women"])

/** Is a single search word so general that it matches most of the literature? */
export function genericLevel(word: string): "warning" | "info" | null {
  const w = word.replace(/\*/g, "").trim().toLowerCase()
  if (GENERIC_WARN.has(w)) return "warning"
  if (GENERIC_INFO.has(w)) return "info"
  return null
}

const QUOTE_CHARS = new Set(['"', "„", "“", "”", "«", "»", "‟"])
const isQuote = (c: string) => QUOTE_CHARS.has(c)

/* ── Lexer ──────────────────────────────────────────────────────── */

type Tok =
  | { t: "lp" | "rp" | "colon"; s: number; e: number }
  | { t: "phrase"; s: number; e: number; inner: string; closed: boolean; openCh: string; closeCh: string }
  | { t: "word"; s: number; e: number; text: string }
  | { t: "op"; s: number; e: number; text: string; op: "AND" | "OR" | "NOT" }
  | { t: "tag"; s: number; e: number; text: string; closed: boolean }
  | { t: "stray"; s: number; e: number; text: string; afterQuote: boolean }

function lex(src: string): Tok[] {
  const out: Tok[] = []
  const n = src.length
  const isBreak = (c: string) => /\s/.test(c) || c === "(" || c === ")" || c === "[" || isQuote(c)
  let i = 0
  while (i < n) {
    const c = src[i]
    if (/\s/.test(c)) {
      i++
    } else if (c === "(") {
      out.push({ t: "lp", s: i, e: i + 1 })
      i++
    } else if (c === ")") {
      out.push({ t: "rp", s: i, e: i + 1 })
      i++
    } else if (c === "[") {
      const close = src.indexOf("]", i + 1)
      if (close === -1) {
        let j = i + 1
        while (j < n && !/\s/.test(src[j])) j++
        out.push({ t: "tag", s: i, e: j, text: src.slice(i + 1, j), closed: false })
        i = j
      } else {
        out.push({ t: "tag", s: i, e: close + 1, text: src.slice(i + 1, close), closed: true })
        i = close + 1
      }
    } else if (isQuote(c)) {
      let j = i + 1
      while (j < n && !isQuote(src[j])) j++
      if (j >= n) {
        out.push({ t: "phrase", s: i, e: n, inner: src.slice(i + 1), closed: false, openCh: c, closeCh: "" })
        i = n
      } else {
        out.push({ t: "phrase", s: i, e: j + 1, inner: src.slice(i + 1, j), closed: true, openCh: c, closeCh: src[j] })
        i = j + 1
        if (i < n && !isBreak(src[i])) {
          let k = i
          while (k < n && !isBreak(src[k])) k++
          out.push({ t: "stray", s: i, e: k, text: src.slice(i, k), afterQuote: true })
          i = k
        }
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

function pushWord(out: Tok[], src: string, s: number, e: number) {
  let end = e
  let trailing: { s: number; e: number; text: string } | null = null
  const text0 = src.slice(s, e)
  const m = /^(.*[\p{L}\p{N}*])([,;]+)$/u.exec(text0)
  if (m) {
    end = s + m[1].length
    trailing = { s: end, e, text: m[2] }
  }
  const text = src.slice(s, end)
  if (text === ":") out.push({ t: "colon", s, e: end })
  else if (/^(and|or|not)$/i.test(text)) out.push({ t: "op", s, e: end, text, op: text.toUpperCase() as "AND" | "OR" | "NOT" })
  else if (/^[^\p{L}\p{N}*]+$/u.test(text)) out.push({ t: "stray", s, e: end, text, afterQuote: false })
  else out.push({ t: "word", s, e: end, text })
  if (trailing) out.push({ t: "stray", s: trailing.s, e: trailing.e, text: trailing.text, afterQuote: false })
}

/* ── Tree ───────────────────────────────────────────────────────── */

interface Operand {
  kind: "operand"
  s: number
  e: number
  /** Phrase content or the bare words. */
  text: string
  /** End of the term itself. `e` additionally covers a following field tag. */
  textEnd: number
  quoted: boolean
  words: number
  tag: string | null
  tagS: number
  tagE: number
  tagClosed: boolean
  unclosed: boolean
  typographic: Array<{ pos: number; ch: string }>
}
interface OpItem {
  kind: "op"
  s: number
  e: number
  op: "AND" | "OR" | "NOT"
  text: string
}
interface GroupItem {
  kind: "group"
  s: number
  e: number
  items: Item[]
  closed: boolean
}
interface RangeItem {
  kind: "range"
  s: number
  e: number
}
type Item = Operand | OpItem | GroupItem | RangeItem

interface Ctx {
  src: string
  toks: Tok[]
  pos: number
  findings: LintFinding[]
  operands: Operand[]
  strays: Array<Extract<Tok, { t: "stray" }>>
  lowerOps: OpItem[]
}

function parseLevel(ctx: Ctx, depth: number): { items: Item[]; closed: boolean; endPos: number } {
  const items: Item[] = []
  const { toks } = ctx
  while (ctx.pos < toks.length) {
    const tok = toks[ctx.pos]
    switch (tok.t) {
      case "rp":
        if (depth > 0) {
          const endPos = tok.e
          ctx.pos++
          return { items, closed: true, endPos }
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
        const e = inner.closed ? inner.endPos : last ? last.e : tok.e
        items.push({ kind: "group", s: tok.s, e, items: inner.items, closed: inner.closed })
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
        const item: OpItem = { kind: "op", s: tok.s, e: tok.e, op: tok.op, text: tok.text }
        if (tok.text !== tok.op) ctx.lowerOps.push(item)
        items.push(item)
        ctx.pos++
        break
      }
      case "colon":
        items.push({ kind: "range", s: tok.s, e: tok.e })
        ctx.pos++
        break
      case "stray":
        ctx.strays.push(tok)
        ctx.pos++
        break
      case "tag": {
        const prev = items[items.length - 1]
        if (!prev || prev.kind !== "group") {
          ctx.findings.push({
            code: "tag-orphan",
            severity: "error",
            message: `Das Field Tag [${tok.text}] gehört zu keinem Begriff. Ein Tag steht direkt hinter dem Begriff.`,
            start: tok.s,
            end: tok.e,
            fix: { label: "Tag entfernen", edits: [{ start: tok.s, end: tok.e, text: "" }] },
          })
        }
        ctx.pos++
        break
      }
      case "phrase":
      case "word": {
        const operand = readOperand(ctx)
        items.push(operand)
        ctx.operands.push(operand)
        break
      }
    }
  }
  return { items, closed: false, endPos: ctx.src.length }
}

function readOperand(ctx: Ctx): Operand {
  const { toks, src } = ctx
  const first = toks[ctx.pos]
  let operand: Operand
  if (first.t === "phrase") {
    const typographic: Operand["typographic"] = []
    if (first.openCh !== '"') typographic.push({ pos: first.s, ch: first.openCh })
    if (first.closed && first.closeCh !== '"') typographic.push({ pos: first.e - 1, ch: first.closeCh })
    operand = {
      kind: "operand", s: first.s, e: first.e, textEnd: first.e, text: first.inner, quoted: true,
      words: first.inner.trim() ? first.inner.trim().split(/\s+/).length : 0,
      tag: null, tagS: -1, tagE: -1, tagClosed: true, unclosed: !first.closed, typographic,
    }
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
    operand = {
      kind: "operand", s: first.s, e: last.e, textEnd: last.e, text: src.slice(first.s, last.e), quoted: false, words: count,
      tag: null, tagS: -1, tagE: -1, tagClosed: true, unclosed: false, typographic: [],
    }
  } else {
    throw new Error("readOperand called on a non-operand token")
  }
  const next = toks[ctx.pos]
  if (next && next.t === "tag") {
    operand.tag = next.text.trim().toLowerCase()
    operand.tagS = next.s
    operand.tagE = next.e
    operand.tagClosed = next.closed
    operand.e = next.e
    ctx.pos++
  }
  return operand
}

/* ── Checks ─────────────────────────────────────────────────────── */

const SEVERITY_ORDER: Record<LintSeverity, number> = { error: 0, warning: 1, info: 2 }

function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)])
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return dp[a.length][b.length]
}

function closestTag(tag: string): string | null {
  let best: string | null = null
  let bestD = 3
  for (const known of SIMPLE_TAGS) {
    if (known.includes(" ") || known.length < 2) continue
    const d = levenshtein(tag, known)
    if (d < bestD) {
      best = known
      bestD = d
    }
  }
  return best
}

const isNumericTerm = (s: string) => /^[\d/\-:.]+$/.test(s.trim())
const toRange = (o: { s: number; e: number }): Range => ({ start: o.s, end: o.e })
const preview = (s: string, max = 28) => (s.length > max ? `${s.slice(0, max - 1)}…` : s)

function checkOperand(o: Operand, ctx: Ctx, agg: Aggregates) {
  const { findings } = ctx
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

  if (isNumericTerm(o.text)) return

  const tag = o.tag
  const isMesh = tag !== null && (MESH_TAGS.has(tag) || NOEXP_RE.test(tag))

  if (tag !== null) {
    if (!o.tagClosed) {
      findings.push({
        code: "tag-unclosed",
        severity: "error",
        message: "Das Field Tag hat keine schliessende eckige Klammer.",
        start: o.tagS,
        end: o.tagE,
        fix: { label: "Klammer schliessen", edits: [{ start: o.tagE, end: o.tagE, text: "]" }] },
      })
    } else if (!KNOWN_TAGS.has(tag) && !NOEXP_RE.test(tag)) {
      const guess = closestTag(tag)
      findings.push({
        code: "tag-unknown",
        severity: "error",
        message: `Unbekanntes Field Tag [${tag}].${guess ? ` Meintest du [${guess}]?` : " PubMed ignoriert unbekannte Tags oder meldet einen Fehler."}`,
        start: o.tagS,
        end: o.tagE,
        fix: guess ? { label: `Durch [${guess}] ersetzen`, edits: [{ start: o.tagS + 1, end: o.tagE - 1, text: guess }] } : undefined,
      })
    }
  } else {
    agg.untagged.push(o)
  }

  if (o.text.includes("*")) {
    const stem = stemLength(o.text)
    if (isMesh) {
      findings.push({
        code: "trunc-mesh",
        severity: "error",
        message: "Trunkierung (*) funktioniert bei Schlagworten ([Mesh]) nicht. Schreib das Schlagwort vollständig aus.",
        start: o.s,
        end: o.e,
      })
    } else if (stem < PUBMED_MIN_STEM) {
      findings.push({
        code: "trunc-short",
        severity: "error",
        message: `Vor dem * müssen mindestens ${PUBMED_MIN_STEM} Zeichen stehen (PubMed-Hilfe). «${preview(o.text)}» hat nur ${stem}.`,
        start: o.s,
        end: o.e,
        fix: {
          label: "Stern entfernen",
          edits: [{ start: o.s, end: o.textEnd, text: o.quoted ? `"${o.text.replace(/\*/g, "")}"` : o.text.replace(/\*/g, "") }],
        },
      })
    } else if (o.quoted && /\s/.test(o.text.trim()) && tag === null) {
      agg.truncPhrase.push(o)
    } else if (!/\s/.test(o.text.trim()) && stem <= 5 && !genericLevel(o.text)) {
      findings.push({
        code: "trunc-short-stem",
        severity: "info",
        message: `Der Wortstamm «${o.text.replace(/\*/g, "")}» ist kurz. Trunkierung kann viele unpassende Wörter einschliessen. Prüfe die Trefferliste.`,
        start: o.s,
        end: o.e,
      })
    }
  }

  if (isMesh && !o.quoted && o.words > 1) {
    findings.push({
      code: "mesh-unquoted",
      severity: "warning",
      message: "Ein Schlagwort aus mehreren Wörtern gehört in Anführungszeichen.",
      start: o.s,
      end: o.e,
      fix: { label: "Anführungszeichen setzen", edits: [{ start: o.s, end: o.s, text: '"' }, { start: o.textEnd, end: o.textEnd, text: '"' }] },
    })
  }

  if (!isMesh && !/\s/.test(o.text.trim())) {
    const level = genericLevel(o.text)
    if (level) {
      findings.push({
        code: "generic-term",
        severity: level,
        message:
          level === "warning"
            ? `«${o.text.replace(/\*/g, "")}» ist sehr allgemein und trifft fast jede Studie. Formuliere die Komponente genauer, zum Beispiel mit einer Phrase wie «exercise therapy».`
            : `«${o.text.replace(/\*/g, "")}» ist als Stichwort breit. Meist ist ein Filter oder ein Schlagwort dafür besser geeignet.`,
        start: o.s,
        end: o.e,
      })
    }
  }
}

function checkLevel(items: Item[], ctx: Ctx, closedGroup: boolean, groupRange: Range | null) {
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

  // Dangling and doubled operators, missing operators.
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
            : `Zwei Operatoren hintereinander (${(prev as OpItem).op} ${it.op}). Es darf nur einer stehen.`,
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
    } else if (it.kind === "operand" || it.kind === "group") {
      if (prev && (prev.kind === "operand" || prev.kind === "group")) {
        findings.push({
          code: "op-missing",
          severity: "warning",
          message: "Zwischen zwei Begriffen fehlt ein Operator. PubMed verknüpft sie dann stillschweigend mit AND.",
          start: it.s,
          end: it.e,
          fix: { label: "AND einfügen", edits: [{ start: it.s, end: it.s, text: "AND " }] },
        })
      }
    }
  }

  // Mixed operators on one level.
  const ops = items.filter((x): x is OpItem => x.kind === "op")
  const kinds = new Set(ops.map((o) => o.op))
  if (kinds.has("OR") && (kinds.has("AND") || kinds.has("NOT"))) {
    const first = ops[0].op
    const switches = ops.filter((o) => o.op !== first)
    findings.push({
      code: "mixed-operators",
      severity: "warning",
      message:
        "AND und OR stehen ohne Klammern auf derselben Ebene. PubMed wertet strikt von links nach rechts aus: «A OR B AND C» wird als «(A OR B) AND C» gelesen, nicht als «A OR (B AND C)». Setze jede OR-Gruppe in eine Klammer.",
      start: switches[0].s,
      end: switches[0].e,
      more: switches.slice(1).map(toRange),
      fix: wrapOrRuns(items),
    })
  }
}

/** Puts parentheses around every run of OR-joined operands (the usual AND-of-ORs shape). */
function wrapOrRuns(items: Item[]): LintFix | undefined {
  const edits: Edit[] = []
  let run: Item[] = []
  let pending: OpItem["op"] | null = null
  const flush = () => {
    if (run.length > 1) {
      edits.push({ start: run[0].s, end: run[0].s, text: "(" }, { start: run[run.length - 1].e, end: run[run.length - 1].e, text: ")" })
    }
    run = []
  }
  for (const it of items) {
    if (it.kind === "op") {
      pending = it.op
      continue
    }
    if (it.kind === "range") continue
    if (run.length === 0) run = [it]
    else if (pending === "OR") run.push(it)
    else {
      flush()
      run = [it]
    }
    pending = null
  }
  flush()
  return edits.length ? { label: "Klammern um die OR-Gruppen setzen", edits } : undefined
}

interface Aggregates {
  typographic: Array<{ pos: number; ch: string }>
  untagged: Operand[]
  truncPhrase: Operand[]
}

function walk(items: Item[], ctx: Ctx, agg: Aggregates, closed: boolean, range: Range | null) {
  checkLevel(items, ctx, closed, range)
  for (const it of items) {
    if (it.kind === "operand") checkOperand(it, ctx, agg)
    else if (it.kind === "group") walk(it.items, ctx, agg, it.closed, { start: it.s, end: it.e })
  }
}

/* ── Public API ─────────────────────────────────────────────────── */

export function lintQuery(src: string): LintFinding[] {
  if (!src.trim()) return []
  const ctx: Ctx = { src, toks: lex(src), pos: 0, findings: [], operands: [], strays: [], lowerOps: [] }
  const agg: Aggregates = { typographic: [], untagged: [], truncPhrase: [] }

  const top = parseLevel(ctx, 0)
  walk(top.items, ctx, agg, false, null)

  for (const s of ctx.strays) {
    const comma = /^[,;]+$/.test(s.text)
    ctx.findings.push({
      code: s.afterQuote ? "stray-after-quote" : "stray-char",
      severity: "error",
      message: s.afterQuote
        ? `Direkt hinter dem Anführungszeichen steht «${s.text}». Das ist ein Tippfehler und wird von PubMed nicht als Teil der Phrase gelesen.`
        : comma
          ? "Ein Komma ist in PubMed kein OR. Verknüpfe Synonyme mit OR."
          : `Das Zeichen «${s.text}» gehört nicht in die PubMed-Syntax.`,
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
      message: `Typografische Anführungszeichen (${[...new Set(sorted.map((t) => t.ch))].join(" ")}) kennt PubMed nicht. Nur gerade Anführungszeichen " zählen als Phrase. Word und Mail setzen oft automatisch typografische Zeichen.`,
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
      severity: "warning",
      message: "Operatoren müssen gross geschrieben werden (AND, OR, NOT). Kleingeschrieben liest PubMed sie als normale Suchwörter.",
      start: lo[0].s,
      end: lo[0].e,
      more: lo.slice(1).map(toRange),
      fix: { label: "Operatoren gross schreiben", edits: lo.map((o) => ({ start: o.s, end: o.e, text: o.op })) },
    })
  }

  if (agg.untagged.length) {
    const u = agg.untagged
    const edits: Edit[] = []
    for (const o of u) {
      if (!o.quoted && o.words > 1) {
        edits.push({ start: o.s, end: o.s, text: '"' }, { start: o.textEnd, end: o.textEnd, text: '"[tiab]' })
      } else {
        edits.push({ start: o.textEnd, end: o.textEnd, text: "[tiab]" })
      }
    }
    ctx.findings.push({
      code: "no-field-tag",
      severity: "warning",
      message: `${u.length === 1 ? "Ein Begriff hat" : `${u.length} Begriffe haben`} kein Field Tag. Ohne Tag sucht PubMed in allen Feldern und versucht, deine Wörter selbst einem MeSH-Begriff zuzuordnen (Automatic Term Mapping). Stichworte gehören mit [tiab] in Titel und Abstract, Schlagworte mit [Mesh].`,
      start: u[0].s,
      end: u[0].e,
      more: u.slice(1).map(toRange),
      fix: { label: "[tiab] an alle Begriffe hängen", edits },
    })
  }

  if (agg.truncPhrase.length) {
    const t = agg.truncPhrase
    ctx.findings.push({
      code: "trunc-in-phrase",
      severity: "warning",
      message: `Trunkierung innerhalb einer Phrase ohne Field Tag (${t.map((o) => `«${preview(o.text, 22)}»`).slice(0, 3).join(", ")}${t.length > 3 ? ", …" : ""}). Laut PubMed-Hilfe braucht eine Phrase mit * Anführungszeichen oder ein Field Tag. Am sichersten ist beides: "back exercise*"[tiab].`,
      start: t[0].s,
      end: t[0].e,
      more: t.slice(1).map(toRange),
      fix: { label: "[tiab] an die Phrasen hängen", edits: t.map((o) => ({ start: o.textEnd, end: o.textEnd, text: "[tiab]" })) },
    })
  }

  return ctx.findings.sort(
    (a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] || a.start - b.start,
  )
}

/** Applies edits (computed against the original text) from the back to the front. */
export function applyEdits(src: string, edits: Edit[]): string {
  const sorted = edits.map((e, i) => ({ ...e, i })).sort((a, b) => b.start - a.start || b.i - a.i)
  let out = src
  for (const e of sorted) out = out.slice(0, e.start) + e.text + out.slice(e.end)
  return out
}

export function applyFix(src: string, fix: LintFix): string {
  return applyEdits(src, fix.edits)
}

/**
 * Applies fixes one finding at a time and lints again after each, until no
 * fixable finding is left (or `maxPasses`). Returns the new text and the labels applied.
 */
export function autoFix(src: string, maxPasses = 12): { text: string; applied: string[] } {
  let text = src
  const applied: string[] = []
  for (let pass = 0; pass < maxPasses; pass++) {
    const next = lintQuery(text).find((f) => f.fix)
    if (!next || !next.fix) break
    const after = applyFix(text, next.fix)
    if (after === text) break
    text = after
    applied.push(next.fix.label)
  }
  return { text, applied }
}
