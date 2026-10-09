"use client"

import { useEffect, useState } from "react"
import { ssCopy } from "@/lib/physio/copy/search-string"
import { EXAMPLES, analyzeAsync, buildQuery, createModel } from "@/lib/physio/search-string"
import { QueryView } from "./QueryView"

/**
 * The sample string on the paywall page. Built in the browser with the real
 * engine and the real dictionary, so it is exactly what the tool produces.
 */
export function SampleQuery() {
  const [query, setQuery] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    let cancelled = false
    const ex = EXAMPLES.find((e) => e.id === "mueller") ?? EXAMPLES[0]
    analyzeAsync({ text: ex.text, pico: ex.pico }).then(
      (a) => !cancelled && setQuery(buildQuery(createModel(a)).query),
      () => !cancelled && setFailed(true),
    )
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className="well p-1.5">
      <div className="min-h-40 rounded-md p-4 md:p-5">
        {query ? (
          <QueryView query={query} label={ssCopy.result.stringLabel} />
        ) : failed ? null : (
          <p role="status" className="inline-flex items-center gap-2 text-sm text-fg-muted">
            <span aria-hidden="true" className="size-2 animate-pulse rounded-full bg-signal-bright" />
            {ssCopy.paywall.sampleLoading}
          </p>
        )}
      </div>
    </div>
  )
}
