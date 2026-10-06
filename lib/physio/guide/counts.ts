/**
 * Reads the student's PubMed hit counts (rows per Suchkomponente and "total") and
 * says which component is the narrowest, whether the whole string is empty, too
 * narrow or too wide. Thresholds are rules of thumb of this tool, not a standard.
 */
import type { BuiltQuery, CountRow } from "../search-string"

export const FEW_HITS = 20
export const MANY_HITS = 20000

export interface ComponentCount {
  id: string
  label: string
  block: string
  count: number
}

export interface CountReading {
  /** none: nothing counted. partial: some rows pending or stopped by an error. done: all rows counted. */
  state: "none" | "partial" | "done"
  error: CountRow["error"]
  total: number | null
  components: ComponentCount[]
  /** Fewest hits among the counted components. */
  narrowest: ComponentCount | null
  widest: ComponentCount | null
  /** Components that alone find nothing: a typo or a far too specific term. */
  empty: ComponentCount[]
  verdict: "zero" | "few" | "ok" | "many" | null
}

export function readCounts(rows: CountRow[], built: BuiltQuery | null): CountReading {
  const labelOf = (id: string) => built?.components.find((c) => c.conceptId === id)
  const components: ComponentCount[] = []
  for (const r of rows) {
    if (r.id === "total" || r.count === null) continue
    const c = labelOf(r.id)
    if (c) components.push({ id: r.id, label: c.label, block: c.block, count: r.count })
  }
  const totalRow = rows.find((r) => r.id === "total")
  const total = totalRow && totalRow.count !== null ? totalRow.count : null
  const counted = rows.filter((r) => r.count !== null).length
  const error = rows.find((r) => r.error)?.error ?? null
  const sorted = [...components].sort((a, b) => a.count - b.count)
  const verdict: CountReading["verdict"] =
    total === null ? null : total === 0 ? "zero" : total < FEW_HITS ? "few" : total > MANY_HITS ? "many" : "ok"
  return {
    state: counted === 0 ? "none" : total !== null ? "done" : "partial",
    error,
    total,
    components,
    narrowest: sorted[0] ?? null,
    widest: sorted[sorted.length - 1] ?? null,
    empty: sorted.filter((c) => c.count === 0),
    verdict,
  }
}
