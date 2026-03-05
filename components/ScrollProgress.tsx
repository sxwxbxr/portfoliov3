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
    <div className="fixed top-0 left-0 w-full h-[2px] z-[60] pointer-events-none">
      <div
        className="h-full bg-primary/80 transition-[width] duration-150 ease-out"
        style={{ width: `${scrollProgress}%` }}
      />
    </div>
  )
}
