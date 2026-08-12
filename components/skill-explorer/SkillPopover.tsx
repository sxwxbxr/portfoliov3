"use client"

import { useState } from "react"
import { ChevronDown, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { copy } from "@/lib/copy"

type SkillDetail = { description: string; relatedProjects: string[] }

interface SkillPopoverProps {
  skill: { category: string; name: string; detail: string; level: string }
  /**
   * Retained for API compatibility with the call site. The seats now sit in a
   * grid inside a sunken tray, so there is no leading divider to suppress.
   */
  isFirst: boolean
}

const FALLBACK: SkillDetail = {
  description: copy.about.skillDetailFallback,
  relatedProjects: [],
}

// Session cache so re-opening a skill never re-hits the API.
const cache = new Map<string, SkillDetail>()

export function SkillPopover({ skill }: SkillPopoverProps) {
  const [open, setOpen] = useState(false)
  const [detail, setDetail] = useState<SkillDetail | null>(
    () => cache.get(skill.name) ?? null
  )
  const [loading, setLoading] = useState(false)

  async function load() {
    if (detail || loading) return
    setLoading(true)
    try {
      const res = await fetch("/api/skill-detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ skill: skill.name }),
      })
      const data = res.ok ? await res.json() : null
      const result: SkillDetail =
        data && typeof data.description === "string"
          ? {
              description: data.description,
              relatedProjects: Array.isArray(data.relatedProjects)
                ? data.relatedProjects
                : [],
            }
          : FALLBACK
      cache.set(skill.name, result)
      setDetail(result)
    } catch {
      setDetail(FALLBACK)
    } finally {
      setLoading(false)
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next)
    if (next) void load()
  }

  return (
    // Keep this seat in sync with the non-AI branch in app/skills/page.tsx.
    <li className="cast-sm flex flex-col gap-1.5 px-4 py-3.5">
      <div className="flex items-baseline justify-between gap-3">
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="group inline-flex items-center gap-1.5 text-left font-semibold transition-colors duration-150 hover:text-signal"
            >
              {skill.name}
              <ChevronDown
                className={
                  "h-3.5 w-3.5 shrink-0 text-fg-subtle transition-transform duration-200 motion-reduce:transition-none " +
                  (open ? "rotate-180" : "")
                }
                aria-hidden="true"
              />
            </button>
          </PopoverTrigger>

          {/* components/ui/popover.tsx now carries `.cast` itself, so the
              content element IS the plate — no neutralising wrapper needed. */}
          <PopoverContent
            align="start"
            className="rim flex w-80 flex-col gap-3 p-5"
            data-lenis-prevent
          >
              <div className="flex items-start justify-between gap-3">
                <p className="font-display text-sm font-semibold tracking-tight">
                  {skill.name}
                </p>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label={copy.common.close}
                  className="-mr-1 -mt-1 rounded p-1 text-fg-subtle transition-colors duration-150 hover:text-fg"
                >
                  <X className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>

              {loading && !detail ? (
                // Bars milled into the plate, matching DeepDiveContent and the
                // contact-form analysis. ui/skeleton's `bg-accent animate-pulse`
                // is a utility-layer fill that paints over the recess.
                <div role="status" className="flex flex-col gap-2">
                  <span className="sr-only">{copy.about.skillDetailLoading}</span>
                  <div className="well-sm h-3 w-full" aria-hidden="true" />
                  <div className="well-sm h-3 w-4/5" aria-hidden="true" />
                </div>
              ) : (
                <>
                  <p className="text-sm leading-relaxed text-fg-muted">
                    {detail?.description ?? FALLBACK.description}
                  </p>
                  {detail?.relatedProjects && detail.relatedProjects.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {detail.relatedProjects.map((project) => (
                        <span
                          key={project}
                          className="well-sm px-2.5 py-1 font-mono text-xs text-fg-muted"
                        >
                          {project}
                        </span>
                      ))}
                    </div>
                  )}
                </>
              )}
          </PopoverContent>
        </Popover>

        {skill.level && (
          <span className="annotate shrink-0">{skill.level}</span>
        )}
      </div>

      {skill.detail && (
        <p className="text-sm leading-relaxed text-fg-muted">{skill.detail}</p>
      )}
    </li>
  )
}
