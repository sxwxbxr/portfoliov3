"use client"

import { useEffect, useState } from "react"
import { init, prefersReducedMotion, supportsScrollTimeline } from "@/lib/demo/sigmoid"
import { sigmoidDemo } from "@/lib/demo/sigmoid-copy"

const t = sigmoidDemo.path

/**
 * Starts the fallback for the data-sigmoid elements of the page (a no-op in
 * browsers with scroll timelines) and says which path this browser runs.
 */
export function SigmoidStatus() {
  const [state, setState] = useState<{ native: boolean; reduced: boolean } | null>(null)

  useEffect(() => {
    setState({ native: supportsScrollTimeline(), reduced: prefersReducedMotion() })
    return init()
  }, [])

  if (!state) return null
  return (
    <div className="well flex max-w-2xl flex-col gap-1 px-5 py-4 text-sm">
      <p className="text-fg">
        <span className="annotate mr-2">{t.label}</span>
        {state.native ? t.native : t.fallback}
      </p>
      {state.reduced && <p className="text-fg-muted">{t.reduced}</p>}
    </div>
  )
}
