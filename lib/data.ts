import { cache } from "react"
import { db } from "./db"
import {
  projects,
  experienceEntries,
  blogPosts,
  caseStudies,
  certificates,
  educationEntries,
  siteSettings,
  skills,
  aiSettings,
  type HeroMetric,
} from "./schema"
import { eq, asc, getTableColumns } from "drizzle-orm"
import type { PgTable } from "drizzle-orm/pg-core"

export type SiteSettings = {
  heroAvailable: boolean
  heroAvailabilityLabel: string
  heroMetrics: HeroMetric[]
  contactEmail: string
  contactPhone: string
  contactLocation: string
  linkedinUrl: string
  githubUrl: string
  twitterUrl: string
  currentEmployer: string
  currentRole: string
  alumniOf: string
  knowsAbout: string[]
  privacyContent: string
  heroAvailabilityLabelDe: string
  heroMetricsDe: HeroMetric[]
  contactLocationDe: string
  currentRoleDe: string
  knowsAboutDe: string[]
  privacyContentDe: string
}

const DEFAULT_SETTINGS: SiteSettings = {
  heroAvailable: true,
  heroAvailabilityLabel: "Available for projects",
  heroMetrics: [],
  contactEmail: "info@sweber.dev",
  contactPhone: "",
  // TODO(Seya): set contact_location in /admin to "Bichwil SG, Ostschweiz".
  contactLocation: "Bichwil SG, Ostschweiz",
  linkedinUrl: "https://ch.linkedin.com/in/seya-weber-06a592256",
  githubUrl: "https://github.com/sxwxbxr",
  twitterUrl: "",
  currentEmployer: "Telsonic AG",
  currentRole: "Project Manager Software and Digitalisation",
  alumniOf: "WISS St. Gallen",
  knowsAbout: [
    "Project Management",
    "Software Development",
    "Digital Transformation",
    "C# / .NET",
    "TypeScript / React / Next.js",
    "Process Automation",
    "Agile Methodologies",
  ],
  privacyContent: "",
  heroAvailabilityLabelDe: "",
  heroMetricsDe: [],
  contactLocationDe: "",
  currentRoleDe: "",
  knowsAboutDe: [],
  privacyContentDe: "",
}

/**
 * True when a connection string is configured at all.
 *
 * Without this guard every route 500s on a checkout that has no `.env.local`,
 * including the root layout — which makes it impossible to work on markup or
 * styling locally. Note this deliberately only covers the *absent* case: when
 * DATABASE_URL is set and the query still fails, the error propagates, because
 * a broken database in production must not be silently papered over with
 * placeholder content.
 */
const hasDb = () => Boolean(process.env.DATABASE_URL)

/**
 * The German edition added `*_de` columns that only exist after `db:push`
 * has been run against the target database. Until then the full select fails
 * with Postgres 42703 (undefined column) and takes every page, and the whole
 * production build, down with it. On exactly that error we retry with the
 * legacy columns only and fill the German fields with their schema defaults
 * (empty string / empty array), which the pages already treat as "fall back
 * to English". Any other error still propagates.
 */
const isMissingColumn = (e: unknown): boolean => {
  const err = e as { code?: string; cause?: { code?: string } } | null
  return err?.code === "42703" || err?.cause?.code === "42703"
}

async function withLegacyFallback<T extends PgTable>(
  table: T,
  run: (columns?: Record<string, unknown>) => Promise<unknown[]>,
): Promise<T["$inferSelect"][]> {
  try {
    return (await run()) as T["$inferSelect"][]
  } catch (e) {
    if (!isMissingColumn(e)) throw e
    console.warn(
      "[data] *_de columns missing in database, falling back to English-only columns. Run `npm run db:push`.",
    )
    const all = getTableColumns(table) as Record<string, { name: string; dataType: string }>
    const legacy: Record<string, unknown> = {}
    const defaults: Record<string, unknown> = {}
    for (const [key, col] of Object.entries(all)) {
      if (col.name.endsWith("_de")) {
        defaults[key] = col.dataType === "json" ? [] : ""
      } else {
        legacy[key] = col
      }
    }
    const rows = await run(legacy)
    return rows.map((r) => ({ ...defaults, ...(r as object) })) as T["$inferSelect"][]
  }
}

const selectFrom = (cols: Record<string, unknown> | undefined) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (cols ? db.select(cols as any) : db.select())

export const getSiteSettings = cache(async (): Promise<SiteSettings> => {
  if (!hasDb()) return DEFAULT_SETTINGS

  const rows = await withLegacyFallback(siteSettings, (c) => selectFrom(c).from(siteSettings).limit(1))
  const row = rows[0]
  if (!row) return DEFAULT_SETTINGS

  return {
    heroAvailable: row.heroAvailable,
    heroAvailabilityLabel: row.heroAvailabilityLabel,
    heroMetrics: row.heroMetrics ?? [],
    contactEmail: row.contactEmail,
    contactPhone: row.contactPhone,
    contactLocation: row.contactLocation,
    linkedinUrl: row.linkedinUrl,
    githubUrl: row.githubUrl,
    twitterUrl: row.twitterUrl,
    currentEmployer: row.currentEmployer,
    currentRole: row.currentRole,
    alumniOf: row.alumniOf,
    knowsAbout: row.knowsAbout ?? [],
    privacyContent: row.privacyContent,
    heroAvailabilityLabelDe: row.heroAvailabilityLabelDe,
    heroMetricsDe: row.heroMetricsDe ?? [],
    contactLocationDe: row.contactLocationDe,
    currentRoleDe: row.currentRoleDe,
    knowsAboutDe: row.knowsAboutDe ?? [],
    privacyContentDe: row.privacyContentDe,
  }
})

export const getProjects = cache(async () => {
  if (!hasDb()) return []
  return withLegacyFallback(projects, (c) => selectFrom(c).from(projects).orderBy(asc(projects.sortOrder)))
})

export const getProjectBySlug = cache(async (slug: string) => {
  if (!hasDb()) return null
  const results = await withLegacyFallback(projects, (c) =>
    selectFrom(c).from(projects).where(eq(projects.slug, slug)),
  )
  return results[0] ?? null
})

export const getExperience = cache(async () => {
  if (!hasDb()) return []
  return withLegacyFallback(experienceEntries, (c) =>
    selectFrom(c).from(experienceEntries).orderBy(asc(experienceEntries.sortOrder)),
  )
})

export const getBlogPosts = cache(async () => {
  if (!hasDb()) return []
  return db.select().from(blogPosts)
})

export const getBlogPostBySlug = cache(async (slug: string) => {
  if (!hasDb()) return null
  const results = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug))
  return results[0] ?? null
})

export const getCaseStudies = cache(async () => {
  if (!hasDb()) return []
  return db.select().from(caseStudies)
})

export const getCaseStudyBySlug = cache(async (slug: string) => {
  if (!hasDb()) return null
  const results = await db.select().from(caseStudies).where(eq(caseStudies.slug, slug))
  return results[0] ?? null
})

export const getCertificates = cache(async () => {
  if (!hasDb()) return []
  return withLegacyFallback(certificates, (c) =>
    selectFrom(c).from(certificates).orderBy(asc(certificates.sortOrder)),
  )
})

export const getEducationEntries = cache(async () => {
  if (!hasDb()) return []
  return withLegacyFallback(educationEntries, (c) =>
    selectFrom(c).from(educationEntries).orderBy(asc(educationEntries.sortOrder)),
  )
})

export const getSkills = cache(async () => {
  if (!hasDb()) return []
  return withLegacyFallback(skills, (c) => selectFrom(c).from(skills).orderBy(asc(skills.sortOrder)))
})

// --- AI feature configuration -------------------------------------------------

export type AiFeature = "chat" | "contact" | "deepdive" | "pitch" | "skill"

export type AiSettings = {
  chatPrimary: string
  chatFallback: string
  contactPrimary: string
  contactFallback: string
  deepdivePrimary: string
  deepdiveFallback: string
  pitchPrimary: string
  pitchFallback: string
  skillPrimary: string
  skillFallback: string
  dailyLimit: number
}

const FREE_DEFAULT = "deepseek/deepseek-chat-v3-0324:free"
const PAID_DEFAULT = "deepseek/deepseek-chat"

export const DEFAULT_AI_SETTINGS: AiSettings = {
  chatPrimary: FREE_DEFAULT,
  chatFallback: PAID_DEFAULT,
  contactPrimary: FREE_DEFAULT,
  contactFallback: PAID_DEFAULT,
  deepdivePrimary: FREE_DEFAULT,
  deepdiveFallback: PAID_DEFAULT,
  pitchPrimary: FREE_DEFAULT,
  pitchFallback: PAID_DEFAULT,
  skillPrimary: FREE_DEFAULT,
  skillFallback: PAID_DEFAULT,
  dailyLimit: 500,
}

export const getAiSettings = cache(async (): Promise<AiSettings> => {
  const rows = await db.select().from(aiSettings).limit(1)
  const row = rows[0]
  if (!row) return DEFAULT_AI_SETTINGS

  return {
    chatPrimary: row.chatPrimary,
    chatFallback: row.chatFallback,
    contactPrimary: row.contactPrimary,
    contactFallback: row.contactFallback,
    deepdivePrimary: row.deepdivePrimary,
    deepdiveFallback: row.deepdiveFallback,
    pitchPrimary: row.pitchPrimary,
    pitchFallback: row.pitchFallback,
    skillPrimary: row.skillPrimary,
    skillFallback: row.skillFallback,
    dailyLimit: row.dailyLimit,
  }
})
