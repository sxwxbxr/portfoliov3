"use client"

import { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { X } from "lucide-react"
import { ChatBubble } from "./ChatBubble"
import { ChatInput } from "./ChatInput"
import { ChatMessages, type Message } from "./ChatMessages"
import { copy } from "@/lib/copy"

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
      setError(copy.chat.error)
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
            aria-label={copy.chat.dialogLabel}
            initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.25, ease: EASE }}
            // One large plate, rimmed. The transcript inside carries the two
            // polarities; the panel itself stays a single object.
            className="cast rim no-print fixed inset-3 z-50 flex flex-col overflow-hidden sm:inset-auto sm:bottom-6 sm:right-6 sm:h-[520px] sm:w-[380px]"
          >
            <header className="flex items-center justify-between gap-3 border-b border-edge-soft px-4 py-3">
              <div className="flex flex-col gap-0.5">
                <p className="font-display text-sm font-semibold tracking-tight">
                  {copy.chat.title}
                </p>
                <p className="annotate">{copy.chat.subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label={copy.chat.close}
                className="control inline-flex h-9 w-9 shrink-0 items-center justify-center"
              >
                <X className="h-4 w-4" aria-hidden="true" />
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
