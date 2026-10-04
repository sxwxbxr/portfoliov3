"use client"

import { useEffect, useState } from "react"
import { useReducedMotion } from "framer-motion"

const MINOR = 7

interface RulerProps {
  labels: readonly string[]
  /** Index the marker starts on and stays on when motion is off. */
  initial?: number
  /** Labels above the ticks ("top") or below them ("bottom"). */
  labelSide?: "top" | "bottom"
  /** ms between steps. */
  interval?: number
  className?: string
}

/**
 * A measuring strip across the full width: one labelled major tick per
 * entry, minor ticks between, and a white marker that steps from entry to
 * entry on a timer.
 *
 * Purely decorative, so it is hidden from assistive tech; the same
 * information is always stated in text elsewhere on the page. Cells have a
 * minimum width, so on narrow screens the strip is clipped at the edges
 * rather than letting labels collide.
 */
export function Ruler({
  labels,
  initial = 0,
  labelSide = "bottom",
  interval = 2400,
  className = "",
}: RulerProps) {
  const reduce = useReducedMotion()
  const [index, setIndex] = useState(initial)

  useEffect(() => {
    if (reduce || labels.length < 2) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % labels.length)
    }, interval)
    return () => window.clearInterval(id)
  }, [reduce, labels.length, interval])

  return (
    <div className={"ruler " + className} aria-hidden="true">
      <div className="mx-auto flex w-full max-w-[72rem] justify-center px-5">
        {labels.map((label, i) => {
          const active = i === index
          return (
            <div
              key={`${label}-${i}`}
              className={
                "flex min-w-[5.5rem] flex-1 shrink-0 gap-2 " +
                (labelSide === "top" ? "flex-col" : "flex-col-reverse")
              }
            >
              <div className="flex h-6 items-center justify-center">
                <span
                  className={
                    "whitespace-nowrap rounded-full px-2 py-0.5 text-[0.6875rem] tabular transition-colors duration-500 " +
                    (active ? "bg-signal text-signal-fg" : "text-fg-subtle")
                  }
                >
                  {label}
                </span>
              </div>
              <div
                className={
                  "flex h-4 justify-between " +
                  (labelSide === "top" ? "items-start" : "items-end")
                }
              >
                {Array.from({ length: MINOR }).map((_, t) => (
                  <div
                    key={t}
                    className={
                      "ruler-tick " +
                      (t === Math.floor(MINOR / 2)
                        ? "h-4 " + (active ? "bg-signal" : "ruler-tick-major")
                        : "h-2")
                    }
                  />
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
