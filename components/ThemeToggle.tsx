"use client"

import * as React from "react"
import { Monitor, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

const OPTIONS = [
  { value: "system", label: "System", Icon: Monitor },
  { value: "light", label: "Hell", Icon: Sun },
  { value: "dark", label: "Dunkel", Icon: Moon },
] as const

/**
 * Three-state theme control: System / Light / Dark.
 *
 * The previous version was a two-state button that never offered System, so a
 * visitor whose OS is set to dark could only get there by clicking — and it
 * returned null until mounted, which shifted the layout on hydration. Here the
 * track is always rendered at full size and only the *selection* waits for
 * mount, so nothing moves.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => setMounted(true), [])

  return (
    <div
      role="radiogroup"
      aria-label="Farbschema"
      className={cn("well-sm inline-flex items-center gap-0.5 p-1", className)}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = mounted && theme === value
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            title={label}
            onClick={() => setTheme(value)}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-md",
              "transition-[background-color,box-shadow,color] duration-150",
              active
                ? "cast-sm text-signal"
                : "text-fg-subtle hover:text-fg"
            )}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
          </button>
        )
      })}
    </div>
  )
}

export default ThemeToggle
