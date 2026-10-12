import type { Metadata } from "next"
import { localizePath, type Locale } from "@/lib/i18n"
import { pageMetadata } from "@/lib/seo"

/**
 * Title and description of every page that exists in both editions, keyed by
 * the English path. The German values are a first pass; the copywriter returns
 * them through the flat JSON export under `pageMeta.<key>.{title,description}`.
 */
export const PAGE_META = {
  home: {
    path: "/",
    en: {
      title: "Software and automation for SMEs",
      description:
        "Weber Development builds custom software and process automation for SMEs in Eastern Switzerland, delivered personally by Seya Weber in Bichwil SG.",
    },
    de: {
      title: "Software und Automatisierung für KMU",
      description:
        "Weber Development entwickelt Individualsoftware und Prozessautomatisierung für KMU in der Ostschweiz, persönlich umgesetzt von Seya Weber in Bichwil SG.",
    },
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
        "Seya Weber führt Weber Development in Bichwil SG: Softwareentwicklung und Projektleitung für Individualsoftware und Automatisierung bei Schweizer KMU.",
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
        "Werdegang von Seya Weber: Lehre, Stationen in Betrieb und Softwareentwicklung, Ausbildung und Zertifikate in einer gemeinsamen Zeitleiste.",
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
        "Ausgewählte Projekte von Weber Development: Webanwendungen, Automatisierung und KI-Integrationen, jeweils mit Problem, Lösung und Ergebnissen.",
    },
  },
  services: {
    path: "/services",
    en: {
      title: "Services for SMEs",
      description:
        "Custom software, process automation with AI and digital project leadership for SMEs in Eastern Switzerland: what each service covers and how it works.",
    },
    de: {
      title: "Leistungen für KMU",
      description:
        "Individualsoftware, Prozessautomatisierung mit KI und Projektleitung in der Digitalisierung für KMU in der Ostschweiz: was jede Leistung umfasst und wie sie abläuft.",
    },
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
        "Kontaktieren Sie Weber Development für ein Erstgespräch zu Individualsoftware, Automatisierung oder Projektleitung. Sitz in Bichwil SG, tätig in der ganzen Schweiz.",
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
        "Impressum für sweber.dev und die Subdomains: Weber Development, Seya Weber, Bichwil SG, Schweiz, mit Postadresse und Kontaktangaben.",
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
        "Wie Weber Development über sweber.dev übermittelte Personendaten, etwa über das Kontaktformular, bearbeitet und speichert und an wen Sie sich dazu wenden können.",
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
