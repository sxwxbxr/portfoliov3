/**
 * What the guided mode remembers on the device: on/off, whether the invitation was
 * answered, and the current step per guide. The student's case, PICO and criteria are
 * deliberately NOT stored: they live in memory only.
 */

export interface StoredGuideState {
  on: boolean
  invited: boolean
  steps: Record<string, number>
}

export const EMPTY_GUIDE_STATE: StoredGuideState = { on: false, invited: false, steps: {} }

export const guideStorageKey = (toolSlug: string) => `physio-guide:${toolSlug}`

type StorageLike = Pick<Storage, "getItem" | "setItem">

function defaultStorage(): StorageLike | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage
  } catch {
    return null
  }
}

export function loadGuideState(toolSlug: string, storage: StorageLike | null = defaultStorage()): StoredGuideState {
  try {
    const raw = storage?.getItem(guideStorageKey(toolSlug))
    if (!raw) return EMPTY_GUIDE_STATE
    const p = JSON.parse(raw) as Partial<StoredGuideState>
    const steps: Record<string, number> = {}
    if (p.steps && typeof p.steps === "object") {
      for (const [k, v] of Object.entries(p.steps)) if (typeof v === "number" && Number.isFinite(v)) steps[k] = v
    }
    return { on: p.on === true, invited: p.invited === true, steps }
  } catch {
    return EMPTY_GUIDE_STATE
  }
}

export function saveGuideState(toolSlug: string, state: StoredGuideState, storage: StorageLike | null = defaultStorage()): void {
  try {
    storage?.setItem(guideStorageKey(toolSlug), JSON.stringify(state))
  } catch {
    /* private window, blocked or full: the guide works, it just forgets */
  }
}
