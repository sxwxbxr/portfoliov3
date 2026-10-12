import type { SiteSettings } from "@/lib/data"
import { BRAND, SITE_URL, type Locale } from "@/lib/seo"

/**
 * schema.org JSON-LD builders.
 *
 * The sitewide graph (WebSite, ProfessionalService, Person) is emitted once by
 * the root layout. It carries stable @ids so page-level snippets (ProfilePage,
 * CreativeWork) can point at the same entities instead of redefining them.
 *
 * Nothing here is invented: every value comes from `site_settings`, the
 * imprint, or the arguments. Weber Development is not in the commercial
 * register, so there is deliberately no legalName, taxID or vatID.
 */

export const ID = {
  website: `${SITE_URL}/#website`,
  business: `${SITE_URL}/#business`,
  person: `${SITE_URL}/#seya`,
} as const

const CONTEXT = "https://schema.org"

/** BCP 47 tag of the page language, for `inLanguage` on page-level nodes. */
const pageLanguage = (locale: Locale) => (locale === "de" ? "de-CH" : "en")

const absolute = (path: string) => (path.startsWith("http") ? path : `${SITE_URL}${path}`)

/** Only real http(s) URLs; seed data uses "#" for "no link". */
const isRealUrl = (value: string | undefined | null): value is string =>
  Boolean(value) && /^https?:\/\/\S+$/.test(value as string)

export function siteGraph(settings: SiteSettings, locale: Locale = "en") {
  const email = settings.contactEmail || "info@sweber.dev"
  const sameAs = [settings.linkedinUrl, settings.githubUrl, settings.twitterUrl].filter(Boolean)

  const website = {
    "@type": "WebSite",
    "@id": ID.website,
    url: SITE_URL,
    name: BRAND,
    inLanguage: ["en", "de-CH"],
    publisher: { "@id": ID.business },
  }

  const business = {
    "@type": "ProfessionalService",
    "@id": ID.business,
    name: BRAND,
    url: SITE_URL,
    description:
      "Weber Development builds custom software and automation for SMEs in Eastern Switzerland, delivered personally by Seya Weber in Bichwil SG.",
    email,
    // Only when the admin has set a number; never a hardcoded one.
    ...(settings.contactPhone.trim() && { telephone: settings.contactPhone.trim() }),
    // Same address as content/legal/imprint.md.
    address: {
      "@type": "PostalAddress",
      streetAddress: "Längistrasse 3",
      postalCode: "9248",
      addressLocality: "Bichwil",
      addressRegion: "SG",
      addressCountry: "CH",
    },
    // TODO(Seya): confirm areaServed (cantons and country) before relying on it.
    areaServed: [
      { "@type": "AdministrativeArea", name: "Kanton St. Gallen" },
      { "@type": "AdministrativeArea", name: "Kanton Thurgau" },
      { "@type": "Country", name: "Schweiz" },
    ],
    knowsLanguage: ["de", "en", "fr"],
    founder: { "@id": ID.person },
    ...(sameAs.length > 0 && { sameAs }),
  }

  const person = {
    "@type": "Person",
    "@id": ID.person,
    name: "Seya Weber",
    jobTitle: "Software Developer & Project Manager",
    url: `${SITE_URL}/about`,
    worksFor: { "@id": ID.business },
    ...(settings.knowsAbout.length > 0 && { knowsAbout: settings.knowsAbout }),
    ...(settings.alumniOf && {
      alumniOf: { "@type": "Organization", name: settings.alumniOf },
    }),
    ...(sameAs.length > 0 && { sameAs }),
  }

  void locale // reserved: the /de edition will localise description strings here
  return { "@context": CONTEXT, "@graph": [website, business, person] }
}

export interface Crumb {
  name: string
  /** Path relative to SITE_URL, e.g. "/projects". */
  path: string
}

/** Home is prepended; pass the trail below it. */
export function breadcrumbList(items: Crumb[], locale: Locale = "en") {
  const trail: Crumb[] = [{ name: "Home", path: locale === "de" ? "/de" : "/" }, ...items]
  return {
    "@context": CONTEXT,
    "@type": "BreadcrumbList",
    itemListElement: trail.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.name,
      item: absolute(crumb.path),
    })),
  }
}

export function profilePage(locale: Locale = "en") {
  const url = absolute(locale === "de" ? "/de/ueber-mich" : "/about")
  return {
    "@context": CONTEXT,
    "@type": "ProfilePage",
    "@id": `${url}#profile`,
    url,
    name: `About Seya Weber | ${BRAND}`,
    inLanguage: pageLanguage(locale),
    isPartOf: { "@id": ID.website },
    mainEntity: { "@id": ID.person },
  }
}

export interface CreativeWorkInput {
  slug: string
  title: string
  shortDescription?: string
  description?: string
  tags?: readonly string[]
  demo?: string
}

export function creativeWork(project: CreativeWorkInput, locale: Locale = "en") {
  const pageUrl = absolute(`/projects/${project.slug}`)
  const description = (project.shortDescription || project.description || "").trim()
  const tags = (project.tags ?? []).filter(Boolean)
  return {
    "@context": CONTEXT,
    "@type": "CreativeWork",
    "@id": `${pageUrl}#work`,
    name: project.title,
    ...(description && { description }),
    url: isRealUrl(project.demo) ? project.demo : pageUrl,
    mainEntityOfPage: pageUrl,
    inLanguage: pageLanguage(locale),
    creator: { "@id": ID.person },
    ...(tags.length > 0 && { keywords: tags.join(", ") }),
  }
}
