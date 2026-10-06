/**
 * Cochrane Library output beyond the single line: the Search Manager strategy.
 *
 * Cochrane's Search Manager takes one search per numbered line (#1, #2, ...) and
 * combines lines with Boolean logic: (#1 OR #2) AND #3. Following the usual
 * practice for CENTRAL strategies, every term gets its own line (so the hit
 * count of each term is visible), the terms of one Suchkomponente are combined
 * with OR, and the components are combined with AND in a last line.
 * Line references cannot be mixed with free text and cannot be used with
 * NEAR/NEXT, so combination lines contain only #n and AND/OR.
 * https://www.cochranelibrary.com/search-manager-help
 *
 * The same builder writes the line strategies of CINAHL (S1, S2 ... on EBSCOhost) and
 * Embase (#1, #2 ... on embase.com): `prefix` names the reference, `filterLabel` the filter lines.
 * Combination lines hold only references and ONE kind of operator, which matters for Embase
 * (no operator precedence) and for EBSCO (AND before OR).
 */
import type { BuiltComponent, StrategyLine } from "./types"

export interface StrategyOptions {
  /** Line reference prefix. Default "#"; CINAHL uses "S". */
  prefix?: string
  /** German label of a filter line. Default: the Cochrane check-tag label. */
  filterLabel?: (clause: string) => string
}

export function buildStrategyLines(components: BuiltComponent[], filterClauses: string[], opts: StrategyOptions = {}): StrategyLine[] {
  const prefix = opts.prefix ?? "#"
  const ref = (n: number) => `${prefix}${n}`
  const lines: StrategyLine[] = []
  const refs: number[] = []
  const add = (line: Omit<StrategyLine, "n">): number => {
    const n = lines.length + 1
    lines.push({ ...line, n, ...(prefix !== "#" ? { prefix } : {}) })
    return n
  }

  for (const c of components) {
    const parts = c.parts ?? [c.query]
    const headingCount = c.headings?.length ?? 0
    const termLines = parts.map((query, i) =>
      add({ query, kind: "term", label: c.label, conceptId: c.conceptId, ...(i < headingCount ? { suggested: true } : {}) }),
    )
    if (termLines.length === 1) {
      refs.push(termLines[0])
    } else {
      refs.push(
        add({
          query: termLines.map(ref).join(" OR "),
          kind: "component",
          label: `${c.label} (alle Begriffe)`,
          conceptId: c.conceptId,
        }),
      )
    }
  }

  for (const clause of filterClauses) {
    refs.push(add({ query: clause, kind: "filter", label: opts.filterLabel?.(clause) ?? "Filter nach MeSH-Check-Tag (Alter oder Geschlecht)" }))
  }

  if (refs.length > 1) {
    add({ query: refs.map(ref).join(" AND "), kind: "final", label: "Alle Suchkomponenten verknüpft" })
  }
  return lines
}

/** The strategy as text. `numbered` writes "#1 query" ("S1 query" for CINAHL; documentation); otherwise one search per line, as typed into the database. */
export function strategyText(lines: StrategyLine[], numbered: boolean): string {
  return lines.map((l) => (numbered ? `${l.prefix ?? "#"}${l.n} ${l.query}` : l.query)).join("\n")
}
