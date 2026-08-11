"use client"

import { useId, useState } from "react"
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
  const panelId = useId()

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
      setError("Details konnten nicht geladen werden.")
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
    // The surrounding section already spaces its children; the old rule-and-
    // margin separator was doing the same job twice.
    <div className="flex flex-col gap-4">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-controls={panelId}
        className="control inline-flex items-center gap-2.5 self-start px-4 py-2.5 text-sm font-medium"
      >
        <Terminal className="h-4 w-4 text-signal" aria-hidden="true" />
        Technical Deep Dive
        <ChevronDown
          className={
            "h-4 w-4 transition-transform duration-200 motion-reduce:transition-none " +
            (open ? "rotate-180" : "")
          }
          aria-hidden="true"
        />
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            animate={prefersReducedMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            // The collapse needs overflow-hidden, which would otherwise crop
            // the plate's cast shadow flat. The gutter gives the shadow room
            // and the negative margin keeps the plate aligned with the column.
            className="-mx-4 w-[calc(100%+2rem)] overflow-hidden"
          >
            <div className="px-4 pb-4">
              <div className="cast rim flex flex-col gap-4 p-6 md:p-8">
                <span className="annotate">KI-generierte Analyse</span>
                <DeepDiveContent
                  content={content}
                  loading={loading}
                  error={error}
                  onRetry={loadDeepDive}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
