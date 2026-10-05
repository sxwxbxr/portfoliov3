"use client"

import { useEffect, useRef } from "react"
import { parallax, scrub } from "@/lib/demo/sigmoid"

const LAYERS = [
  { distance: 20, className: "left-[8%] top-[18%] h-40 w-40 border border-edge-mid" },
  { distance: 60, className: "left-[38%] top-[34%] h-28 w-28 bg-plate-hi" },
  { distance: 120, className: "left-[64%] top-[22%] h-16 w-16 bg-fg" },
]

/** Three parallax layers and a ring that turns with the page scroll. */
export function ParallaxScene() {
  const layers = useRef<(HTMLDivElement | null)[]>([])
  const ring = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const controllers = [
      ...layers.current.map((el, i) => parallax(el, { distance: LAYERS[i]?.distance })),
      scrub(ring.current, [{ transform: "rotate(0deg)" }, { transform: "rotate(360deg)" }]),
    ]
    return () => controllers.forEach((c) => c.cancel())
  }, [])

  return (
    <div className="cast relative h-[26rem] overflow-hidden md:h-[32rem]" aria-hidden="true">
      {LAYERS.map((l, i) => (
        <div
          key={l.distance}
          ref={(el) => {
            layers.current[i] = el
          }}
          className={`absolute rounded-md ${l.className}`}
        >
          <span className="annotate absolute -bottom-6 left-0 whitespace-nowrap">{l.distance}px</span>
        </div>
      ))}
      <div
        ref={ring}
        className="absolute right-[8%] bottom-[12%] h-24 w-24 rounded-full border-2 border-dashed border-fg-muted"
      />
    </div>
  )
}
