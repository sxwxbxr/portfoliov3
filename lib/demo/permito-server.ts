import "server-only"

import fs from "fs"
import path from "path"
import { cache } from "react"
import type { ConsentConfig } from "@permitojs/core"
import { catalog, toConsentService, type CatalogEntry } from "@weber-development/permito-catalog"
import { buildCookieTable, toHtml, toMarkdown } from "@weber-development/permito-cookie-table"

/**
 * Everything on the demo page that comes from the Pro packages is computed
 * here. The file is server-only: the repository is public and anything a
 * client component imports ends up in a downloadable bundle. Pages receive
 * plain data or finished HTML.
 */

/** Entries shown in full. The rest of the catalog is listed by name. */
const FEATURED_IDS = [
  "google-analytics-4",
  "matomo-self-hosted",
  "meta-pixel",
  "youtube-nocookie",
  "twint",
  "datatrans",
  "etracker",
  "friendly-captcha",
] as const

export const getCatalogView = cache(() => {
  const featured = FEATURED_IDS.map((id) => {
    const entry = catalog.find((e) => e.id === id)
    if (!entry) throw new Error(`Demo: catalog entry missing: ${id}`)
    return entry
  })
  const others = catalog
    .filter((e) => !FEATURED_IDS.some((id) => id === e.id))
    .map((e) => e.name)
    .sort((a, b) => a.localeCompare(b, "en"))
  return { total: catalog.length, featured: featured as CatalogEntry[], others }
})

const TABLE_SERVICES = [
  { id: "google-analytics-4", category: "statistics" },
  { id: "meta-pixel", category: "marketing" },
  { id: "youtube-nocookie", category: "marketing" },
] as const

const TABLE_LANGUAGES = ["de", "fr", "it", "en"] as const
export type TableLanguage = (typeof TABLE_LANGUAGES)[number]

const CONSENT_COOKIE_DURATION = {
  de: "180 Tage",
  fr: "180 jours",
  it: "180 giorni",
  en: "180 days",
}

function tableConfig(): Pick<ConsentConfig, "categories" | "services"> {
  return {
    categories: [{ id: "necessary", required: true }, { id: "statistics" }, { id: "marketing" }],
    services: TABLE_SERVICES.map(({ id, category }) => {
      const entry = catalog.find((e) => e.id === id)
      if (!entry) throw new Error(`Demo: catalog entry missing: ${id}`)
      return toConsentService(entry, { category })
    }),
  }
}

export const getCookieTables = cache(() => {
  const config = tableConfig()
  const build = (language: string) =>
    buildCookieTable(config, {
      language,
      catalog,
      includeConsentCookie: { duration: CONSENT_COOKIE_DURATION },
    })

  const html = {} as Record<TableLanguage, string>
  for (const lang of TABLE_LANGUAGES) {
    html[lang] = toHtml(build(lang), { classes: true })
  }
  const markdown = toMarkdown(build("en"))
  return { html, markdown }
})

export interface ScanItem {
  status: string
  type: string
  name: string
  thirdParty?: boolean
  serviceId?: string
  category?: string
  suggestions?: { id: string; name: string }[]
}

export interface ScanReport {
  pages: string[]
  summary: { unconfigured: number; beforeConsent: number; matched: number }
  unconfigured: ScanItem[]
  beforeConsent: ScanItem[]
  matched: ScanItem[]
}

/**
 * The recorded scanner run in content/demos. It is replaced by newer runs of
 * `permito scan --json`, so the shape is read defensively. Returns null if the
 * file is missing or not valid JSON; the page then shows an error state.
 */
export const getScanReport = cache((): ScanReport | null => {
  try {
    const file = path.join(process.cwd(), "content", "demos", "permito-scan.json")
    const raw = JSON.parse(fs.readFileSync(file, "utf8"))
    const list = (v: unknown): ScanItem[] => (Array.isArray(v) ? (v as ScanItem[]) : [])
    const unconfigured = list(raw.unconfigured)
    const beforeConsent = list(raw.beforeConsent)
    const matched = list(raw.matched)
    return {
      pages: Array.isArray(raw.pages) ? raw.pages.map(String) : [],
      summary: {
        unconfigured: raw.summary?.unconfigured ?? unconfigured.length,
        beforeConsent: raw.summary?.beforeConsent ?? beforeConsent.length,
        matched: raw.summary?.matched ?? matched.length,
      },
      unconfigured,
      beforeConsent,
      matched,
    }
  } catch {
    return null
  }
})
