"use client"

import { useEffect, useRef, type ComponentType, type KeyboardEvent, type MutableRefObject } from "react"
import Link from "next/link"
import { AlertTriangle, ArrowLeft, ArrowRight, Check, ChevronDown, ChevronUp, RotateCcw, X } from "lucide-react"
import { guideCopy } from "@/lib/physio/copy/guide"
import { resolveAction, type GuideDefinition, type GuideObservation } from "@/lib/physio/guide/types"
import { physioPath } from "@/lib/physio/urls"
import { cn } from "@/lib/utils"
import type { GuideApi, GuidePanelProps } from "./GuideProvider"

const c = guideCopy.panel

const iconBtn =
  "control inline-flex size-11 shrink-0 items-center justify-center rounded-md disabled:cursor-not-allowed disabled:opacity-40"
const textBtn = "inline-flex min-h-11 items-center gap-1.5 rounded-md px-2 text-sm text-fg-muted underline-offset-4 hover:text-fg hover:underline"

interface Props<C> {
  guide: GuideDefinition<C>
  ctx: C
  api: GuideApi
  panels?: Record<string, ComponentType<GuidePanelProps<C>>>
  focusRequest: MutableRefObject<boolean>
}

export function Observations({ items }: { items: GuideObservation[] }) {
  return (
    <ul className="flex flex-col gap-3">
      {items.map((o, i) => {
        const tone = o.tone ?? "info"
        return (
          <li key={i} className="flex gap-2.5 text-sm leading-relaxed">
            <span
              aria-hidden="true"
              className={cn(
                "mt-[0.2rem] grid size-4 shrink-0 place-items-center rounded-full",
                tone === "good" && "bg-signal text-signal-fg",
                tone === "warn" && "border border-fg text-fg",
                tone === "info" && "text-signal-bright",
              )}
            >
              {tone === "good" ? <Check className="size-3" /> : tone === "warn" ? <AlertTriangle className="size-2.5" /> : <span className="size-1.5 rounded-full bg-current" />}
            </span>
            <span className="min-w-0 [overflow-wrap:anywhere]">
              {tone !== "info" && <span className="sr-only">{guideCopy.tones[tone]}: </span>}
              {o.label && <span className="annotate mr-1.5 text-xs font-medium text-fg">{o.label}</span>}
              <span className="text-fg-muted">{o.text}</span>
            </span>
          </li>
        )
      })}
    </ul>
  )
}

export function GuidePanel<C>({ guide, ctx, api, panels, focusRequest }: Props<C>) {
  const step = guide.steps[api.index]
  const headingRef = useRef<HTMLHeadingElement>(null)
  const expandRef = useRef<HTMLButtonElement>(null)
  const focusExpand = useRef(false)
  const last = api.index === api.total - 1
  const ready = step.ready ? step.ready(ctx) : true
  const observations = step.observe(ctx)
  const action = resolveAction(step, ctx)
  const notice = guide.notice?.(ctx) ?? null
  const Panel = step.panel ? panels?.[step.panel] : undefined

  // A step change the student asked for moves focus to the new heading, so keyboard and
  // screen reader users land on the new content. Restoring a stored step does not.
  useEffect(() => {
    if (focusRequest.current && !api.minimised) headingRef.current?.focus({ preventScroll: true })
    focusRequest.current = false
  }, [api.index, api.minimised, focusRequest])

  useEffect(() => {
    if (api.minimised && focusExpand.current) {
      expandRef.current?.focus()
      focusExpand.current = false
    }
  }, [api.minimised])

  function onKeyDown(e: KeyboardEvent) {
    if (e.key === "Escape" && !e.defaultPrevented) {
      e.preventDefault()
      focusExpand.current = true
      api.setMinimised(true)
    }
  }

  if (api.minimised) {
    return (
      <aside
        aria-label={c.label}
        className="fixed inset-x-0 bottom-0 z-40 border-t border-edge-mid bg-plate shadow-[0_-4px_18px_-8px_oklch(0.25_0.03_235/0.25)] xl:inset-x-auto xl:right-6 xl:bottom-6 xl:w-[24rem] xl:rounded-xl xl:border"
      >
        <div className="flex items-center gap-1.5 py-1.5 pr-2 pl-4">
          <button
            ref={expandRef}
            type="button"
            onClick={() => api.setMinimised(false)}
            aria-expanded="false"
            className="flex min-h-11 min-w-0 flex-1 flex-col items-start justify-center text-left"
          >
            <span className="annotate text-xs">
              {c.stepOf(api.index + 1, api.total)} · {c.expand}
            </span>
            <span className="w-full truncate text-sm font-medium text-fg">{step.title}</span>
          </button>
          <button type="button" onClick={api.prev} disabled={api.index === 0} aria-label={c.prev} className={iconBtn}>
            <ArrowLeft className="size-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={api.next} disabled={last} aria-label={c.next} className={iconBtn}>
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
          <button type="button" onClick={() => api.setMinimised(false)} aria-label={c.expand} className={iconBtn}>
            <ChevronUp className="size-4" aria-hidden="true" />
          </button>
        </div>
      </aside>
    )
  }

  return (
    <aside
      aria-label={c.label}
      onKeyDown={onKeyDown}
      className={cn(
        "fixed inset-x-0 bottom-0 z-40 flex max-h-[60dvh] flex-col overflow-y-auto overscroll-contain border-t border-edge-mid bg-plate px-5 pt-4 pb-5",
        "shadow-[0_-8px_28px_-10px_oklch(0.25_0.03_235/0.30)]",
        "xl:sticky xl:inset-x-auto xl:bottom-auto xl:top-24 xl:z-auto xl:max-h-[calc(100dvh-7.5rem)] xl:rounded-xl xl:border xl:shadow-[var(--shadow-card)]",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="annotate text-xs">
          <span className="font-medium text-signal">{c.label}</span> · {c.stepOf(api.index + 1, api.total)}
        </p>
        <button type="button" onClick={() => api.setMinimised(true)} aria-expanded="true" aria-label={c.minimise} className={cn(iconBtn, "-mr-2 -mt-2 border-transparent bg-transparent")}>
          <ChevronDown className="size-4" aria-hidden="true" />
        </button>
      </div>

      <ol aria-label={c.progress} className="-ml-1 mb-1 flex flex-wrap items-center">
        {guide.steps.map((s, i) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => api.goTo(i)}
              aria-label={c.jumpTo(i + 1, s.title)}
              aria-current={i === api.index ? "step" : undefined}
              className="grid size-7 place-items-center rounded-full"
            >
              <span
                aria-hidden="true"
                className={cn(
                  "block rounded-full transition-all",
                  i === api.index ? "h-2.5 w-5 bg-signal" : i < api.index ? "size-2.5 bg-signal-bright" : "size-2.5 border border-edge-mid bg-plate",
                )}
              />
            </button>
          </li>
        ))}
      </ol>

      <h2 ref={headingRef} tabIndex={-1} className="mt-1 text-xl outline-none focus-visible:underline focus-visible:decoration-signal focus-visible:underline-offset-4">
        {step.title}
      </h2>

      <div className="mt-2 flex flex-col gap-2 text-sm leading-relaxed text-fg-muted">
        {step.body.map((p, i) => (
          <p key={i}>{p}</p>
        ))}
      </div>

      {notice && (api.index === 0 || last) && (
        <div className="well mt-4 flex flex-col items-start gap-1.5 px-4 py-3 text-sm" role="note">
          <p className="text-fg-muted">{notice}</p>
          <Link href={physioPath("/abo")} className="text-fg underline underline-offset-4">
            {c.demoLink}
          </Link>
        </div>
      )}

      <section aria-live="polite" aria-atomic="false" className="mt-5 flex flex-col gap-3 border-t border-edge-soft pt-4">
        <h3 className="annotate text-sm font-medium text-fg">{guide.yourDataLabel ?? c.yourCase}</h3>
        {observations.length ? <Observations items={observations} /> : <p className="text-sm text-fg-muted">{c.noObservations}</p>}
      </section>

      {action && (
        <section className="mt-5 flex flex-col gap-1 rounded-lg bg-(--wash) px-4 py-3">
          <h3 className="annotate text-sm font-medium text-fg">{c.yourTurn}</h3>
          <p id="guide-action" className="text-sm leading-relaxed text-fg">
            {action}
          </p>
        </section>
      )}

      {Panel && (
        <div className="mt-5 border-t border-edge-soft pt-4">
          <Panel ctx={ctx} />
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <button type="button" onClick={api.prev} disabled={api.index === 0} className="control inline-flex min-h-11 items-center gap-2 px-4 text-sm disabled:cursor-not-allowed disabled:opacity-40">
          <ArrowLeft className="size-4" aria-hidden="true" />
          {c.prev}
        </button>
        {last ? (
          <button type="button" onClick={() => api.setOn(false)} className="control control-primary inline-flex min-h-11 items-center gap-2 px-5 text-sm">
            <Check className="size-4" aria-hidden="true" />
            {c.finish}
          </button>
        ) : (
          <button
            type="button"
            onClick={api.next}
            aria-describedby={ready ? undefined : "guide-not-ready"}
            className={cn("control inline-flex min-h-11 items-center gap-2 px-5 text-sm", ready && "control-primary")}
          >
            {ready ? c.next : c.skip}
            <ArrowRight className="size-4" aria-hidden="true" />
          </button>
        )}
        {!ready && !last && (
          <p id="guide-not-ready" className="w-full text-xs text-fg-muted">
            {c.stillOpen}
          </p>
        )}
      </div>

      {api.index === 0 && <p className="mt-4 text-xs leading-relaxed text-fg-muted">{c.privacy}</p>}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 border-t border-edge-soft pt-2">
        <button type="button" onClick={api.restart} title={c.restartHint} className={textBtn}>
          <RotateCcw className="size-3.5" aria-hidden="true" />
          {c.restart}
        </button>
        <button type="button" onClick={() => api.setOn(false)} className={textBtn}>
          <X className="size-3.5" aria-hidden="true" />
          {c.stop}
        </button>
      </div>
    </aside>
  )
}
