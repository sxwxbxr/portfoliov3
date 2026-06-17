"use client"

import { useState } from "react"
import { ChevronDown, X } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"

type SkillDetail = { description: string; relatedProjects: string[] }

interface SkillPopoverProps {
  skill: { category: string; name: string; detail: string; level: string }
  isFirst: boolean
}

const FALLBACK: SkillDetail = {
  description: "Used in various projects — see the Projects page for details.",
  relatedProjects: [],
}

// Session cache so re-opening a skill never re-hits the API.
const cache = new Map<string, SkillDetail>()

export function SkillPopover({ skill, isFirst }: SkillPopoverProps) {
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
    <div
      className={`flex flex-col md:flex-row md:items-baseline md:justify-between gap-1 md:gap-6 py-4 ${
        !isFirst ? "border-t border-border" : ""
      }`}
    >
      <div className="md:flex-1">
        <Popover open={open} onOpenChange={handleOpenChange}>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="group inline-flex items-center gap-1.5 text-left font-semibold transition-colors hover:text-primary focus-visible:outline-none focus-visible:text-primary"
            >
              {skill.name}
              <ChevronDown
                className={`size-3.5 text-muted-foreground transition-transform ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-80" data-lenis-prevent>
            <div className="flex items-start justify-between gap-2">
              <p className="text-sm font-semibold">{skill.name}</p>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="-mr-1 -mt-1 rounded p-1 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            </div>

            {loading && !detail ? (
              <div className="mt-2 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-4/5" />
              </div>
            ) : (
              <>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {detail?.description ?? FALLBACK.description}
                </p>
                {detail?.relatedProjects && detail.relatedProjects.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {detail.relatedProjects.map((project) => (
                      <Badge key={project} variant="secondary">
                        {project}
                      </Badge>
                    ))}
                  </div>
                )}
              </>
            )}
          </PopoverContent>
        </Popover>

        {skill.detail && (
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {skill.detail}
          </p>
        )}
      </div>

      {skill.level && (
        <span className="shrink-0 font-mono text-xs text-muted-foreground md:text-right">
          {skill.level}
        </span>
      )}
    </div>
  )
}
