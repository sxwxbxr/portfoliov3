"use client"

import { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Terminal, ChevronDown } from "lucide-react"
import { DeepDiveContent } from "./DeepDiveContent"

const EASE = [0.16, 1, 0.3, 1] as const

interface ProjectDeepDiveProps {
  slug: string
  title: string
  description: string
  techStack: string[]
}

export function ProjectDeepDive({
  slug,
  title,
  description,
  techStack,
}: ProjectDeepDiveProps) {
  const [open, setOpen] = useState(false)
  const [content, setContent] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loaded, setLoaded] = useState(false)
  const prefersReducedMotion = useReducedMotion()

  async function loadDeepDive() {
    if (loaded || loading) return
    setLoading(true)
    setError(null)
    setContent("")
    try {
      const res = await fetch("/api/project-deepdive", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectSlug: slug,
          projectTitle: title,
          projectDescription: description,
          techStack,
        }),
      })
      if (!res.ok || !res.body) throw new Error("request failed")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setContent(acc)
      }
      if (!acc.trim()) throw new Error("empty response")
      setLoaded(true)
    } catch {
      setError("Could not load details.")
    } finally {
      setLoading(false)
    }
  }

  function toggle() {
    const next = !open
    setOpen(next)
    if (next && !loaded) void loadDeepDive()
  }

  return (
    <div className="mt-12 border-t border-border pt-8">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="inline-flex items-center gap-2 text-sm font-medium text-foreground transition-colors hover:text-primary"
      >
        <Terminal className="size-4" />
        Technical Deep Dive
        <ChevronDown
          className={`size-4 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="pt-6">
              <DeepDiveContent
                content={content}
                loading={loading}
                error={error}
                onRetry={loadDeepDive}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
