"use client"

import { useEffect, useRef } from "react"
import { Markdown } from "@/components/ai/Markdown"
import { cn } from "@/lib/utils"

export type Message = { role: "user" | "assistant"; content: string }

export const GREETING =
  "Hi! I'm Seya's AI assistant. Ask me anything about his work, projects, or availability."

interface ChatMessagesProps {
  messages: Message[]
  streaming: boolean
  error: string | null
}

function TypingDots() {
  return (
    <span className="flex items-center gap-1 py-1" aria-label="Assistant is typing">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-bounce rounded-full bg-muted-foreground/60"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </span>
  )
}

function Bubble({
  role,
  children,
}: {
  role: "user" | "assistant"
  children: React.ReactNode
}) {
  return (
    <div className={cn("flex", role === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
          role === "user"
            ? "bg-primary text-primary-foreground"
            : "bg-muted text-foreground"
        )}
      >
        {children}
      </div>
    </div>
  )
}

export function ChatMessages({ messages, streaming, error }: ChatMessagesProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, streaming])

  return (
    <div className="flex-1 space-y-3 overflow-y-auto p-4" data-lenis-prevent>
      <Bubble role="assistant">{GREETING}</Bubble>

      {messages.map((message, i) => {
        const isStreamingPlaceholder =
          streaming &&
          i === messages.length - 1 &&
          message.role === "assistant" &&
          message.content === ""

        return (
          <Bubble key={i} role={message.role}>
            {isStreamingPlaceholder ? (
              <TypingDots />
            ) : message.role === "assistant" ? (
              <div className="text-sm">
                <Markdown>{message.content}</Markdown>
              </div>
            ) : (
              <span className="whitespace-pre-wrap">{message.content}</span>
            )}
          </Bubble>
        )
      })}

      {error && (
        <p className="px-1 text-xs text-destructive">{error}</p>
      )}

      <div ref={bottomRef} />
    </div>
  )
}
