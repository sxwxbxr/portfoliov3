"use client"

import { useEffect, useState } from "react"

export function ScrollProgress() {
  const [scrollProgress, setScrollProgress] = useState(0)
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )

    const updateScrollProgress = () => {
      const currentProgress = window.scrollY
      const scrollHeight = document.body.scrollHeight - window.innerHeight

      if (scrollHeight) {
        setScrollProgress((currentProgress / scrollHeight) * 100)
      }
    }

    window.addEventListener("scroll", updateScrollProgress, { passive: true })
    return () => window.removeEventListener("scroll", updateScrollProgress)
  }, [])

  // Don't render if user prefers reduced motion, or scroll is negligible
  if (reducedMotion || scrollProgress < 1) return null

  return (
    // `.scroll-progress` is the hook the print stylesheet has always aimed at
    // and this component never set; `.no-print` is what the current sheet
    // actually keys on. Both are here so neither drifts again.
    <div
      className="scroll-progress no-print pointer-events-none fixed inset-x-0 top-0 z-[60] h-1"
      aria-hidden="true"
    >
      <div className="well-sm h-full w-full rounded-none">
        {/* scaleX, not width: a width transition relayouts every frame. */}
        <div
          className="h-full w-full origin-left bg-signal transition-transform duration-150 ease-out"
          style={{ transform: `scaleX(${Math.min(scrollProgress, 100) / 100})` }}
        />
      </div>
    </div>
  )
}
