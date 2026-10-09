"use client"

import { useId } from "react"
import { Compass } from "lucide-react"
import { ssCopy } from "@/lib/physio/copy/search-string"
import { suchstringGuide } from "@/lib/physio/guide/suchstring"
import { useGuide } from "@/components/physio/guide/GuideProvider"

const PICO_STEP = Math.max(
  0,
  suchstringGuide.steps.findIndex((s) => s.id === "pico"),
)

/**
 * Friendly note above the result when the input reads like a case description. It never blocks:
 * the string below is built from the text anyway. The button opens the guided mode at the PICO step.
 */
export function CaseNotice() {
  const g = useGuide()
  const id = useId()
  const t = ssCopy.caseNotice
  return (
    <section aria-labelledby={id} className="well flex flex-col gap-3 px-5 py-4 md:flex-row md:items-center md:justify-between md:gap-8">
      <div className="min-w-0">
        <h2 id={id} className="text-lg">
          {t.title}
        </h2>
        <p className="measure mt-1 text-sm leading-relaxed text-fg-muted">{t.body}</p>
      </div>
      <button
        type="button"
        onClick={() => {
          g.setOn(true)
          g.goTo(PICO_STEP)
        }}
        className="control inline-flex min-h-11 shrink-0 items-center gap-2 px-5 text-sm"
      >
        <Compass className="size-4 text-signal" aria-hidden="true" />
        {t.action}
      </button>
    </section>
  )
}
