"use client"

import { useEffect, useRef } from "react"
import type { ReactNode } from "react"
// Lenis smooth scroll styles — imported at module level for Next.js bundling
import "lenis/dist/lenis.css"

interface SmoothScrollProps {
  children: ReactNode
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const lenisRef = useRef<InstanceType<typeof import("lenis").default> | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches

    if (prefersReducedMotion) return

    let lenis: InstanceType<typeof import("lenis").default> | null = null

    const init = async () => {
      const Lenis = (await import("lenis")).default

      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      })

      lenisRef.current = lenis

      function raf(time: number) {
        lenis?.raf(time)
        rafRef.current = requestAnimationFrame(raf)
      }

      rafRef.current = requestAnimationFrame(raf)
    }

    init()

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
      lenis?.destroy()
      lenisRef.current = null
    }
  }, [])

  return <>{children}</>
}
