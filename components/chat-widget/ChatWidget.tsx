"use client"

import { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { X } from "lucide-react"
import { ChatBubble } from "./ChatBubble"
import { ChatInput } from "./ChatInput"
import { ChatMessages, type Message } from "./ChatMessages"

const EASE = [0.16, 1, 0.3, 1] as const

export function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [streaming, setStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const prefersReducedMotion = useReducedMotion()

  async function send(text: string) {
    if (streaming) return
    setError(null)

    const history: Message[] = [...messages, { role: "user", content: text }]
    // Show the user message plus an empty assistant placeholder (typing dots).
    setMessages([...history, { role: "assistant", content: "" }])
    setStreaming(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Cap history so we never exceed the route's max message count.
        body: JSON.stringify({ messages: history.slice(-20) }),
      })
      if (!res.ok || !res.body) throw new Error("request failed")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setMessages((prev) => {
          const copy = [...prev]
          copy[copy.length - 1] = { role: "assistant", content: acc }
          return copy
        })
      }

      if (!acc.trim()) {
        // Stream produced nothing — treat as an error.
        throw new Error("empty response")
      }
    } catch {
      setError("Something went wrong. Please try again.")
      // Drop the empty assistant placeholder.
      setMessages((prev) =>
        prev.filter(
          (m, i) => !(i === prev.length - 1 && m.role === "assistant" && m.content === "")
        )
      )
    } finally {
      setStreaming(false)
    }
  }

  return (
    <>
      {!open && <ChatBubble onClick={() => setOpen(true)} />}

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Chat with Seya's AI assistant"
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: EASE }}
            className="fixed inset-3 z-50 flex flex-col overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-2xl sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[520px] sm:w-[380px]"
          >
            <header className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <p className="text-sm font-semibold">Seya&apos;s AI assistant</p>
                <p className="text-xs text-muted-foreground">Usually replies instantly</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </header>

            <ChatMessages messages={messages} streaming={streaming} error={error} />

            <ChatInput onSend={send} disabled={streaming} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
