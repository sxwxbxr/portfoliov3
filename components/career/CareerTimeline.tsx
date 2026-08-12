"use client"

import { useRef } from "react"
import { motion, useInView, useReducedMotion } from "framer-motion"
import type { CareerEntry, CareerTimeline as Timeline } from "@/lib/career"
import { copy } from "@/lib/copy"

const EASE = [0.23, 1, 0.32, 1] as const

interface Props {
  timeline: Timeline
  activeId: string | null
  onActivate: (id: string | null) => void
  onSelect: (id: string) => void
}

const LANES: { key: "work" | "education"; label: string }[] = [
  { key: "work", label: copy.career.laneWork },
  { key: "education", label: copy.career.laneEducation },
]

/**
 * Two-lane career chart.
 *
 * Lanes rather than one line, because work and education genuinely overlap
 * here — an EFZ is a job and a school at once. Flattening them would hide the
 * only thing this chart exists to show.
 *
 * Bars are revealed with clip-path, never scaleX: they carry a text label, and
 * scaling a bar horizontally squashes and stretches its own contents for the
 * length of the animation.
 *
 * The bars are buttons, not decoration. Each one moves focus to its entry
 * below, so the chart is a way to navigate the page rather than a picture of
 * it — which is also what keeps it usable without a pointer.
 */
export function CareerTimeline({ timeline, activeId, onActivate, onSelect }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-64px" })
  const reduce = useReducedMotion()

  if (timeline.entries.length === 0) return null

  const { years, todayAt } = timeline
  const pct = (v: number) => `${(v * 100).toFixed(3)}%`

  return (
    <div ref={ref} className="flex flex-col gap-3">
      {/* The axis is wider than a phone, so it scrolls in its own container
          rather than compressing ten years into 320px. */}
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[44rem]">
          <div
            className="well relative flex flex-col gap-3 p-4 md:p-5"
            role="group"
            aria-label={copy.career.timelineLabel(timeline.firstYear, timeline.lastYear)}
          >
            {/* Year grid. Decorative — the readable dates live on the bars
                and in the cards, so this is hidden from assistive tech. */}
            <div className="pointer-events-none absolute inset-x-4 inset-y-0 md:inset-x-5" aria-hidden="true">
              {years.map((year, i) => (
                <span
                  key={year}
                  className="absolute top-0 bottom-0 w-px bg-edge-soft/60"
                  style={{ left: pct(i / (years.length - 1)) }}
                />
              ))}
            </div>

            {/* Today. The one place the accent appears on the axis itself. */}
            {todayAt !== null && (
              <motion.div
                className="pointer-events-none absolute inset-y-0 z-10 w-px bg-signal"
                style={{ left: `calc(1rem + ${(todayAt * 100).toFixed(3)}% * 0.999)` }}
                initial={reduce ? false : { opacity: 0, scaleY: 0 }}
                animate={inView || reduce ? { opacity: 0.9, scaleY: 1 } : {}}
                transition={{ duration: 0.4, ease: EASE, delay: reduce ? 0 : 0.5 }}
                aria-hidden="true"
              >
                <span className="absolute -top-1 left-1/2 h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-signal" />
              </motion.div>
            )}

            {LANES.map((lane) => {
              const rows = timeline.entries.filter((e) => e.lane === lane.key)
              if (rows.length === 0) return null
              return (
                <div key={lane.key} className="relative flex flex-col gap-1.5">
                  <span className="annotate">{lane.label}</span>
                  <div className="relative h-9">
                    {rows.map((entry, i) => (
                      <Bar
                        key={entry.id}
                        entry={entry}
                        index={i}
                        inView={inView}
                        reduce={Boolean(reduce)}
                        active={activeId === entry.id}
                        dimmed={activeId !== null && activeId !== entry.id}
                        onActivate={onActivate}
                        onSelect={onSelect}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Axis labels sit outside the well so the channel stays clean. */}
          <div className="relative mt-2 h-4 px-4 md:px-5" aria-hidden="true">
            {years.map((year, i) => (
              <span
                key={year}
                className="annotate absolute -translate-x-1/2 tabular"
                style={{ left: pct(i / (years.length - 1)) }}
              >
                {year}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function Bar({
  entry,
  index,
  inView,
  reduce,
  active,
  dimmed,
  onActivate,
  onSelect,
}: {
  entry: CareerEntry
  index: number
  inView: boolean
  reduce: boolean
  active: boolean
  dimmed: boolean
  onActivate: (id: string | null) => void
  onSelect: (id: string) => void
}) {
  const left = `${(entry.from * 100).toFixed(3)}%`
  const width = `${((entry.to - entry.from) * 100).toFixed(3)}%`

  return (
    <motion.button
      type="button"
      onMouseEnter={() => onActivate(entry.id)}
      onMouseLeave={() => onActivate(null)}
      onFocus={() => onActivate(entry.id)}
      onBlur={() => onActivate(null)}
      onClick={() => onSelect(entry.id)}
      aria-label={copy.career.barLabel(entry.title, entry.subtitle, entry.period)}
      className={[
        "absolute inset-y-0 flex items-center overflow-hidden rounded-md px-2.5 text-left",
        "transition-[opacity,background-color] duration-150",
        entry.future ? "well-sm border border-dashed border-edge" : "cast-sm",
        active ? "ring-2 ring-signal" : "",
        dimmed ? "opacity-45" : "opacity-100",
      ].join(" ")}
      style={{ left, width }}
      initial={reduce ? false : { clipPath: "inset(0 100% 0 0)" }}
      animate={inView || reduce ? { clipPath: "inset(0 0% 0 0)" } : {}}
      transition={{
        duration: 0.5,
        ease: EASE,
        delay: reduce ? 0 : 0.12 + index * 0.07,
      }}
    >
      <span
        className={[
          "truncate text-xs font-medium",
          entry.current ? "text-signal" : entry.future ? "text-fg-subtle" : "text-fg-muted",
        ].join(" ")}
      >
        {entry.title}
      </span>
    </motion.button>
  )
}
