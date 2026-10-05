"use client"

import { useEffect, useId, useState } from "react"
import { useTheme } from "next-themes"
import { derivativeDemoCopy } from "@/lib/demo/derivative-copy"
import { useDerivative, type Feed } from "./runtime"
import { Widget } from "./Widget"

const t = derivativeDemoCopy.widget
const STORAGE_KEY = "derivative-demo:last-seen"
const LANGS = [
  { id: "en", label: "English" },
  { id: "de", label: "Deutsch" },
  { id: "fr", label: "Français" },
  { id: "it", label: "Italiano" },
] as const

/** A made-up app header with the real widget in it, plus the knobs a developer would set. */
export function AppPreview({ feed }: { feed: Feed }) {
  const mod = useDerivative()
  const { resolvedTheme } = useTheme()
  const [lang, setLang] = useState<string>("en")
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [accent, setAccent] = useState("#2f5bea")
  const [round, setRound] = useState(0)
  const ids = { lang: useId(), theme: useId(), accent: useId() }

  useEffect(() => {
    if (resolvedTheme === "dark" || resolvedTheme === "light") setTheme(resolvedTheme)
  }, [resolvedTheme])

  const reset = () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // Storage blocked: the widget already treats every visit as the first.
    }
    setRound((r) => r + 1)
  }

  const field = "control w-full px-3 py-2 text-sm"

  return (
    <div className="flex flex-col gap-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <label htmlFor={ids.lang} className="flex flex-col gap-1.5">
          <span className="annotate">{t.language}</span>
          <select id={ids.lang} className={field} value={lang} onChange={(e) => setLang(e.target.value)}>
            {LANGS.map((l) => (
              <option key={l.id} value={l.id}>
                {l.label}
              </option>
            ))}
          </select>
        </label>
        <label htmlFor={ids.theme} className="flex flex-col gap-1.5">
          <span className="annotate">{t.theme}</span>
          <select
            id={ids.theme}
            className={field}
            value={theme}
            onChange={(e) => setTheme(e.target.value as "light" | "dark")}
          >
            <option value="light">{t.light}</option>
            <option value="dark">{t.dark}</option>
          </select>
        </label>
        <label htmlFor={ids.accent} className="flex flex-col gap-1.5">
          <span className="annotate">{t.accent}</span>
          <input
            id={ids.accent}
            type="color"
            className="control h-[38px] w-full cursor-pointer px-2 py-1"
            value={accent}
            onChange={(e) => setAccent(e.target.value)}
          />
        </label>
      </div>

      <div className="well overflow-visible p-1.5">
        <div
          className="dv-demo-app rounded-md"
          style={{ background: theme === "dark" ? "#121418" : "#f6f7f9", minHeight: 600 }}
        >
          <div
            className="flex items-center justify-between gap-4 px-5 py-3"
            style={{
              borderBottom: `1px solid ${theme === "dark" ? "#2a2d34" : "#e3e5ea"}`,
              color: theme === "dark" ? "#eceef2" : "#16181d",
            }}
          >
            <span className="font-semibold">Muster Ledger</span>
            {mod ? (
              <Widget
                key={round}
                feed={feed}
                attrs={{ lang, theme, "storage-key": STORAGE_KEY, href: "#playground", label: undefined }}
                className="contents"
              />
            ) : (
              <span className="annotate">{mod === false ? t.error : t.loading}</span>
            )}
          </div>
          <style>{`.dv-demo-app derivative-widget { --dv-accent: ${accent}; }`}</style>
          <p className="px-5 py-6 text-sm" style={{ color: theme === "dark" ? "#a3a9b5" : "#5c6370" }}>
            {t.hint}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="button" className="control px-4 py-2 text-sm" onClick={reset}>
          {t.reset}
        </button>
        <p className="annotate">{t.resetNote}</p>
      </div>
    </div>
  )
}
