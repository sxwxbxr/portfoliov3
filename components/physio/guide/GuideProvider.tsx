"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ComponentType, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { EMPTY_GUIDE_STATE, loadGuideState, saveGuideState, type StoredGuideState } from "@/lib/physio/guide/storage"
import { anchorsOf, clampStep, type GuideDefinition } from "@/lib/physio/guide/types"
import { GuidePanel } from "./GuidePanel"

/** What a tool-specific panel (PICO table, worksheet, ...) receives. */
export type GuidePanelProps<C> = { ctx: C }

export interface GuideApi {
  /** The stored state has been read (false on the server and for the first render). */
  loaded: boolean
  on: boolean
  invited: boolean
  index: number
  total: number
  /** `data-guide` ids of the current step while the guide is on (empty otherwise). A collapsed area uses this to open itself. */
  anchors: readonly string[]
  minimised: boolean
  setOn: (on: boolean) => void
  dismissInvite: () => void
  setMinimised: (m: boolean) => void
  goTo: (index: number, focus?: boolean) => void
  next: () => void
  prev: () => void
  restart: () => void
}

const GuideContext = createContext<GuideApi | null>(null)

/** The guide state of the nearest GuideProvider. Throws outside one: a toggle without a guide makes no sense. */
export function useGuide(): GuideApi {
  const api = useContext(GuideContext)
  if (!api) throw new Error("useGuide needs a <GuideProvider>")
  return api
}

/** The guide state, or null outside a GuideProvider. For areas that only react to the guide. */
export function useGuideOptional(): GuideApi | null {
  return useContext(GuideContext)
}

function prefersReducedMotion(): boolean {
  try {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches
  } catch {
    return false
  }
}

function setActive(ids: string[]): HTMLElement[] {
  document.querySelectorAll<HTMLElement>("[data-guide-active]").forEach((el) => el.removeAttribute("data-guide-active"))
  const found: HTMLElement[] = []
  for (const id of ids) {
    document.querySelectorAll<HTMLElement>(`[data-guide="${id}"]`).forEach((el) => {
      el.setAttribute("data-guide-active", "true")
      found.push(el)
    })
  }
  return found
}

interface Props<C> {
  guide: GuideDefinition<C>
  ctx: C
  /** Interactive panels by key (`GuideStep.panel`). */
  panels?: Record<string, ComponentType<GuidePanelProps<C>>>
  children: ReactNode
}

/**
 * Wraps a tool in the guided mode: keeps the on/off state and the current step (per tool and
 * guide, in localStorage), highlights the area of the current step, and renders the step bar
 * (desktop: sticky right column, phone: collapsible bottom sheet). The tool keeps working
 * normally; nothing is blocked. The student's own data is NOT stored.
 */
export function GuideProvider<C>({ guide, ctx, panels, children }: Props<C>) {
  const slug = guide.toolSlug
  const [stored, setStored] = useState<StoredGuideState>(EMPTY_GUIDE_STATE)
  const [loaded, setLoaded] = useState(false)
  const [minimised, setMinimised] = useState(false)
  const pendingScroll = useRef(false)
  const focusRequest = useRef(false)
  const total = guide.steps.length

  useEffect(() => {
    setStored(loadGuideState(slug))
    setLoaded(true)
  }, [slug])

  const update = useCallback(
    (patch: (s: StoredGuideState) => StoredGuideState) => {
      setStored((prev) => {
        const next = patch(prev)
        saveGuideState(slug, next)
        return next
      })
    },
    [slug],
  )

  const index = clampStep(stored.steps[guide.id], total)
  const step = guide.steps[index]
  const on = loaded && stored.on
  const anchorKey = on ? anchorsOf(step).join("|") : ""
  const anchors = useMemo(() => (anchorKey ? anchorKey.split("|") : []), [anchorKey])

  const setOn = useCallback(
    (value: boolean) => {
      pendingScroll.current = value
      focusRequest.current = value
      if (value) setMinimised(false)
      update((s) => ({ ...s, on: value, invited: true }))
    },
    [update],
  )

  const goTo = useCallback(
    (i: number, focus = true) => {
      pendingScroll.current = true
      focusRequest.current = focus
      update((s) => ({ ...s, steps: { ...s.steps, [guide.id]: clampStep(i, total) } }))
    },
    [update, guide.id, total],
  )

  const api: GuideApi = useMemo(
    () => ({
      loaded,
      on,
      invited: stored.invited,
      index,
      total,
      anchors,
      minimised,
      setOn,
      dismissInvite: () => update((s) => ({ ...s, invited: true })),
      setMinimised,
      goTo,
      next: () => goTo(index + 1),
      prev: () => goTo(index - 1),
      restart: () => {
        guide.onRestart?.(ctx)
        goTo(0)
      },
    }),
    // ctx is read at call time through the closure; a new ctx on every render must not rebuild the API.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loaded, on, stored.invited, index, total, anchors, minimised, setOn, update, goTo, guide],
  )

  // Highlight the anchors of the current step; scroll once per step change (or once the area exists).
  useEffect(() => {
    if (!on) {
      setActive([])
      return
    }
    const found = setActive(anchorsOf(step))
    if (pendingScroll.current && found.length) {
      pendingScroll.current = false
      found[0].scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" })
    } else if (pendingScroll.current && !anchorsOf(step).length) {
      pendingScroll.current = false
    }
  })

  useEffect(() => () => void setActive([]), [])

  const showColumn = on && !minimised

  return (
    <GuideContext.Provider value={api}>
      <div
        className={cn(
          showColumn && "xl:grid xl:grid-cols-[minmax(0,1fr)_23rem] xl:items-start xl:gap-10",
          on && (minimised ? "pb-24" : "max-xl:pb-[62dvh]"),
        )}
      >
        <div className="min-w-0">{children}</div>
        {on && (
          <GuidePanel
            guide={guide}
            ctx={ctx}
            api={api}
            panels={panels}
            focusRequest={focusRequest}
          />
        )}
      </div>
    </GuideContext.Provider>
  )
}
