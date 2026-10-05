"use client"

import { useEffect, useRef } from "react"
import { track } from "@/lib/demo/sigmoid"
import { sigmoidDemo } from "@/lib/demo/sigmoid-copy"

const t = sigmoidDemo.track

/** Counters driven by track(): the number follows the card's way through the window. */
export function TrackStats() {
  const numbers = useRef<(HTMLSpanElement | null)[]>([])
  const cards = useRef<(HTMLLIElement | null)[]>([])

  useEffect(() => {
    const controllers = cards.current.map((card, i) =>
      track(
        card,
        (p) => {
          const el = numbers.current[i]
          const stat = t.stats[i]
          // Ease out so the count settles instead of stopping abruptly.
          if (el && stat) el.textContent = Math.round(stat.value * (1 - (1 - p) ** 3)).toLocaleString("en")
        },
        { range: "entry 0% cover 50%" }
      )
    )
    return () => controllers.forEach((c) => c.cancel())
  }, [])

  return (
    <ul className="grid gap-3 md:grid-cols-3">
      {t.stats.map((s, i) => (
        <li
          key={s.unit}
          ref={(el) => {
            cards.current[i] = el
          }}
          className="cast flex flex-col gap-3 p-6 md:p-7"
        >
          <p className="font-mono text-4xl tracking-tight text-fg md:text-5xl">
            <span
              ref={(el) => {
                numbers.current[i] = el
              }}
            >
              {s.value.toLocaleString("en")}
            </span>{" "}
            <span className="text-base text-fg-muted">{s.unit}</span>
          </p>
          <p className="text-sm text-fg-muted">{s.label}</p>
        </li>
      ))}
    </ul>
  )
}
