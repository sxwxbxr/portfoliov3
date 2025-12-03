"use client"

import { useMemo } from "react"
import { useTheme } from "next-themes"

export function EtherealShadows() {
  const { resolvedTheme } = useTheme()

  const palette = useMemo(() => {
    if (resolvedTheme === "dark") {
      return ["oklch(0.68 0.17 280)", "oklch(0.70 0.15 210)", "oklch(0.62 0.18 140)"]
    }

    return ["oklch(0.82 0.12 260)", "oklch(0.85 0.10 210)", "oklch(0.88 0.08 160)"]
  }, [resolvedTheme])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <span
        className="ethereal-blob animate-ethereal-1 left-[-10%] top-[-5%] h-[28rem] w-[28rem]"
        style={{ background: `radial-gradient(circle at center, ${palette[0]} 0%, transparent 55%)` }}
      />
      <span
        className="ethereal-blob animate-ethereal-2 right-[-8%] top-[5%] h-[22rem] w-[22rem]"
        style={{ background: `radial-gradient(circle at center, ${palette[1]} 0%, transparent 60%)` }}
      />
      <span
        className="ethereal-blob animate-ethereal-3 bottom-[-12%] left-[15%] h-[26rem] w-[26rem]"
        style={{ background: `radial-gradient(circle at center, ${palette[2]} 0%, transparent 60%)` }}
      />
    </div>
  )
}
