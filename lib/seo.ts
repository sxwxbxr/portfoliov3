import type { Metadata } from "next"

export const SITE_URL = "https://sweber.dev"
export const BRAND = "Weber Development"

const OG_IMAGE = {
  url: "/opengraph-image",
  width: 1200,
  height: 630,
  alt: "Weber Development: custom software and automation for SMEs in Eastern Switzerland",
}

export type Locale = "en" | "de"

interface PageSeo {
  /** Topic only; the brand suffix is appended here. */
  title: string
  /** 120–160 characters: what the page offers and for whom. */
  description: string
  /** Path relative to SITE_URL, e.g. "/services" or "/de/leistungen". */
  path: string
  locale?: Locale
  /** Paths of the language versions of this page, including this one. */
  alternates?: { en?: string; de?: string }
  noindex?: boolean
}

/**
 * Per-page metadata. Next merges metadata shallowly, so anything a page sets
 * here (openGraph, alternates) replaces the root layout's block entirely:
 * the root layout therefore sets neither canonical nor og:url, and every
 * indexable page goes through this helper to get its own.
 */
export function pageMetadata({
  title,
  description,
  path,
  locale = "en",
  alternates,
  noindex,
}: PageSeo): Metadata {
  const fullTitle = `${title} | ${BRAND}`
  return {
    title: { absolute: fullTitle },
    description,
    alternates: {
      canonical: path,
      ...(alternates && {
        languages: {
          ...(alternates.en && { en: alternates.en }),
          ...(alternates.de && { de: alternates.de }),
          "x-default": alternates.en ?? path,
        },
      }),
    },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: BRAND,
      locale: locale === "de" ? "de_CH" : "en_US",
      type: "website",
      // Explicit: a page-level openGraph block does not reliably keep the
      // image from the root opengraph-image file convention.
      images: [OG_IMAGE],
    },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [OG_IMAGE] },
    ...(noindex && { robots: { index: false, follow: true } }),
  }
}

/** For internal routes that must stay out of the index but keep links followable. */
export const noindexMetadata: Metadata = { robots: { index: false, follow: true } }

/** Cuts free text to a snippet-sized description at a word boundary. */
export function clipDescription(text: string, max = 160): string {
  const flat = text.replace(/\s+/g, " ").trim()
  if (flat.length <= max) return flat
  const cut = flat.slice(0, max - 1)
  return `${cut.slice(0, cut.lastIndexOf(" "))}…`
}
