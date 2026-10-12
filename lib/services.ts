import type { Metadata } from "next"
import { localizePath, type Locale } from "@/lib/i18n"
import { pageMetadata } from "@/lib/seo"
import { SERVICE_KEYS, type ServiceContent, type ServiceKey } from "@/content/services/types"
import * as de from "@/content/services/de"
import * as en from "@/content/services/en"

const BY_LOCALE = { en, de } as const

export { SERVICE_KEYS }
export type { ServiceKey }

export const servicesLabels = (locale: Locale) => BY_LOCALE[locale].labels
export const servicesOverview = (locale: Locale) => BY_LOCALE[locale].overview
export const getService = (key: ServiceKey, locale: Locale): ServiceContent =>
  BY_LOCALE[locale].services[key]

/** Service whose path segment in `locale` is `slug`, or null. */
export function serviceBySlug(slug: string, locale: Locale): ServiceContent | null {
  return SERVICE_KEYS.map((key) => getService(key, locale)).find((s) => s.slug === slug) ?? null
}

/** English path of a service page; localizePath derives the German twin. */
export const serviceEnPath = (key: ServiceKey) => `/services/${key}`
export const servicePath = (key: ServiceKey, locale: Locale) =>
  localizePath(serviceEnPath(key), locale)

/** Metadata with reciprocal hreflang for the three service subpages. */
export function serviceMetadata(key: ServiceKey, locale: Locale): Metadata {
  const service = getService(key, locale)
  return pageMetadata({
    title: service.metaTitle,
    description: service.metaDescription,
    path: servicePath(key, locale),
    locale,
    alternates: { en: servicePath(key, "en"), de: servicePath(key, "de") },
  })
}

/**
 * German SME articles on packages.sweber.dev/blog. They exist only in the
 * packages blog (database / content API, not in this repository), so the slugs
 * were read from the live feed https://packages.sweber.dev/blog/posts.json.
 * Both are German only; the English edition labels them "(in German)".
 */
const ARTICLES = {
  customSoftware: {
    slug: "individualsoftware-fur-kmu-wann-lohnt-sich-eine-eigenentwick",
    title: "Individualsoftware für KMU: Wann lohnt sich eine Eigenentwicklung?",
  },
  cookies: {
    slug: "cookie-banner-und-revdsg-pflichten-fur-schweizer-kmu-ab-2024",
    title: "Cookie-Banner und revDSG: Pflichten für Schweizer KMU ab 2024",
  },
} as const

export const FURTHER_READING: Record<ServiceKey, readonly { slug: string; title: string }[]> = {
  "custom-software": [ARTICLES.customSoftware, ARTICLES.cookies],
  "process-automation-ai": [],
  "digital-project-leadership": [],
}
