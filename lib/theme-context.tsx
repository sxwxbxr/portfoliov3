"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Theme = "ide" | "classic"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("ide")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check subdomain
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname
      if (hostname.startsWith("classic.")) {
        setThemeState("classic")
      } else if (hostname.startsWith("ide.")) {
        setThemeState("ide")
      } else {
        // Check localStorage for preference
        const stored = localStorage.getItem("portfolio-theme") as Theme
        if (stored) {
          setThemeState(stored)
        }
      }
    }
  }, [])

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme)
    if (typeof window !== "undefined") {
      localStorage.setItem("portfolio-theme", newTheme)
    }
  }

  const toggleTheme = () => {
    const newTheme = theme === "ide" ? "classic" : "ide"
    setTheme(newTheme)
  }

  if (!mounted) {
    return null
  }

  return <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
