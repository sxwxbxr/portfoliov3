"use client"

import { useEffect, useRef } from "react"

export function CursorSpotlight() {
  const spotlightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = spotlightRef.current
    if (!el) return

    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches
    if (prefersReducedMotion) {
      el.style.display = "none"
      return
    }

    // Hide on touch devices
    const isTouchDevice =
      "ontouchstart" in window || navigator.maxTouchPoints > 0
    if (isTouchDevice) {
      el.style.display = "none"
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      el.style.setProperty("--spotlight-x", `${e.clientX}px`)
      el.style.setProperty("--spotlight-y", `${e.clientY}px`)
      el.style.opacity = "1"
    }

    const handleMouseLeave = () => {
      el.style.opacity = "0"
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    document.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  return (
    <div
      ref={spotlightRef}
      className="hidden md:block"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        opacity: 0,
        transition: "opacity 0.3s ease",
        background:
          "radial-gradient(400px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), var(--primary) 0%, transparent 100%)",
        mixBlendMode: "normal",
        // Very low opacity so it's subtle
      }}
      aria-hidden="true"
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "inherit",
          opacity: 0.06,
        }}
      />
    </div>
  )
}
