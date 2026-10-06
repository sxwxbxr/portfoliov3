"use client"

import { useId, useMemo, useState } from "react"
import Link from "next/link"
import { siteCopy } from "@/lib/physio/copy/site"
import { useRecentToolSlugs } from "@/lib/physio/recent-tools"
import {
  PHYSIO_TOOL_CATEGORIES,
  TOOLS_FILTER_MIN,
  compareTools,
  isUsable,
  toolMatchesQuery,
  type PhysioTool,
  type ToolCategoryKey,
} from "@/lib/physio/tools"
import { physioPath } from "@/lib/physio/urls"
import { ToolCard } from "./ToolCard"
import { ToolIcon } from "./ToolIcon"

const c = siteCopy.tools
const btn = "control inline-flex min-h-11 items-center justify-center px-5 py-2.5 text-sm"

type Filter = "all" | ToolCategoryKey

/**
 * The /tools list. Below TOOLS_FILTER_MIN tools there is nothing to search yet, so the
 * page is just the grouped cards and the "Dein Tool fehlt?" card next to them. From that
 * size on, a search field and category chips appear above the groups, and the card
 * moves to a band under them. `newSlugs` is computed on the server (date based).
 */
export function ToolsHub({ tools, newSlugs }: { tools: PhysioTool[]; newSlugs: string[] }) {
  const searchId = useId()
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const recentSlugs = useRecentToolSlugs()
  const controls = tools.length >= TOOLS_FILTER_MIN

  const searched = useMemo(() => tools.filter((t) => toolMatchesQuery(t, query)), [tools, query])
  const shown = useMemo(
    () => searched.filter((t) => filter === "all" || t.category === filter).sort(compareTools),
    [searched, filter],
  )

  const groups = PHYSIO_TOOL_CATEGORIES.map((cat) => ({ cat, items: shown.filter((t) => t.category === cat.key) })).filter(
    (g) => g.items.length > 0,
  )
  const chips = PHYSIO_TOOL_CATEGORIES.map((cat) => ({
    cat,
    count: searched.filter((t) => t.category === cat.key).length,
    total: tools.filter((t) => t.category === cat.key).length,
  })).filter((x) => x.total > 0)

  const isNew = (t: PhysioTool) => newSlugs.includes(t.slug)
  const recent =
    controls && !query.trim() && filter === "all"
      ? recentSlugs.map((s) => tools.find((t) => t.slug === s)).filter((t): t is PhysioTool => !!t && isUsable(t))
      : []
  const filtering = !!query.trim() || filter !== "all"

  const reset = () => {
    setQuery("")
    setFilter("all")
  }

  const missing = (band: boolean) => (
    <aside
      className={
        "flex min-w-0 flex-col gap-3 rounded-[var(--radius-card)] border border-dashed border-edge-mid p-5 md:p-6 " +
        (band ? "md:flex-row md:items-center md:justify-between md:gap-8" : "h-full")
      }
    >
      <div className="flex min-w-0 flex-col gap-2">
        {band ? <h2 className="text-xl">{c.missing.title}</h2> : <h3 className="text-xl">{c.missing.title}</h3>}
        <p className="measure leading-relaxed text-fg-muted">{c.missing.text}</p>
      </div>
      <Link href={physioPath("/vorschlaege")} className={`${btn} ${band ? "shrink-0" : "mt-auto self-start"}`}>
        {c.missing.cta}
      </Link>
    </aside>
  )

  return (
    <div className="flex flex-col gap-10 md:gap-12">
      {controls && (
        <div className="flex flex-col gap-4">
          <div className="relative max-w-xl">
            <label htmlFor={searchId} className="sr-only">
              {c.search.label}
            </label>
            <input
              id={searchId}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={c.search.placeholder}
              autoComplete="off"
              className="field min-h-12 w-full px-4 text-base [&::-webkit-search-cancel-button]:appearance-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={c.search.clear}
                className="absolute top-1/2 right-1 grid size-11 -translate-y-1/2 place-items-center rounded-lg text-fg-muted hover:text-fg"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                </svg>
              </button>
            )}
          </div>

          <div role="group" aria-label={c.filters.label} className="flex flex-wrap gap-2">
            <Chip pressed={filter === "all"} onClick={() => setFilter("all")} count={searched.length}>
              {c.filters.all}
            </Chip>
            {chips.map(({ cat, count }) => (
              <Chip key={cat.key} pressed={filter === cat.key} onClick={() => setFilter(cat.key)} count={count}>
                {cat.label}
              </Chip>
            ))}
          </div>

          <p role="status" aria-live="polite" className="sr-only">
            {filtering ? c.results(shown.length) : ""}
          </p>
        </div>
      )}

      {recent.length > 0 && (
        <section aria-labelledby="recent-tools" className="flex flex-col gap-3">
          <h2 id="recent-tools" className="annotate">
            {c.recent.heading}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {recent.map((t) => (
              <li key={t.slug}>
                <Link href={physioPath(t.path)} className="control inline-flex min-h-11 items-center gap-2.5 px-4 text-sm">
                  <ToolIcon name={t.icon} size={18} className="text-signal" />
                  {t.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {groups.map(({ cat, items }, gi) => {
        const last = gi === groups.length - 1
        return (
          <section key={cat.key} aria-labelledby={`cat-${cat.key}`} className="flex flex-col gap-5">
            <header className="flex flex-col gap-1">
              <h2 id={`cat-${cat.key}`} className="headline">
                {cat.label}
              </h2>
              <p className="text-fg-muted">{cat.description}</p>
            </header>
            <ul className={`grid grid-cols-1 gap-5 md:grid-cols-2 ${controls ? "lg:grid-cols-3" : ""}`}>
              {items.map((t) => (
                <li key={t.slug} className="min-w-0">
                  <ToolCard tool={t} isNew={isNew(t)} />
                </li>
              ))}
              {!controls && last && <li className="min-w-0">{missing(false)}</li>}
            </ul>
          </section>
        )
      })}

      {groups.length === 0 && (
        <section
          aria-labelledby="no-tools"
          className="flex flex-col items-start gap-4 rounded-[var(--radius-card)] border border-dashed border-edge-mid p-6 md:p-8"
        >
          <h2 id="no-tools" className="headline">
            {c.empty.title}
          </h2>
          <p className="measure leading-relaxed text-fg-muted">
            {query.trim() ? c.empty.text(query.trim()) : c.empty.textFiltered}
          </p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href={physioPath("/vorschlaege")} className={`${btn} control-primary`}>
              {c.empty.suggest}
            </Link>
            <button type="button" onClick={reset} className={btn}>
              {c.empty.reset}
            </button>
          </div>
        </section>
      )}

      {controls && groups.length > 0 && missing(true)}
    </div>
  )
}

function Chip({
  pressed,
  onClick,
  count,
  children,
}: {
  pressed: boolean
  onClick: () => void
  count: number
  children: string
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className="control inline-flex min-h-11 items-center gap-2 px-4 text-sm aria-pressed:border-signal aria-pressed:text-signal"
    >
      {children}
      <span className="tabular text-fg-muted">{count}</span>
    </button>
  )
}
