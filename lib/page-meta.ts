import type { Metadata } from "next"
import { localizePath, type Locale } from "@/lib/i18n"
import { pageMetadata } from "@/lib/seo"
import { overview as overviewEn } from "@/content/services/en"
import { overview as overviewDe } from "@/content/services/de"
import { home as homeEn } from "@/content/home/en"
import { home as homeDe } from "@/content/home/de"

/**
 * Title and description of every page that exists in both editions, keyed by
 * the English path. Home and services are read from content/home and
 * content/services, the other pages are set here.
 */
export const PAGE_META = {
  home: {
    path: "/",
    en: { title: homeEn.metaTitle, description: homeEn.metaDescription },
    de: { title: homeDe.metaTitle, description: homeDe.metaDescription },
  },
  about: {
    path: "/about",
    en: {
      title: "About Seya Weber",
      description:
        "Seya Weber runs Weber Development in Bichwil SG: software developer and project manager building custom software and automation for Swiss SMEs.",
    },
    de: {
      title: "Über Seya Weber",
      description:
        "Seya Weber führt Weber Development in Bichwil SG: Softwareentwicklung und Projektleitung, Individualsoftware und Automatisierung für Schweizer KMU.",
    },
  },
  career: {
    path: "/career",
    en: {
      title: "Career and education",
      description:
        "Career of Seya Weber: apprenticeships, roles in operations and software development, education and certificates, shown as one timeline.",
    },
    de: {
      title: "Werdegang und Ausbildung",
      description:
        "Werdegang von Seya Weber: Lehren, Stellen in Betrieb und Softwareentwicklung, Ausbildung und Zertifikate, dargestellt auf einer gemeinsamen Zeitachse.",
    },
  },
  projects: {
    path: "/projects",
    en: {
      title: "Projects and case studies",
      description:
        "Selected projects by Weber Development: web applications, automation and AI integrations, each with the problem, the solution and the results.",
    },
    de: {
      title: "Projekte und Fallstudien",
      description:
        "Ausgewählte Projekte von Weber Development: Webapplikationen, Automatisierungen und KI-Integrationen, jeweils mit Ausgangslage, Lösung und Ergebnis.",
    },
  },
  services: {
    path: "/services",
    en: { title: overviewEn.metaTitle, description: overviewEn.metaDescription },
    de: { title: overviewDe.metaTitle, description: overviewDe.metaDescription },
  },
  contact: {
    path: "/contact",
    en: {
      title: "Contact",
      description:
        "Contact Weber Development for a first call about custom software, automation or project leadership. Based in Bichwil SG, working across Switzerland.",
    },
    de: {
      title: "Kontakt",
      description:
        "Kontaktieren Sie Weber Development für ein Erstgespräch zu Individualsoftware, Automatisierung oder Projektleitung. Bichwil SG, tätig in der ganzen Schweiz.",
    },
  },
  imprint: {
    path: "/imprint",
    en: {
      title: "Imprint",
      description:
        "Legal notice for sweber.dev and its subdomains: Weber Development, Seya Weber, Bichwil SG, Switzerland, with postal address and contact details.",
    },
    de: {
      title: "Impressum",
      description:
        "Impressum von sweber.dev und seinen Subdomains: Weber Development, Seya Weber, Bichwil SG, Schweiz, mit Postadresse und Kontaktangaben.",
    },
  },
  privacy: {
    path: "/privacy",
    en: {
      title: "Privacy policy",
      description:
        "How Weber Development processes and stores personal data submitted through sweber.dev, for example via the contact form, and whom to contact about it.",
    },
    de: {
      title: "Datenschutzerklärung",
      description:
        "Wie Weber Development Personendaten bearbeitet und speichert, die über sweber.dev übermittelt werden, etwa per Kontaktformular, und wer dazu Auskunft gibt.",
    },
  },
} as const

export type PageKey = keyof typeof PAGE_META

/** Metadata with reciprocal hreflang for a static page, in either edition. */
export function staticPageMetadata(key: PageKey, locale: Locale): Metadata {
  const meta = PAGE_META[key]
  return pageMetadata({
    ...meta[locale],
    path: localizePath(meta.path, locale),
    locale,
    alternates: { en: localizePath(meta.path, "en"), de: localizePath(meta.path, "de") },
  })
}
