import type { ReactNode } from "react"
import type { LintFinding, LintSeverity } from "@/lib/physio/search-string/types"

/**
 * Syntax colouring for a PubMed string. Colour carries no meaning alone:
 * MeSH tags are outlined, operators are small caps, top-level AND starts a new line.
 * The palette stays inside the site tokens (ink, greys, the teal accent for MeSH, one red for errors).
 */

const TOKEN_RE = /("[^"]*")(\[[^\]]*\])?|\b(AND|OR|NOT)\b|([()])|([^\s()"[\]]+)(\[[^\]]*\])|([^\s()"[\]]+)|(\s+)|([\s\S])/g

function isMeshTag(tag: string): boolean {
  return /^\[(mesh|mh|majr)/i.test(tag)
}

function Tag({ tag }: { tag: string }) {
  return isMeshTag(tag) ? (
    <span className="mx-px rounded-[3px] border border-edge-mid bg-(--wash) px-1 text-(--signal-hi)">{tag}</span>
  ) : (
    <span className="text-fg-muted">{tag}</span>
  )
}

/** Cochrane tokens: [mh …] pill, "phrase" with field code, field code after a parenthesis, operators, #n line references, words. */
const COCHRANE_RE =
  /(\[mh(?:[^\]\[]|\[[^\]]*\])*\])|("[^"]*")(:[a-z]+(?:,[a-z]+)*)?|\b(AND|OR|NOT|NEXT|NEAR(?:\/\d+)?)\b|([()])|(:[a-z]+(?:,[a-z]+)*)|(#\d+)|([^\s()"[\]:]+)(:[a-z]+(?:,[a-z]+)*)?|(\s+)|([\s\S])/gi

function CochraneNodes({ query, lineBreaks }: { query: string; lineBreaks: boolean }) {
  const nodes: ReactNode[] = []
  let depth = 0
  let key = 0
  COCHRANE_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = COCHRANE_RE.exec(query))) {
    const [, mesh, phrase, phraseField, op, paren, field, ref, word, wordField, space, other] = m
    const k = key++
    if (mesh) {
      nodes.push(
        <span key={k} className="mx-px rounded-[3px] border border-edge-mid bg-(--wash) px-1 text-(--signal-hi)">
          {mesh}
        </span>,
      )
    } else if (phrase) {
      nodes.push(
        <span key={k}>
          <span className="text-fg">{phrase}</span>
          {phraseField && <span className="text-fg-muted">{phraseField}</span>}
        </span>,
      )
    } else if (op) {
      const upper = op.toUpperCase()
      const lineBreak = lineBreaks && depth === 0 && upper === "AND" && nodes.length > 0
      nodes.push(
        <span key={k}>
          {lineBreak && <br />}
          <span className="text-[11px] tracking-wide text-fg-muted">{op}</span>
        </span>,
      )
    } else if (paren) {
      depth += paren === "(" ? 1 : -1
      nodes.push(
        <span key={k} className="text-fg-muted">
          {paren}
        </span>,
      )
    } else if (field) {
      nodes.push(
        <span key={k} className="text-fg-muted">
          {field}
        </span>,
      )
    } else if (ref) {
      nodes.push(
        <span key={k} className="text-fg">
          {ref}
        </span>,
      )
    } else if (word) {
      nodes.push(
        <span key={k}>
          <span className="text-fg">{word}</span>
          {wordField && <span className="text-fg-muted">{wordField}</span>}
        </span>,
      )
    } else if (space) {
      nodes.push(<span key={k}>{space}</span>)
    } else if (other) {
      nodes.push(<span key={k}>{other}</span>)
    }
  }
  return <>{nodes}</>
}

export function QueryView({
  query,
  label,
  syntax = "pubmed",
  lineBreaks = true,
}: {
  query: string
  label: string
  /** Which spelling to colour. */
  syntax?: "pubmed" | "cochrane"
  /** Start a new line at every top-level AND. */
  lineBreaks?: boolean
}) {
  if (syntax === "cochrane") {
    return (
      <pre aria-label={label} className="whitespace-pre-wrap break-words font-mono text-[13px] leading-[1.9] [overflow-wrap:anywhere]">
        <code>
          <CochraneNodes query={query} lineBreaks={lineBreaks} />
        </code>
      </pre>
    )
  }
  const nodes: ReactNode[] = []
  let depth = 0
  let key = 0
  TOKEN_RE.lastIndex = 0
  let m: RegExpExecArray | null
  while ((m = TOKEN_RE.exec(query))) {
    const [, phrase, phraseTag, op, paren, word, wordTag, bare, space, other] = m
    const k = key++
    if (phrase) {
      nodes.push(
        <span key={k}>
          <span className="text-fg">{phrase}</span>
          {phraseTag && <Tag tag={phraseTag} />}
        </span>,
      )
    } else if (op) {
      const lineBreak = lineBreaks && depth === 0 && op === "AND" && nodes.length > 0
      nodes.push(
        <span key={k}>
          {lineBreak && <br />}
          <span className="text-[11px] tracking-wide text-fg-muted">{op}</span>
        </span>,
      )
    } else if (paren) {
      depth += paren === "(" ? 1 : -1
      nodes.push(
        <span key={k} className="text-fg-muted">
          {paren}
        </span>,
      )
    } else if (word) {
      nodes.push(
        <span key={k}>
          <span className="text-fg">{word}</span>
          {wordTag && <Tag tag={wordTag} />}
        </span>,
      )
    } else if (bare) {
      nodes.push(
        <span key={k} className="text-fg">
          {bare}
        </span>,
      )
    } else if (space) {
      nodes.push(<span key={k}>{space}</span>)
    } else if (other) {
      nodes.push(<span key={k}>{other}</span>)
    }
  }
  return (
    <pre
      aria-label={label}
      className="whitespace-pre-wrap break-words font-mono text-[13px] leading-[1.9] [overflow-wrap:anywhere]"
    >
      <code>{nodes}</code>
    </pre>
  )
}

const MARK: Record<LintSeverity, string> = {
  error: "bg-[color-mix(in_oklab,var(--danger)_24%,transparent)] underline decoration-destructive decoration-wavy underline-offset-4",
  warning: "bg-plate-hi underline decoration-fg underline-offset-4",
  info: "bg-transparent underline decoration-fg-muted decoration-dotted underline-offset-4",
}

const RANK: Record<LintSeverity, number> = { error: 3, warning: 2, info: 1 }

/** The input string with every finding range marked. Overlaps show the worst severity. */
export function HighlightedText({ text, findings, label }: { text: string; findings: LintFinding[]; label: string }) {
  const spans: Array<{ start: number; end: number; severity: LintSeverity; message: string }> = []
  for (const f of findings) {
    spans.push({ start: f.start, end: f.end, severity: f.severity, message: f.message })
    for (const r of f.more ?? []) spans.push({ start: r.start, end: r.end, severity: f.severity, message: f.message })
  }
  const cuts = new Set<number>([0, text.length])
  for (const s of spans) {
    cuts.add(Math.max(0, Math.min(text.length, s.start)))
    cuts.add(Math.max(0, Math.min(text.length, s.end)))
  }
  const points = [...cuts].sort((a, b) => a - b)
  const parts: ReactNode[] = []
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]
    const b = points[i + 1]
    if (a === b) continue
    const covering = spans.filter((s) => s.start <= a && s.end >= b)
    const worst = covering.sort((x, y) => RANK[y.severity] - RANK[x.severity])[0]
    const chunk = text.slice(a, b)
    parts.push(
      worst ? (
        <mark key={a} title={worst.message} className={`rounded-[2px] text-fg ${MARK[worst.severity]}`}>
          {chunk}
        </mark>
      ) : (
        <span key={a}>{chunk}</span>
      ),
    )
  }
  return (
    <pre
      aria-label={label}
      className="whitespace-pre-wrap break-words font-mono text-[13px] leading-[1.9] text-fg-muted [overflow-wrap:anywhere]"
    >
      <code>{parts}</code>
    </pre>
  )
}
