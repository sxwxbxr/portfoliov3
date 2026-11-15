"use client"

import { useRef } from "react"
import { useScroll, useTransform } from "framer-motion"
import InkScene from "./InkScene"
import { useScrollSpeed, useStill } from "./motion"

/**
 * The drawn night scene again, behind the footer, so the page ends the way
 * the home page begins. It advances as the footer scrolls into the window.
 */
export function FinaleScene({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] })
  // A footer is taller than a window, so the scene moves less than on the
  // home stage: the smoke stays under the name instead of climbing past it.
  const progress = useTransform(scrollYProgress, (v) => v * 0.35)
  const speed = useScrollSpeed()
  const still = useStill()

  return (
    <div ref={ref} className={className} aria-hidden="true">
      <InkScene progress={progress} velocity={speed} still={still} />
    </div>
  )
}
