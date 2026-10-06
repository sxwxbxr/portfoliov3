import { useEffect, useState } from "react"

/**
 * "Zuletzt verwendet" for /tools: the slugs of the last tools a visitor opened, kept in
 * localStorage on this device only (no account, no server). Every access is wrapped:
 * storage can be blocked or full, and the page has to render the same without it.
 *
 * A tool page records its use with `<ToolFrame recordUse>` (components/physio/ToolFrame.tsx)
 * or by calling `recordToolUse(slug)` itself in an effect.
 */
const KEY = "physio:recent-tools"
const MAX = 4

function read(): string[] {
  try {
    const raw = window.localStorage.getItem(KEY)
    const data: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(data) ? data.filter((s): s is string => typeof s === "string").slice(0, MAX) : []
  } catch {
    return []
  }
}

/** Client only. Moves the slug to the front, keeps the last few. */
export function recordToolUse(slug: string): void {
  try {
    const next = [slug, ...read().filter((s) => s !== slug)].slice(0, MAX)
    window.localStorage.setItem(KEY, JSON.stringify(next))
  } catch {
    /* storage unavailable: nothing to remember */
  }
}

/** Slugs, newest first. Empty on the server and on the first client render, so hydration matches. */
export function useRecentToolSlugs(): string[] {
  const [slugs, setSlugs] = useState<string[]>([])
  useEffect(() => setSlugs(read()), [])
  return slugs
}
