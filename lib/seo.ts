import type { Metadata } from "next"

export const SITE_URL = "https://sweber.dev"
export const BRAND = "Weber Development"

export type { Locale } from "@/lib/i18n"
import type { Locale } from "@/lib/i18n"

/** Each edition has its own file-convention image: app/(en)/opengraph-image, app/(de)/de/opengraph-image. */
const OG_IMAGE: Record<Locale, { url: string; width: number; height: number; alt: string }> = {
  en: {
    url: "/opengraph-image",
    width: 1200,
    height: 630,
    alt: "Weber Development: custom software and automation for SMEs in Eastern Switzerland",
  },
  de: {
    url: "/de/opengraph-image",
    width: 1200,
    height: 630,
    alt: "Weber Development: Individualsoftware und Automatisierung für KMU in der Ostschweiz",
  },
}

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
      images: [OG_IMAGE[locale]],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [OG_IMAGE[locale]],
    },
    ...(noindex && { robots: { index: false, follow: true } }),
  }
}

/**
 * Root-layout metadata of an edition. Pages override title, description,
 * canonical and og:url through pageMetadata(); this is the fallback for routes
 * that don't (404, noindex pages).
 */
export function rootMetadata(locale: Locale): Metadata {
  const de = locale === "de"
  return {
    metadataBase: new URL(SITE_URL),
    // Nothing URL-specific may live here: every route inherits it, and a
    // root-level canonical turned all subpages into duplicates of the home page.
    title: {
      default: de
        ? `Software und Automatisierung für KMU | ${BRAND}`
        : `Software and automation for SMEs | ${BRAND}`,
      template: `%s | ${BRAND}`,
    },
    description: de
      ? "Weber Development entwickelt Individualsoftware und Prozessautomatisierung für KMU in der Ostschweiz, persönlich umgesetzt von Seya Weber in Bichwil SG."
      : "Weber Development builds custom software and process automation for SMEs in Eastern Switzerland, delivered personally by Seya Weber in Bichwil SG.",
    authors: [{ name: "Seya Weber", url: SITE_URL }],
    creator: "Seya Weber",
    publisher: BRAND,
    formatDetection: { email: false, address: false, telephone: false },
    openGraph: {
      type: "website",
      locale: de ? "de_CH" : "en_US",
      siteName: BRAND,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    category: "technology",
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
