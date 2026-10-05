import "server-only"

import fs from "fs"
import path from "path"
import { cache } from "react"

/**
 * Recorded output of the Pro scanner and catalog tools, read from
 * content/demos. Only JSON and Markdown files are read here, no Pro package
 * is imported. Every reader returns null when its file is missing or invalid,
 * and the page then shows an error state.
 */

function readDemoFile(...parts: string[]): string {
  return fs.readFileSync(path.join(process.cwd(), "content", "demos", ...parts), "utf8")
}

export interface GtmTag {
  name: string
  type: string
  paused: boolean
  triggers: string[]
  consentStatus: string
  finding: string
  severity: string
  serviceId?: string
  serviceName?: string
  category?: string
  matchDetail?: string
  hosts?: string[]
  reason?: string
  hint?: string
}

export interface GtmView {
  container: { name: string; publicId: string; versionId: string }
  summary: {
    exitCode: number
    notInConfig: number
    noConsentCheck: number
    unknown: number
    ok: number
    paused: number
  }
  exportTags: { id: string; name: string; type: string; triggers: string[]; consentStatus: string }[]
  groups: {
    notInConfig: GtmTag[]
    noConsentCheck: GtmTag[]
    notice: GtmTag[]
    unknown: GtmTag[]
    ok: GtmTag[]
  }
}

interface RawExportTag {
  tagId: string
  name: string
  type: string
  firingTriggerId?: unknown[]
  consentSettings?: { consentStatus?: string }
}

export const getGtmView = cache((): GtmView | null => {
  try {
    const raw = JSON.parse(readDemoFile("permito-gtm-check.json"))
    const version = JSON.parse(readDemoFile("permito-gtm-container.json")).containerVersion ?? {}
    const triggerNames = new Map<string, string>(
      (version.trigger ?? []).map((tr: { triggerId: string; name: string }) => [String(tr.triggerId), tr.name]),
    )
    const exportTags = ((version.tag ?? []) as RawExportTag[]).map((tag) => ({
      id: String(tag.tagId),
      name: String(tag.name),
      type: String(tag.type),
      triggers: (tag.firingTriggerId ?? []).map((id) => triggerNames.get(String(id)) ?? String(id)),
      consentStatus: tag.consentSettings?.consentStatus ?? "notSet",
    }))
    const tags: GtmTag[] = (raw.tags ?? []).map(
      (tag: Record<string, unknown> & { service?: { id: string; name: string } }) => ({
        name: String(tag.name),
        type: String(tag.type),
        paused: tag.paused === true,
        triggers: Array.isArray(tag.triggers) ? tag.triggers.map(String) : [],
        consentStatus: String(tag.consentStatus ?? "notSet"),
        finding: String(tag.finding),
        severity: String(tag.severity),
        serviceId: tag.service?.id,
        serviceName: tag.service?.name,
        category: typeof tag.category === "string" ? tag.category : undefined,
        matchDetail: typeof tag.matchDetail === "string" ? tag.matchDetail : undefined,
        hosts: Array.isArray(tag.hosts) ? tag.hosts.map(String) : undefined,
        reason: typeof tag.reason === "string" ? tag.reason : undefined,
        hint: typeof tag.hint === "string" ? tag.hint : undefined,
      }),
    )
    const groups = {
      notInConfig: tags.filter((x) => x.finding === "not-in-config"),
      noConsentCheck: tags.filter((x) => x.finding === "no-consent-check" && x.severity === "error"),
      notice: tags.filter((x) => x.finding === "no-consent-check" && x.severity !== "error"),
      unknown: tags.filter((x) => x.finding === "unknown-tag"),
      ok: tags.filter((x) => x.finding === "ok"),
    }
    const s = raw.summary ?? {}
    return {
      container: raw.container,
      summary: {
        exitCode: s.exitCode ?? 0,
        notInConfig: s["not-in-config"] ?? groups.notInConfig.length,
        noConsentCheck: groups.noConsentCheck.length,
        unknown: s["unknown-tag"] ?? groups.unknown.length,
        ok: s.ok ?? groups.ok.length,
        paused: s.paused ?? 0,
      },
      exportTags,
      groups,
    }
  } catch {
    return null
  }
})

export interface MonitorSite {
  name: string
  slug: string
  url: string
  status: string
  unconfigured: number
  beforeConsent: number
  accepted: number
}

export interface MonitorView {
  sitesFile: string
  sites: MonitorSite[]
  report: string
}

export const getMonitorView = cache((): MonitorView | null => {
  try {
    const summary = JSON.parse(readDemoFile("permito-monitor", "summary.json"))
    const sites: MonitorSite[] = (summary.sites ?? []).map((x: Record<string, unknown>) => ({
      name: String(x.name),
      slug: String(x.slug),
      url: String(x.url),
      status: String(x.status),
      unconfigured: Number(x.unconfigured ?? 0),
      beforeConsent: Number(x.beforeConsent ?? 0),
      accepted: Number(x.accepted ?? 0),
    }))
    return {
      sitesFile: JSON.stringify(JSON.parse(readDemoFile("permito-monitor", "permito.sites.json")), null, 2),
      sites,
      report: readDemoFile("permito-monitor", "shop-beispiel.md"),
    }
  } catch {
    return null
  }
})

export interface CatalogChangesView {
  since: string
  affectsCookieTable: boolean
  text: string
}

const showValue = (v: unknown): string =>
  Array.isArray(v) ? `[${v.join(", ")}]` : typeof v === "string" ? JSON.stringify(v) : String(v)

interface RawChange {
  version: string
  date: string
  serviceId: string
  change: string
  fields?: { path: string; before: unknown; after: unknown }[]
}

/** Builds the CLI output from the changes.json of a simulated catalog update. */
export const getCatalogChanges = cache((): CatalogChangesView | null => {
  try {
    const raw = JSON.parse(readDemoFile("permito-catalog-changes.example.json")) as RawChange[]
    const since = "0.2.0"
    const services = [...new Set(raw.map((r) => r.serviceId))].sort((a, b) => a.localeCompare(b))
    const lines = [`Catalog changes since ${since}:`, ""]
    for (const id of services) {
      lines.push(id)
      for (const r of raw.filter((x) => x.serviceId === id)) {
        lines.push(`  ${r.version} (${r.date}): ${r.change}`)
        for (const f of r.fields ?? []) {
          lines.push(`    ${f.path}: ${showValue(f.before)} -> ${showValue(f.after)}`)
        }
      }
      lines.push("")
    }
    const affectsCookieTable = raw.some((r) => (r.fields ?? []).some((f) => f.path.startsWith("cookies")))
    if (affectsCookieTable) {
      lines.push("These changes affect the cookie table. Run permito-cookie-table again and publish the result.")
    }
    return { since, affectsCookieTable, text: lines.join("\n") }
  } catch {
    return null
  }
})
