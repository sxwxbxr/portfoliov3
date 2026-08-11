"use client"

import { Sparkles } from "lucide-react"

interface ChatBubbleProps {
  onClick: () => void
}

export function ChatBubble({ onClick }: ChatBubbleProps) {
  return (
    // A round control cast out of the ground. The press state comes from
    // `.control` inverting its polarity, so no hover-scale is needed — and
    // nothing has to be excluded from reduced motion.
    <button
      type="button"
      onClick={onClick}
      aria-label="Chat öffnen — frag mich etwas"
      className="control no-print fixed bottom-6 right-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full"
    >
      <Sparkles className="h-5 w-5 text-signal" aria-hidden="true" />
    </button>
  )
}
