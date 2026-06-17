"use client"

import { Sparkles } from "lucide-react"

interface ChatBubbleProps {
  onClick: () => void
}

export function ChatBubble({ onClick }: ChatBubbleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open chat — ask me anything"
      className="group fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full bg-primary px-4 py-3 text-primary-foreground shadow-lg transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none"
    >
      <Sparkles className="size-5 shrink-0" />
      <span className="hidden text-sm font-medium sm:inline">Ask me anything</span>
    </button>
  )
}
