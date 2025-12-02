"use client"

import { useTheme } from "@/lib/theme-context"
import { Button } from "@/components/ui/button"
import { Code2, Sparkles } from "lucide-react"

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <Button variant="ghost" size="sm" onClick={toggleTheme} className="gap-2">
      {theme === "ide" ? (
        <>
          <Sparkles className="h-4 w-4" />
          <span className="hidden sm:inline">Classic</span>
        </>
      ) : (
        <>
          <Code2 className="h-4 w-4" />
          <span className="hidden sm:inline">IDE</span>
        </>
      )}
    </Button>
  )
}
