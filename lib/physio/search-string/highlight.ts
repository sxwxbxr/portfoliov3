/**
 * Tokenizer for the syntax colouring of a search string, one reading per database.
 * Pure: the component maps a token kind to a style, so every database uses the same semantic kinds:
 *  - operator    AND OR NOT, NEAR/n NEXT/n (Cochrane, Embase), N5 W5 (CINAHL)
 *  - paren       ( )
 *  - field       field tag or code: [tiab], :ti,ab,kw, TI AB
 *  - heading     a subject heading as one unit: [Mesh] tag, [mh …], (MH "x+"), 'x'/exp
 *  - phrase      a quoted phrase
 *  - text        a bare word
 *  - truncation  * ? $ # inside a word or phrase (CINAHL and Embase only)
 *  - ref         a line reference: #1 (Cochrane, Embase), S1 (CINAHL)
 *  - limit       an Embase limit: [english]/lim, [2016-2026]/py
 *  - plain       white space and anything else
 * The tokens cover the input without gaps: the texts joined are the input.
 * PubMed and Cochrane keep the tokenization of the first version of QueryView.
 */
import type { DatabaseId } from "./types"

export type TokenKind = "operator" | "paren" | "field" | "heading" | "phrase" | "text" | "truncation" | "ref" | "limit" | "plain"

export interface Token {
  kind: TokenKind
  text: string
  start: number
  end: number
  /** An AND at the top level (not inside parentheses): the view may start a new line before it. */
  breakBefore?: boolean
}

const PUBMED_RE = /("[^"]*")(\[[^\]]*\])?|\b(AND|OR|NOT)\b|([()])|([^\s()"[\]]+)(\[[^\]]*\])|([^\s()"[\]]+)|(\s+)|([\s\S])/g

const COCHRANE_RE =
  /(\[mh(?:[^\]\[]|\[[^\]]*\])*\])|("[^"]*")(:[a-z]+(?:,[a-z]+)*)?|\b(AND|OR|NOT|NEXT|NEAR(?:\/\d+)?)\b|([()])|(:[a-z]+(?:,[a-z]+)*)|(#\d+)|([^\s()"[\]:]+)(:[a-z]+(?:,[a-z]+)*)?|(\s+)|([\s\S])/gi

const Q = `["“”„]`
const NOQ = `[^"“”„]`
const CINAHL_RE = new RegExp(
  [
    String.raw`(\(\s*(?:MH|MM)\s+${Q}${NOQ}*${Q}\s*\))`, // 1 (MH "x+")
    String.raw`((?:MH|MM)\s+${Q}${NOQ}*${Q})`, // 2 MH "x" without parentheses
    String.raw`(${Q}${NOQ}*${Q})`, // 3 phrase
    String.raw`\b(AND|OR|NOT)\b`, // 4
    String.raw`(?<=\s)([NW]\d{1,3})(?=\s)`, // 5 proximity N5 W5
    String.raw`([()])`, // 6
    String.raw`\b(TI|AB|TX|SU|AU|SO|AF|AN|IS|JN|SB|LA|PT|DT|PY|ZT|MW)(?=\s+[("“”„*?#\w])`, // 7 field code
    String.raw`(S\d+)(?=[\s)]|$)`, // 8 line reference
    String.raw`([^\s()"“”„*?#]+)`, // 9 word
    String.raw`([*?#]+)`, // 10 truncation
    String.raw`(\s+)`, // 11
    String.raw`([\s\S])`, // 12
  ].join("|"),
  "g",
)

const EMBASE_RE = new RegExp(
  [
    String.raw`((?:'[^']*'|"[^"]*"|[^\s()'"/:\[\]*?$]+)\/(?:exp|de|mj)(?:\/mj)?(?![\w]))`, // 1 'x'/exp, /de, /mj
    String.raw`(\[[^\]]*\]\/[a-z]+)`, // 2 [english]/lim, [2016-2026]/py
    String.raw`('[^']*'|"[^"]*")(:[a-z]+(?:,[a-z]+)*)?`, // 3 phrase, 4 field
    String.raw`\b((?:AND|OR|NOT)|(?:NEAR|NEXT)(?:\/\d+)?)(?![\w/])`, // 5 operators
    String.raw`([()])`, // 6
    String.raw`(:[a-z]+(?:,[a-z]+)*)`, // 7 field after a parenthesis
    String.raw`(#\d+)`, // 8 line reference
    String.raw`([^\s()'"*?$:\[\]][^\s()"*?$:\[\]]*)`, // 9 word
    String.raw`([*?$]+)`, // 10 truncation
    String.raw`(\s+)`, // 11
    String.raw`([\s\S])`, // 12
  ].join("|"),
  "g",
)

const TRUNC_RE: Record<"cinahl" | "embase", RegExp> = { cinahl: /[*?#]+/g, embase: /[*?$]+/g }

export function tokenize(query: string, database: DatabaseId = "pubmed"): Token[] {
  const tokens: Token[] = []
  let pos = 0
  let depth = 0
  const trunc = database === "cinahl" || database === "embase" ? TRUNC_RE[database] : null
  const push = (kind: TokenKind, text: string, breakBefore = false) => {
    if (!text) return
    tokens.push({ kind, text, start: pos, end: pos + text.length, ...(breakBefore ? { breakBefore: true } : {}) })
    pos += text.length
  }
  /** Text with the truncation characters set apart (CINAHL, Embase); everything else is one token. */
  const pushSplit = (kind: TokenKind, text: string) => {
    if (!trunc) return push(kind, text)
    let last = 0
    trunc.lastIndex = 0
    let m: RegExpExecArray | null
    while ((m = trunc.exec(text))) {
      push(kind, text.slice(last, m.index))
      push("truncation", m[0])
      last = m.index + m[0].length
    }
    push(kind, text.slice(last))
  }
  const paren = (p: string) => {
    depth += p === "(" ? 1 : -1
    push("paren", p)
  }
  const operator = (op: string, breakable: boolean) => {
    push("operator", op, breakable && depth === 0 && op.toUpperCase() === "AND" && tokens.length > 0)
  }

  if (database === "cochrane") {
    const re = new RegExp(COCHRANE_RE.source, COCHRANE_RE.flags)
    let m: RegExpExecArray | null
    while ((m = re.exec(query))) {
      const [, mesh, phrase, phraseField, op, par, field, ref, word, wordField, space, other] = m
      if (mesh) push("heading", mesh)
      else if (phrase) {
        push("phrase", phrase)
        push("field", phraseField ?? "")
      } else if (op) operator(op, true)
      else if (par) paren(par)
      else if (field) push("field", field)
      else if (ref) push("ref", ref)
      else if (word) {
        push("text", word)
        push("field", wordField ?? "")
      } else push("plain", space ?? other ?? "")
    }
  } else if (database === "cinahl") {
    const re = new RegExp(CINAHL_RE.source, CINAHL_RE.flags)
    let m: RegExpExecArray | null
    while ((m = re.exec(query))) {
      const [, head, bareHead, phrase, op, prox, par, field, ref, word, tr, space, other] = m
      if (head ?? bareHead) push("heading", (head ?? bareHead) as string)
      else if (phrase) pushSplit("phrase", phrase)
      else if (op) operator(op, true)
      else if (prox) push("operator", prox)
      else if (par) paren(par)
      else if (field) push("field", field)
      else if (ref) push("ref", ref)
      else if (word) push("text", word)
      else if (tr) push("truncation", tr)
      else push("plain", space ?? other ?? "")
    }
  } else if (database === "embase") {
    const re = new RegExp(EMBASE_RE.source, EMBASE_RE.flags)
    let m: RegExpExecArray | null
    while ((m = re.exec(query))) {
      const [, head, limit, phrase, phraseField, op, par, field, ref, word, tr, space, other] = m
      if (head) push("heading", head)
      else if (limit) push("limit", limit)
      else if (phrase) {
        pushSplit("phrase", phrase)
        push("field", phraseField ?? "")
      } else if (op) operator(op, true)
      else if (par) paren(par)
      else if (field) push("field", field)
      else if (ref) push("ref", ref)
      else if (word) push("text", word)
      else if (tr) push("truncation", tr)
      else push("plain", space ?? other ?? "")
    }
  } else {
    const re = new RegExp(PUBMED_RE.source, PUBMED_RE.flags)
    const isMesh = (tag: string) => /^\[(mesh|mh|majr)/i.test(tag)
    let m: RegExpExecArray | null
    while ((m = re.exec(query))) {
      const [, phrase, phraseTag, op, par, word, wordTag, bare, space, other] = m
      if (phrase) {
        push("phrase", phrase)
        if (phraseTag) push(isMesh(phraseTag) ? "heading" : "field", phraseTag)
      } else if (op) operator(op, true)
      else if (par) paren(par)
      else if (word) {
        push("text", word)
        if (wordTag) push(isMesh(wordTag) ? "heading" : "field", wordTag)
      } else if (bare) push("text", bare)
      else push("plain", space ?? other ?? "")
    }
  }
  return tokens
}
