"use client"

import { useMemo } from "react"
import { useTheme } from "next-themes"

export function EtherealShadows() {
  const { resolvedTheme } = useTheme()

  const palette = useMemo(() => {
    if (resolvedTheme === "dark") {
      return ["oklch(0.68 0.2 280)", "oklch(0.7 0.18 220)", "oklch(0.64 0.2 150)"]
    }

    return ["oklch(0.82 0.15 260)", "oklch(0.86 0.13 220)", "oklch(0.88 0.11 170)"]
  }, [resolvedTheme])

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
      <span
        className="ethereal-blob animate-ethereal-1 left-[-10%] top-[-5%] h-[28rem] w-[28rem]"
        style={{ background: `radial-gradient(circle at center, ${palette[0]} 15%, transparent 65%)` }}
      />
      <span
        className="ethereal-blob animate-ethereal-2 right-[-8%] top-[5%] h-[22rem] w-[22rem]"
        style={{ background: `radial-gradient(circle at center, ${palette[1]} 15%, transparent 70%)` }}
      />
      <span
        className="ethereal-blob animate-ethereal-3 bottom-[-12%] left-[15%] h-[26rem] w-[26rem]"
        style={{ background: `radial-gradient(circle at center, ${palette[2]} 15%, transparent 70%)` }}
      />
    </div>
  )
}
