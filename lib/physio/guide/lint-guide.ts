/**
 * The short guide of the "Eigenen String prüfen" tab: it walks through the findings of
 * the student's own string one by one, then ends with a checklist for a clean string.
 * Findings arrive through LintPanel.onStateChange.
 */
import type { LintFinding } from "../search-string"
import { guideCopy } from "../copy/guide"
import type { GuideDefinition, GuideObservation, GuideStep } from "./types"

const t = guideCopy.lint
const obs = t.obs

export interface LintGuideCtx {
  mode: "demo" | "full"
  text: string
  findings: LintFinding[]
  /** Number of findings when the student first looked at this string, or null. */
  baseline: number | null
}

const RANK: Record<LintFinding["severity"], number> = { error: 0, warning: 1, info: 2 }

/** Errors first, then warnings, then hints; by position inside a group. */
export function sortFindings(findings: LintFinding[]): LintFinding[] {
  return [...findings].sort((a, b) => RANK[a.severity] - RANK[b.severity] || a.start - b.start)
}

export function explainFinding(code: string): { meaning: string; todo: string } {
  return t.explain[code] ?? t.explainFallback
}

export function countBySeverity(findings: LintFinding[]) {
  return {
    error: findings.filter((f) => f.severity === "error").length,
    warning: findings.filter((f) => f.severity === "warning").length,
    info: findings.filter((f) => f.severity === "info").length,
  }
}

export interface ChecklistItem {
  id: string
  label: string
  ok: boolean
  /** Findings that keep it open. */
  open: number
}

export function lintChecklist(findings: LintFinding[]): ChecklistItem[] {
  return t.checklist.map((item) => {
    const hits = findings.filter((f) => (item.codes.includes("*error") ? f.severity === "error" : item.codes.includes(f.code)))
    return { id: item.id, label: item.label, ok: hits.length === 0, open: hits.length }
  })
}

const o = (text: string, label?: string, tone: GuideObservation["tone"] = "info"): GuideObservation => ({ text, label, tone })

function observeInput(ctx: LintGuideCtx): GuideObservation[] {
  if (!ctx.text.trim()) return [o(obs.empty)]
  const c = countBySeverity(ctx.findings)
  const out = [o(obs.length(ctx.text.length))]
  if (!ctx.findings.length) out.push(o(obs.clean, undefined, "good"))
  else {
    out.push(o(obs.summary(c.error, c.warning, c.info), undefined, c.error ? "warn" : "info"))
    const fixable = ctx.findings.filter((f) => f.fix).length
    if (fixable) out.push(o(obs.fixable(fixable)))
  }
  return out
}

function observeFindings(ctx: LintGuideCtx): GuideObservation[] {
  if (!ctx.text.trim()) return [o(obs.empty)]
  if (!ctx.findings.length) return [o(obs.clean, undefined, "good")]
  const c = countBySeverity(ctx.findings)
  const out = [o(obs.summary(c.error, c.warning, c.info))]
  if (c.error) out.push(o(obs.errorsFirst, undefined, "warn"))
  return out
}

function observeRecheck(ctx: LintGuideCtx): GuideObservation[] {
  if (!ctx.text.trim()) return [o(obs.empty)]
  const c = countBySeverity(ctx.findings)
  const out: GuideObservation[] = []
  if (ctx.baseline !== null) out.push(o(obs.progress(ctx.findings.length, ctx.baseline), obs.progressLabel, ctx.findings.length === 0 ? "good" : "info"))
  out.push(c.error ? o(obs.errorsLeft(c.error), undefined, "warn") : o(obs.noErrors, undefined, "good"))
  return out
}

function observeChecklist(ctx: LintGuideCtx): GuideObservation[] {
  if (!ctx.text.trim()) return [o(obs.empty)]
  const out: GuideObservation[] = lintChecklist(ctx.findings).map((i) =>
    i.ok
      ? { tone: "good", label: t.panels.checklist.ok, text: i.label }
      : { tone: "warn", label: t.panels.checklist.open, text: `${i.label} (${i.open} ${i.open === 1 ? "Befund" : "Befunde"})` },
  )
  for (const m of t.checklistManual) out.push({ tone: "info", label: t.panels.checklist.manual, text: m })
  return out
}

const steps: GuideStep<LintGuideCtx>[] = [
  {
    id: "input",
    title: t.steps.input.title,
    anchor: "ss-lint",
    body: t.steps.input.body,
    observe: observeInput,
    ready: (c) => !!c.text.trim(),
    action: (c) => (c.mode === "demo" ? t.steps.input.actionDemo : t.steps.input.actionFull),
  },
  {
    id: "findings",
    title: t.steps.findings.title,
    anchor: "ss-lint",
    body: t.steps.findings.body,
    observe: observeFindings,
    ready: (c) => !!c.text.trim(),
    action: t.steps.findings.action,
    panel: "lint-findings",
  },
  {
    id: "recheck",
    title: t.steps.recheck.title,
    anchor: "ss-lint",
    body: t.steps.recheck.body,
    observe: observeRecheck,
    ready: (c) => !!c.text.trim(),
    action: t.steps.recheck.action,
  },
  {
    id: "checklist",
    title: t.steps.checklist.title,
    anchor: "ss-lint",
    body: t.steps.checklist.body,
    observe: observeChecklist,
    action: t.steps.checklist.action,
  },
]

export const lintGuide: GuideDefinition<LintGuideCtx> = {
  id: "suchstring.lint",
  toolSlug: "suchstring",
  steps,
  yourDataLabel: t.yourData,
  notice: (c) => (c.mode === "demo" ? guideCopy.panel.demoNotice : null),
}
