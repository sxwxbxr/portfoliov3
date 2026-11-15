"use client"

import { useEffect, useState } from "react"
import { useScroll, useSpring, useVelocity } from "framer-motion"

/**
 * Whether the visitor asked for reduced motion. Read after mount, so the
 * server markup and the first client render agree; until then the
 * stylesheets' own reduced-motion rules hold things still.
 */
export function useStill() {
  const [still, setStill] = useState(false)
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)")
    const sync = () => setStill(query.matches)
    sync()
    query.addEventListener("change", sync)
    return () => query.removeEventListener("change", sync)
  }, [])
  return still
}

/**
 * How fast the page is scrolling, in px/s, eased so it swells and settles
 * instead of jumping.
 */
export function useScrollSpeed() {
  const { scrollY } = useScroll()
  return useSpring(useVelocity(scrollY), { stiffness: 120, damping: 26, mass: 0.6 })
}
