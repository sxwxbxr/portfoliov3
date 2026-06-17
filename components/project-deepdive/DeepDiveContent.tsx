"use client"

import { Markdown } from "@/components/ai/Markdown"
import { Skeleton } from "@/components/ui/skeleton"

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
      <p className="text-sm text-muted-foreground">
        {error}{" "}
        <button
          type="button"
          onClick={onRetry}
          className="text-primary underline underline-offset-2"
        >
          Try again
        </button>
      </p>
    )
  }

  // Loading with nothing streamed yet — three paragraph placeholders.
  if (loading && !content) {
    return (
      <div className="space-y-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-44" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-11/12" />
            <Skeleton className="h-3 w-4/5" />
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="text-sm text-foreground/90">
      <Markdown>{content}</Markdown>
    </div>
  )
}
