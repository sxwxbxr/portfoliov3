"use client"

import { Compass } from "lucide-react"
import { guideCopy } from "@/lib/physio/copy/guide"
import { cn } from "@/lib/utils"
import { useGuide } from "./GuideProvider"

/** The switch in the tool header. Everything else of the guided mode appears once it is on. */
export function GuideToggle({ className }: { className?: string }) {
  const g = useGuide()
  const t = guideCopy.toggle
  return (
    <button
      type="button"
      aria-pressed={g.on}
      onClick={() => g.setOn(!g.on)}
      className={cn("control inline-flex min-h-11 items-center gap-2 px-4 text-sm", g.on && "border-signal bg-(--wash)", className)}
    >
      <Compass className="size-4 text-signal" aria-hidden="true" />
      <span>{t.label}</span>
      <span className="sr-only">{g.on ? t.hintOn : t.hintOff}</span>
      <span aria-hidden="true" className="text-xs text-fg-muted">
        {g.on ? "an" : "aus"}
      </span>
    </button>
  )
}

/** First visit: one short invitation, dismissed for good once answered. */
export function GuideInvite() {
  const g = useGuide()
  const t = guideCopy.invite
  if (!g.loaded || g.on || g.invited) return null
  return (
    <section aria-labelledby="guide-invite" className="well mb-6 flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between md:gap-8">
      <div className="min-w-0">
        <h2 id="guide-invite" className="text-lg">
          {t.title}
        </h2>
        <p className="measure mt-1 text-sm leading-relaxed text-fg-muted">{t.body}</p>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <button type="button" onClick={() => g.setOn(true)} className="control control-primary inline-flex min-h-11 items-center px-5 text-sm">
          {t.start}
        </button>
        <button type="button" onClick={g.dismissInvite} className="control control-ghost inline-flex min-h-11 items-center px-4 text-sm">
          {t.later}
        </button>
      </div>
    </section>
  )
}
