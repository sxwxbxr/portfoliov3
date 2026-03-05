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

    const parent = el.parentElement
    if (!parent) return

    const handleMouseMove = (e: MouseEvent) => {
      const rect = parent.getBoundingClientRect()
      el.style.setProperty("--spotlight-x", `${e.clientX - rect.left}px`)
      el.style.setProperty("--spotlight-y", `${e.clientY - rect.top}px`)
      el.style.opacity = "0.025"
    }

    const handleMouseLeave = () => {
      el.style.opacity = "0"
    }

    parent.addEventListener("mousemove", handleMouseMove, { passive: true })
    parent.addEventListener("mouseleave", handleMouseLeave)

    return () => {
      parent.removeEventListener("mousemove", handleMouseMove)
      parent.removeEventListener("mouseleave", handleMouseLeave)
    }
  }, [])

  return (
    <div
      ref={spotlightRef}
      className="hidden md:block"
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 1,
        pointerEvents: "none",
        opacity: 0,
        transition: "opacity 0.4s ease",
        background:
          "radial-gradient(250px circle at var(--spotlight-x, 50%) var(--spotlight-y, 50%), var(--primary) 0%, transparent 100%)",
        mixBlendMode: "normal",
      }}
      aria-hidden="true"
    />
  )
}
