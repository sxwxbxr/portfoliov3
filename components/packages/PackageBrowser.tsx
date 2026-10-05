"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import { Section } from "@/components/PageLayout"
import { PackageBadges } from "@/components/packages/Badges"
import { pkgPath } from "@/lib/packages/urls"
import { copy } from "@/lib/copy"
import type { Package } from "@/lib/packages/schema"

/** Only the fields the overview needs, so the client bundle stays small. */
export type PackageCardData = Pick<
  Package,
  "slug" | "name" | "tagline" | "description" | "tags" | "npm" | "status" | "license"
> & {
  /** Docs are rendered on this site. */
  hasDocs: boolean
  /** External docs link, used when `hasDocs` is false. */
  docsUrl?: string
  githubUrl?: string
  hasPricing: boolean
}

type Filters = { q: string; tag: string; status: string; license: string }

const EMPTY: Filters = { q: "", tag: "", status: "", license: "" }
const STATUSES = ["stable", "beta", "coming-soon"] as const
const LICENSES = ["MIT", "MIT + Pro", "commercial"] as const

const link = "relative z-10 text-sm text-fg-muted transition-colors duration-150 hover:text-fg"

function PackageCard({ pkg }: { pkg: PackageCardData }) {
  return (
    <article className="cast card-link relative flex flex-col gap-5 p-6 md:p-7">
      <PackageBadges pkg={pkg} />

      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg tracking-tight">
          {/* Stretched link: the whole card opens the detail page while
              the Docs, GitHub and Pricing links stay separate anchors. */}
          <Link href={pkgPath(`/${pkg.slug}`)} className="after:absolute after:inset-0 after:content-['']">
            {pkg.name}
          </Link>
        </h2>
        <p className="text-sm leading-relaxed text-fg-muted">{pkg.tagline}</p>
      </div>

      {pkg.tags.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {pkg.tags.map((tag) => (
            <li key={tag} className="tab text-xs text-fg-muted">
              {tag}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-2">
        {pkg.hasDocs ? (
          <Link href={pkgPath(`/${pkg.slug}/docs`)} className={link}>
            {copy.packages.docs}
          </Link>
        ) : (
          pkg.docsUrl && (
            <a href={pkg.docsUrl} target="_blank" rel="noopener noreferrer" className={link}>
              {copy.packages.docs}
            </a>
          )
        )}
        {pkg.githubUrl && (
          <a href={pkg.githubUrl} target="_blank" rel="noopener noreferrer" className={link}>
            {copy.packages.github}
          </a>
        )}
        {pkg.hasPricing && (
          <Link href={pkgPath(`/${pkg.slug}#pricing`)} className={link}>
            {copy.packages.pricing}
          </Link>
        )}
      </div>
    </article>
  )
}

/** Unfiltered grid. Also the Suspense fallback, so the HTML always lists every package. */
export function PackageGrid({ packages }: { packages: PackageCardData[] }) {
  return (
    <Section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {packages.map((pkg) => (
        <PackageCard key={pkg.slug} pkg={pkg} />
      ))}
    </Section>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`${active ? "control control-primary" : "control"} inline-flex items-center px-3 py-1.5 text-xs`}
    >
      {children}
    </button>
  )
}

function ChipGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (v: string) => void
}) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="annotate mr-1">{label}</span>
      <Chip active={!value} onClick={() => onChange("")}>
        {copy.packages.browser.all}
      </Chip>
      {options.map((o) => (
        <Chip key={o.value} active={value === o.value} onClick={() => onChange(o.value)}>
          {o.label}
        </Chip>
      ))}
    </div>
  )
}

/** Case-insensitive; every whitespace-separated term has to appear somewhere. */
function matches(pkg: PackageCardData, terms: string[]) {
  if (terms.length === 0) return true
  const hay = [pkg.name, pkg.tagline, pkg.description, ...pkg.tags, ...pkg.npm].join("\n").toLowerCase()
  return terms.every((t) => hay.includes(t))
}

export function PackageBrowser({ packages }: { packages: PackageCardData[] }) {
  const params = useSearchParams()
  const inputRef = useRef<HTMLInputElement>(null)

  const [filters, setFilters] = useState<Filters>(() => ({
    q: params.get("q") ?? "",
    tag: params.get("tag") ?? "",
    status: params.get("status") ?? "",
    license: params.get("license") ?? "",
  }))

  // Mirror the state into the URL. history.replaceState instead of
  // router.replace: no RSC request per keystroke, and the visible path stays
  // correct on the packages host, where middleware rewrites onto /packages.
  const update = useCallback(
    (patch: Partial<Filters>) => {
      const next = { ...filters, ...patch }
      setFilters(next)
      const sp = new URLSearchParams()
      for (const [k, v] of Object.entries(next)) if (v) sp.set(k, v)
      const qs = sp.toString()
      window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname)
    },
    [filters]
  )

  // "/" jumps to the search field unless the person is already typing somewhere.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "/" || e.metaKey || e.ctrlKey || e.altKey) return
      const el = e.target as HTMLElement | null
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return
      e.preventDefault()
      inputRef.current?.focus()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  // Tags sorted by how many packages carry them, ties alphabetical.
  const tags = useMemo(() => {
    const counts = new Map<string, number>()
    for (const p of packages) for (const t of p.tags) counts.set(t, (counts.get(t) ?? 0) + 1)
    return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([t]) => t)
  }, [packages])

  const statuses = useMemo(() => STATUSES.filter((s) => packages.some((p) => p.status === s)), [packages])
  const licenses = useMemo(() => LICENSES.filter((l) => packages.some((p) => p.license === l)), [packages])

  const visible = useMemo(() => {
    const terms = filters.q.toLowerCase().split(/\s+/).filter(Boolean)
    return packages.filter(
      (p) =>
        matches(p, terms) &&
        (!filters.tag || p.tags.includes(filters.tag)) &&
        (!filters.status || p.status === filters.status) &&
        (!filters.license || p.license === filters.license)
    )
  }, [packages, filters])

  const active = Object.values(filters).some(Boolean)
  const b = copy.packages.browser

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <div className="relative w-full sm:max-w-md">
          <label htmlFor="package-search" className="annotate mb-2 block">
            {b.searchLabel}
          </label>
          <input
            id="package-search"
            ref={inputRef}
            type="search"
            value={filters.q}
            onChange={(e) => update({ q: e.target.value })}
            placeholder={b.searchPlaceholder}
            aria-keyshortcuts="/"
            autoComplete="off"
            spellCheck={false}
            className="w-full rounded-md border border-edge-soft bg-transparent py-2.5 pr-10 pl-3 text-sm text-fg outline-none placeholder:text-fg-muted focus-visible:border-fg [&::-webkit-search-cancel-button]:hidden"
          />
          {filters.q && (
            <button
              type="button"
              aria-label={b.clear}
              onClick={() => {
                update({ q: "" })
                inputRef.current?.focus()
              }}
              className="absolute right-1 bottom-1 inline-flex h-8 w-8 items-center justify-center text-fg-muted transition-colors duration-150 hover:text-fg"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {tags.length > 0 && (
          <ChipGroup
            label={b.filterTag}
            value={filters.tag}
            options={tags.map((t) => ({ value: t, label: t }))}
            onChange={(tag) => update({ tag })}
          />
        )}
        <ChipGroup
          label={b.filterStatus}
          value={filters.status}
          options={statuses.map((s) => ({ value: s, label: copy.packages.status[s] }))}
          onChange={(status) => update({ status })}
        />
        <ChipGroup
          label={b.filterLicense}
          value={filters.license}
          options={licenses.map((l) => ({ value: l, label: copy.packages.license[l] }))}
          onChange={(license) => update({ license })}
        />

        <p className="annotate" aria-live="polite">
          {b.results(visible.length, packages.length)}
        </p>
      </div>

      {visible.length > 0 ? (
        <PackageGrid packages={visible} />
      ) : (
        <div className="flex flex-col items-start gap-4">
          <p className="text-fg-muted">{b.empty}</p>
          {active && (
            <button type="button" className="control px-4 py-2.5 text-sm" onClick={() => update(EMPTY)}>
              {b.reset}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
