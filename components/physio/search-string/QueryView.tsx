import type { ReactNode } from "react"
import { tokenize, type Token, type TokenKind } from "@/lib/physio/search-string/highlight"
import type { DatabaseId, LintFinding, LintSeverity } from "@/lib/physio/search-string/types"

/**
 * Syntax colouring for a search string, the same semantic classes for every database (tokenizer: lib/physio/search-string/highlight.ts).
 * Colour carries no meaning alone: headings are outlined, operators are small caps, line references sit on a chip,
 * limits are italic, truncation is bold; top-level AND starts a new line.
 * The palette stays inside the site tokens (ink, greys, the teal accent for headings, one red for errors).
 */

const HEADING = "mx-px rounded-[3px] border border-edge-mid bg-(--wash) px-1 text-(--signal-hi)"

const TOKEN_CLASS: Record<TokenKind, string> = {
  operator: "text-[11px] tracking-wide text-fg-muted",
  paren: "text-fg-muted",
  field: "text-fg-muted",
  heading: HEADING,
  phrase: "text-fg",
  text: "text-fg",
  truncation: "font-bold text-signal",
  ref: "mx-px rounded-[3px] bg-(--plate-hi) px-1 text-fg",
  limit: "italic text-fg-muted",
  plain: "",
}

/** Class of one token. `suggested` outlines a heading with a dashed border: it is a suggestion derived from MeSH, to be checked. */
function tokenClass(kind: TokenKind, database: DatabaseId, suggested: boolean): string {
  if (kind === "ref" && (database === "cochrane" || database === "pubmed")) return "text-fg"
  if (kind === "heading" && suggested) return `${HEADING} border-dashed`
  return TOKEN_CLASS[kind]
}

function Tok({ token, database, suggested }: { token: Token; database: DatabaseId; suggested: boolean }) {
  const cls = tokenClass(token.kind, database, suggested)
  return cls ? <span className={cls}>{token.text}</span> : <>{token.text}</>
}

export function QueryView({
  query,
  label,
  database = "pubmed",
  lineBreaks = true,
  suggestedHeadings = false,
}: {
  query: string
  label: string
  /** Which spelling to colour. */
  database?: DatabaseId
  /** Start a new line at every top-level AND. */
  lineBreaks?: boolean
  /** Mark subject headings as suggestions (CINAHL, Embase: derived from MeSH). */
  suggestedHeadings?: boolean
}) {
  const tokens = tokenize(query, database)
  return (
    <pre aria-label={label} className="whitespace-pre-wrap break-words font-mono text-[13px] leading-[1.9] [overflow-wrap:anywhere]">
      <code>
        {tokens.map((tok, i) => (
          <span key={i}>
            {lineBreaks && tok.breakBefore && <br />}
            <Tok token={tok} database={database} suggested={suggestedHeadings} />
          </span>
        ))}
      </code>
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
export function HighlightedText({
  text,
  findings,
  label,
  database = "pubmed",
}: {
  text: string
  findings: LintFinding[]
  label: string
  /** Syntax of the text, from detectLintDatabase. */
  database?: DatabaseId
}) {
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
  const tokens = tokenize(text, database)
  for (const t of tokens) cuts.add(t.start)
  const points = [...cuts].sort((a, b) => a - b)
  const parts: ReactNode[] = []
  let ti = 0
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i]
    const b = points[i + 1]
    if (a === b) continue
    const covering = spans.filter((s) => s.start <= a && s.end >= b)
    const worst = covering.sort((x, y) => RANK[y.severity] - RANK[x.severity])[0]
    const chunk = text.slice(a, b)
    while (ti < tokens.length - 1 && tokens[ti].end <= a) ti++
    const cls = tokenClass(tokens[ti]?.kind ?? "plain", database, false)
    const inner = cls ? <span className={cls}>{chunk}</span> : chunk
    parts.push(
      worst ? (
        <mark key={a} title={worst.message} className={`rounded-[2px] text-fg ${MARK[worst.severity]}`}>
          {inner}
        </mark>
      ) : (
        <span key={a}>{inner}</span>
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
