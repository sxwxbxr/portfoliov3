/** Helpers both linters (PubMed and Cochrane) and the converter share. */
import type { Edit, LintFix } from "./types"

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

export function levenshtein(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i, ...new Array(b.length).fill(0)])
  for (let j = 0; j <= b.length; j++) dp[0][j] = j
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = Math.min(dp[i - 1][j] + 1, dp[i][j - 1] + 1, dp[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1))
  return dp[a.length][b.length]
}

/** Applies edits (computed against the original text) from the back to the front. */
export function applyEdits(src: string, edits: Edit[]): string {
  const sorted = edits.map((e, i) => ({ ...e, i })).sort((a, b) => b.start - a.start || b.i - a.i)
  let out = src
  for (const e of sorted) out = out.slice(0, e.start) + e.text + out.slice(e.end)
  return out
}

export interface LevelItem {
  kind: string
  s: number
  e: number
  op?: string
}

/** Puts parentheses around every run of OR-joined operands (the usual AND-of-ORs shape). */
export function wrapOrRuns(items: LevelItem[]): LintFix | undefined {
  const edits: Edit[] = []
  let run: LevelItem[] = []
  let pending: string | null = null
  const flush = () => {
    if (run.length > 1) {
      edits.push({ start: run[0].s, end: run[0].s, text: "(" }, { start: run[run.length - 1].e, end: run[run.length - 1].e, text: ")" })
    }
    run = []
  }
  for (const it of items) {
    if (it.kind === "op") {
      pending = it.op ?? null
      continue
    }
    if (it.kind === "range" || it.kind === "field") continue
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
