"use client"

import { Markdown } from "@/components/ai/Markdown"
import { copy } from "@/lib/copy"

interface DeepDiveContentProps {
  content: string
  loading: boolean
  error: string | null
  onRetry: () => void
}

export function DeepDiveContent({
  content,
  loading,
  error,
  onRetry,
}: DeepDiveContentProps) {
  // Error with nothing streamed yet — offer a retry.
  if (error && !content) {
    return (
      <div className="well flex flex-col items-center gap-4 p-8 text-center">
        <p className="text-sm text-fg-muted">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="control px-4 py-2.5 text-sm font-medium"
        >
          {copy.deepDive.retry}
        </button>
      </div>
    )
  }

  // Loading with nothing streamed yet — three paragraph placeholders, milled
  // into the plate rather than pulsing on top of it.
  if (loading && !content) {
    return (
      <div role="status" className="flex flex-col gap-5">
        <span className="sr-only">{copy.deepDive.loading}</span>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col gap-2.5" aria-hidden="true">
            <div className="well-sm h-4 w-44" />
            <div className="well-sm h-3 w-full" />
            <div className="well-sm h-3 w-11/12" />
            <div className="well-sm h-3 w-4/5" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="measure text-sm leading-relaxed text-fg-muted">
      <Markdown>{content}</Markdown>
    </div>
  )
}
