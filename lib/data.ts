import { db } from "./db"
import {
  projects,
  experienceEntries,
  blogPosts,
  caseStudies,
  certificates,
  siteSettings,
  skills,
  type HeroMetric,
} from "./schema"
import { eq, asc } from "drizzle-orm"

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
}

const DEFAULT_SETTINGS: SiteSettings = {
  heroAvailable: true,
  heroAvailabilityLabel: "Available for projects",
  heroMetrics: [],
  contactEmail: "info@sweber.dev",
  contactPhone: "",
  contactLocation: "St. Gallen, Switzerland",
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
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const rows = await db.select().from(siteSettings).limit(1)
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
  }
}

export async function getProjects() {
  return db.select().from(projects).orderBy(asc(projects.sortOrder))
}

export async function getProjectBySlug(slug: string) {
  const results = await db.select().from(projects).where(eq(projects.slug, slug))
  return results[0] ?? null
}

export async function getExperience() {
  return db.select().from(experienceEntries).orderBy(asc(experienceEntries.sortOrder))
}

export async function getBlogPosts() {
  return db.select().from(blogPosts)
}

export async function getBlogPostBySlug(slug: string) {
  const results = await db.select().from(blogPosts).where(eq(blogPosts.slug, slug))
  return results[0] ?? null
}

export async function getCaseStudies() {
  return db.select().from(caseStudies)
}

export async function getCaseStudyBySlug(slug: string) {
  const results = await db.select().from(caseStudies).where(eq(caseStudies.slug, slug))
  return results[0] ?? null
}

export async function getCertificates() {
  return db.select().from(certificates).orderBy(asc(certificates.sortOrder))
}

export async function getSkills() {
  return db.select().from(skills).orderBy(asc(skills.sortOrder))
}
