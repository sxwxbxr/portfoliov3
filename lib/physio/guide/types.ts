/**
 * Framework of the guided mode ("Geführter Modus"). Pure TypeScript: a guide is
 * data plus small functions over a tool-specific context object, so it can be
 * unit-tested without React. The UI lives in components/physio/guide.
 *
 * Adding a guide to a tool:
 *   1. Define `GuideDefinition<Ctx>` (steps with `anchor`, `body`, `observe`, optional `ready`, `action`, `panel`).
 *   2. Put `data-guide="<anchor>"` on the areas of the tool the steps point at.
 *   3. Wrap the tool in `<GuideProvider guide={def} ctx={ctx} panels={{ ... }}>` and place `<GuideToggle />` in it.
 *   4. Set `guide: true` on the tool's entry in lib/physio/tools.ts.
 */

export type GuideTone = "info" | "good" | "warn"

/** One line of the block "Bei deiner Frage:". Built from the student's own data. */
export interface GuideObservation {
  tone?: GuideTone
  /** Short label in front of the text ("Alter", "Vergleich"). */
  label?: string
  text: string
}

export interface GuideStep<C> {
  /** Stable id, also the key of the progress dot. */
  id: string
  title: string
  /** `data-guide` id(s) of the areas to highlight and scroll to. Empty: nothing to point at. */
  anchor: string | readonly string[]
  /** The explanation, one string per paragraph. Static. */
  body: readonly string[]
  /** Concrete observations about the student's own case. Called on every render: keep it cheap and pure. */
  observe(ctx: C): GuideObservation[]
  /** Can the student go on? Default: yes. While false, "Weiter" is replaced by "Trotzdem weiter". */
  ready?(ctx: C): boolean
  /** What the student does now, one sentence. */
  action?: string | ((ctx: C) => string)
  /** Key of an interactive panel the provider renders under the observations. */
  panel?: string
}

export interface GuideDefinition<C> {
  /** Storage key part, unique per guide ("suchstring.generate"). */
  id: string
  /** Registry slug of the tool; the on/off state is remembered per tool. */
  toolSlug: string
  steps: readonly GuideStep<C>[]
  /** Heading of the observations block. Default: "Bei deiner Frage:". */
  yourDataLabel?: string
  /** A note shown on the first and the last step (the demo limitation). */
  notice?(ctx: C): string | null
  /** Restart: reset whatever the tool keeps for the guide (edits to the worksheet). */
  onRestart?(ctx: C): void
}

export function anchorsOf(step: Pick<GuideStep<unknown>, "anchor">): string[] {
  return typeof step.anchor === "string" ? (step.anchor ? [step.anchor] : []) : [...step.anchor]
}

export function resolveAction<C>(step: GuideStep<C>, ctx: C): string | null {
  if (!step.action) return null
  return typeof step.action === "function" ? step.action(ctx) : step.action
}

/** Clamps a stored step index to the guide. */
export function clampStep(index: unknown, total: number): number {
  const n = typeof index === "number" && Number.isFinite(index) ? Math.trunc(index) : 0
  return Math.min(Math.max(n, 0), Math.max(total - 1, 0))
}
