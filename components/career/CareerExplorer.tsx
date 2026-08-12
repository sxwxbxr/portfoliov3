"use client"

import { useCallback, useRef, useState } from "react"
import { motion, useReducedMotion } from "framer-motion"
import { CareerTimeline } from "./CareerTimeline"
import type { CareerEntry, CareerTimeline as Timeline } from "@/lib/career"
import { copy } from "@/lib/copy"

const EASE = [0.23, 1, 0.32, 1] as const

/**
 * The chart and the entries are one component because they share a selection.
 *
 * Hovering a bar highlights its entry and hovering an entry highlights its bar,
 * which is what turns the chart from an illustration into an index. Clicking a
 * bar moves focus to the entry rather than only scrolling to it, so the
 * keyboard path and the pointer path end in the same place.
 */
export function CareerExplorer({ timeline }: { timeline: Timeline }) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const cards = useRef(new Map<string, HTMLElement>())
  const reduce = useReducedMotion()

  const register = useCallback((id: string, el: HTMLElement | null) => {
    if (el) cards.current.set(id, el)
    else cards.current.delete(id)
  }, [])

  const select = useCallback(
    (id: string) => {
      const el = cards.current.get(id)
      if (!el) return
      el.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "center",
      })
      // Focus after the scroll is requested so assistive tech lands on the
      // entry rather than announcing the button that sent it there.
      el.focus({ preventScroll: true })
      setActiveId(id)
    },
    [reduce]
  )

  const work = timeline.entries.filter((e) => e.lane === "work")
  const education = timeline.entries.filter((e) => e.lane === "education")

  return (
    <div className="flex flex-col gap-12 md:gap-16">
      <CareerTimeline
        timeline={timeline}
        activeId={activeId}
        onActivate={setActiveId}
        onSelect={select}
      />

      {[
        { key: "work", label: copy.career.laneWork, rows: work },
        { key: "education", label: copy.career.laneEducation, rows: education },
      ]
        .filter((g) => g.rows.length > 0)
        .map((group) => (
          <section key={group.key} className="flex flex-col gap-5">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                {group.label}
              </h2>
              <span className="annotate">
                {String(group.rows.length).padStart(2, "0")}
              </span>
            </div>

            <div className="well flex flex-col gap-3 p-3 md:p-4">
              {group.rows.map((entry, i) => (
                <EntryCard
                  key={entry.id}
                  entry={entry}
                  index={i}
                  active={activeId === entry.id}
                  reduce={Boolean(reduce)}
                  register={register}
                  onActivate={setActiveId}
                />
              ))}
            </div>
          </section>
        ))}
    </div>
  )
}

function EntryCard({
  entry,
  index,
  active,
  reduce,
  register,
  onActivate,
}: {
  entry: CareerEntry
  index: number
  active: boolean
  reduce: boolean
  register: (id: string, el: HTMLElement | null) => void
  onActivate: (id: string | null) => void
}) {
  return (
    <motion.article
      ref={(el) => register(entry.id, el)}
      tabIndex={-1}
      onMouseEnter={() => onActivate(entry.id)}
      onMouseLeave={() => onActivate(null)}
      className={[
        "cast-sm flex scroll-mt-28 flex-col gap-4 p-5 md:p-6",
        "transition-shadow duration-150 focus:outline-none",
        active ? "ring-2 ring-signal" : "",
        entry.current ? "border-l-2 border-l-signal" : "",
        entry.future ? "opacity-80" : "",
      ].join(" ")}
      initial={reduce ? false : { opacity: 0, x: -4 }}
      whileInView={{ opacity: entry.future ? 0.8 : 1, x: 0 }}
      viewport={{ once: true, margin: "-56px" }}
      transition={{ duration: 0.32, ease: EASE, delay: reduce ? 0 : index * 0.028 }}
    >
      <header className="flex flex-col gap-1.5 md:flex-row md:items-baseline md:gap-6">
        <div className="flex items-center gap-2.5 md:flex-1">
          {entry.current && (
            <span
              className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal-bright"
              aria-hidden="true"
            />
          )}
          <h3
            className={
              "font-display text-lg font-semibold tracking-tight " +
              (entry.current ? "text-signal" : "")
            }
          >
            {entry.title}
          </h3>
        </div>
        {entry.subtitle && (
          <p className="text-sm text-fg-muted md:flex-1">{entry.subtitle}</p>
        )}
        <span className="annotate md:text-right">
          {entry.period}
          {entry.future && ` · ${copy.career.planned}`}
        </span>
      </header>

      {entry.description && (
        <p className="measure text-sm leading-relaxed text-fg-muted">
          {entry.description}
        </p>
      )}

      {entry.bullets.length > 0 && (
        <ul className="flex flex-col gap-2">
          {entry.bullets.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-sm">
              <span className="mt-2 h-px w-3 shrink-0 bg-edge" aria-hidden="true" />
              <span className="leading-relaxed text-fg-muted">{item}</span>
            </li>
          ))}
        </ul>
      )}
    </motion.article>
  )
}
