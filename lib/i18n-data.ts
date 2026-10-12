import type { Locale } from "@/lib/i18n"
import type { SiteSettings } from "@/lib/data"
import type {
  projects,
  experienceEntries,
  educationEntries,
  certificates,
  skills,
} from "@/lib/schema"

type Project = typeof projects.$inferSelect
type Experience = typeof experienceEntries.$inferSelect
type Education = typeof educationEntries.$inferSelect
type Certificate = typeof certificates.$inferSelect
type Skill = typeof skills.$inferSelect

const filled = (v: string | null | undefined) => (v ?? "").trim() !== ""
const pick = (en: string, de: string | null | undefined) => (filled(de) ? (de as string) : en)
function pickArr<T>(en: T[], de: T[] | null | undefined): T[] {
  return Array.isArray(de) && de.length > 0 ? de : en
}

/** True when the project has a German description, i.e. its /de page may be indexed. */
export function hasGermanProject(row: Pick<Project, "descriptionDe">): boolean {
  return filled(row.descriptionDe)
}

export function localizeProject<T extends Project>(row: T, locale: Locale): T {
  if (locale !== "de") return row
  return {
    ...row,
    title: pick(row.title, row.titleDe),
    shortDescription: pick(row.shortDescription, row.shortDescriptionDe),
    description: pick(row.description, row.descriptionDe),
    client: pick(row.client, row.clientDe),
    duration: pick(row.duration, row.durationDe),
    challenge: pick(row.challenge, row.challengeDe),
    solution: pick(row.solution, row.solutionDe),
    results: pickArr(row.results, row.resultsDe),
  }
}

export function localizeExperience<T extends Experience>(row: T, locale: Locale): T {
  if (locale !== "de") return row
  return {
    ...row,
    role: pick(row.role, row.roleDe),
    description: pick(row.description, row.descriptionDe),
    responsibilities: pickArr(row.responsibilities, row.responsibilitiesDe),
  }
}

export function localizeEducation<T extends Education>(row: T, locale: Locale): T {
  if (locale !== "de") return row
  return {
    ...row,
    title: pick(row.title, row.titleDe),
    description: pick(row.description, row.descriptionDe),
  }
}

export function localizeCertificate<T extends Certificate>(row: T, locale: Locale): T {
  if (locale !== "de") return row
  return {
    ...row,
    fullTitle: pick(row.fullTitle, row.fullTitleDe),
    category: pick(row.category, row.categoryDe),
    description: pick(row.description, row.descriptionDe),
    whyPoints: pickArr(row.whyPoints, row.whyPointsDe),
  }
}

export function localizeSkill<T extends Skill>(row: T, locale: Locale): T {
  if (locale !== "de") return row
  return {
    ...row,
    category: pick(row.category, row.categoryDe),
    name: pick(row.name, row.nameDe),
    detail: pick(row.detail, row.detailDe),
    level: pick(row.level, row.levelDe),
  }
}

export function localizeSettings(settings: SiteSettings, locale: Locale): SiteSettings {
  if (locale !== "de") return settings
  return {
    ...settings,
    heroAvailabilityLabel: pick(settings.heroAvailabilityLabel, settings.heroAvailabilityLabelDe),
    heroMetrics: pickArr(settings.heroMetrics, settings.heroMetricsDe),
    contactLocation: pick(settings.contactLocation, settings.contactLocationDe),
    currentRole: pick(settings.currentRole, settings.currentRoleDe),
    knowsAbout: pickArr(settings.knowsAbout, settings.knowsAboutDe),
    privacyContent: pick(settings.privacyContent, settings.privacyContentDe),
  }
}
