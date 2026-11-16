"use client"

import Link from "next/link"
import { useRef } from "react"
import { ArrowRight } from "lucide-react"
import { useInView } from "framer-motion"
import Navigation from "./Navigation"
import JourneyStage, { type JourneyStation } from "./hero/JourneyStage"
import stage from "./hero/JourneyStage.module.css"
import type { LandmarkKind } from "./hero/landmarks"
import type { SiteSettings } from "@/lib/data"
import { useCopy, useLocale } from "@/components/LocaleProvider"
import { localizePath } from "@/lib/i18n"
import { home as homeEn } from "@/content/home/en"
import { home as homeDe } from "@/content/home/de"
import { servicePath, servicesOverview, servicesLabels } from "@/lib/services"

// ── Types ────────────────────────────────────────────
interface Project {
  id: number
  title: string
  shortDescription: string
  description: string
  image: string
  tags: string[]
  slug: string
  github: string
  demo: string
  sortOrder: number
  /** Resolved server-side; null when the asset is missing. */
  imageSrc?: string | null
}

interface ExperienceEntry {
  id: number
  company: string
  role: string
  period: string
  current: boolean
  description: string
  responsibilities: string[]
  sortOrder: number
}

interface BlogPost {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  publishedAt: string
  readTime: string
  author: string
  tags: string[]
  image: string
  featured: boolean
}

interface CaseStudy {
  id: number
  slug: string
  title: string
  client: string
  industry: string
  duration: string
  team: string
  challenge: string
  solution: string
  results: string[]
  technologies: string[]
  image: string
  testimonialQuote: string
  testimonialAuthor: string
  testimonialCompany: string
}

interface HomeContentProps {
  projects: Project[]
  experience: ExperienceEntry[]
  blogPosts: BlogPost[]
  caseStudies: CaseStudy[]
  settings: SiteSettings
}

/**
 * The projects the home page shows, by slug, in their sort order (Seya,
 * 2026-11-15). BlogPilot and Project Gotthard appear as soon as they are
 * entered in /admin under one of these slugs. /projects lists them all.
 */
const HOME_PROJECTS = [
  "flowlychat",
  "home-network-observability-dashboard",
  "blogpilot",
  "project-gotthard",
  "gotthard",
]

/** What stands in the landscape for a project. Others take turns. */
const PROJECT_LANDMARKS: Record<string, LandmarkKind> = {
  flowlychat: "mast",
  "home-network-observability-dashboard": "observatory",
  blogpilot: "airship",
  "project-gotthard": "mountain",
  gotthard: "mountain",
}
const SPARE_LANDMARKS: LandmarkKind[] = ["mast", "observatory", "airship", "mountain"]

// ── Component ────────────────────────────────────────
/**
 * The home page is one flight (see JourneyStage): every section it used to
 * stack under the hero is a station in the landscape now. The blog teaser
 * and the testimonial are switched off in lib/features.ts and have no
 * station; they need one if they come back.
 */
export default function HomeContent({ projects, experience, settings }: HomeContentProps) {
  const copy = useCopy()
  const locale = useLocale()
  const homeCopy = locale === "de" ? homeDe : homeEn
  const services = servicesOverview(locale)
  const serviceLabels = servicesLabels(locale)
  // Should none of the slugs exist (a renamed entry), the flight still has
  // its first two projects.
  const chosen = projects.filter((p) => HOME_PROJECTS.includes(p.slug))
  const selectedProjects = chosen.length > 0 ? chosen : projects.slice(0, 2)

  // Derived fallback metrics. Every number traces to a row that exists, so an
  // empty site_settings row cannot produce a claim the content does not back.
  const firstYear = experience
    .map((e) => parseInt(e.period.match(/\d{4}/)?.[0] ?? "", 10))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b)[0]

  // A derived metric is only shown when it actually counts something.
  // TODO(Seya): labels that need context, e.g. "Properties managed 150+",
  // should be reworded in /admin/settings so a stranger understands them.
  const heroMetrics =
    settings.heroMetrics.length > 0
      ? settings.heroMetrics
      : [
          ...(projects.length > 0
            ? [{ value: String(projects.length), label: copy.home.metricProjects }]
            : []),
          ...(experience.length > 0
            ? [{ value: String(experience.length), label: copy.home.metricEmployers }]
            : []),
          ...(firstYear
            ? [
                {
                  value: copy.home.metricSinceValue(firstYear),
                  label: copy.home.metricSince,
                },
              ]
            : []),
        ]

  const current = experience.find((e) => e.current)
  const arrow = <ArrowRight className="h-[0.9em] w-[0.9em]" aria-hidden="true" />

  const stations: JourneyStation[] = [
    {
      key: "services",
      kind: "windmill",
      label: copy.nav.services,
      title: services.servicesHeading,
      children: (
        <>
          <p>{homeCopy.complement}</p>
          <ul className={stage.rows}>
            {services.services.map((service) => (
              <li key={service.key}>
                <strong>
                  <Link href={servicePath(service.key, locale)}>{service.title}</Link>
                </strong>
                <span>{service.text}</span>
              </li>
            ))}
          </ul>
          <p>{homeCopy.serviceArea}</p>
        </>
      ),
    },
    ...selectedProjects.map((project, i) => ({
      key: project.slug,
      kind: PROJECT_LANDMARKS[project.slug] ?? SPARE_LANDMARKS[i % SPARE_LANDMARKS.length],
      label: copy.home.workLabel,
      title: project.title,
      children: (
        <>
          <p>{project.shortDescription}</p>
          {project.tags.length > 0 && (
            <ul className={stage.tags}>
              {project.tags.slice(0, 4).map((tag) => (
                <li key={tag}>{tag}</li>
              ))}
            </ul>
          )}
          <Link href={localizePath(`/projects/${project.slug}`, locale)} className={stage.go}>
            {copy.home.viewProject}
            {arrow}
          </Link>
        </>
      ),
    })),
    {
      key: "about",
      kind: "tree",
      label: copy.home.introLabel,
      title: copy.home.introTitle,
      children: (
        <>
          <p>{copy.home.introLead}</p>
          <p>{copy.home.introBody}</p>
          {heroMetrics.length > 0 && (
            <dl className={stage.figures}>
              {heroMetrics.map((metric) => (
                <div key={metric.label}>
                  <dt>{metric.label}</dt>
                  <dd>{metric.value}</dd>
                </div>
              ))}
            </dl>
          )}
          <ul className={stage.tags}>
            {copy.common.expertiseAreas.map((area) => (
              <li key={area.category}>{area.category}</li>
            ))}
          </ul>
          <Link href={localizePath("/about", locale)} className={stage.go}>
            {copy.nav.about}
            {arrow}
          </Link>
        </>
      ),
    },
    ...(experience.length > 0
      ? [
          {
            key: "career",
            kind: "pagoda" as const,
            floors: experience.length,
            label: copy.home.careerLabel,
            title: copy.home.careerTitle,
            children: (
              <>
                {current && <p>{copy.home.currentRole(current.role, current.company)}</p>}
                <ul className={`${stage.rows} ${stage.split}`}>
                  {experience.map((entry) => (
                    <li key={entry.company}>
                      <strong>{entry.company}</strong>
                      <small>{entry.period}</small>
                      <span>{entry.role}</span>
                    </li>
                  ))}
                </ul>
                <Link href={localizePath("/career", locale)} className={stage.go}>
                  {copy.home.fullCareer}
                  {arrow}
                </Link>
              </>
            ),
          },
        ]
      : []),
    // Only questions with a finished answer. Pricing, prototype time and code
    // ownership wait for TODO(Seya) in content/home.
    ...(homeCopy.faq.length > 0
      ? [
          {
            key: "faq",
            kind: "lanterns" as const,
            label: "FAQ",
            title: serviceLabels.faq,
            children: (
              <div>
                {homeCopy.faq.map((entry) => (
                  <details key={entry.q}>
                    <summary>{entry.q}</summary>
                    <p>{entry.a}</p>
                  </details>
                ))}
              </div>
            ),
          },
        ]
      : []),
  ]

  // The bar sits on the scene for as long as the stage is under it.
  const heroRef = useRef<HTMLDivElement>(null)
  const overHero = useInView(heroRef, { margin: "0px 0px -90% 0px", initial: true })

  return (
    <div className="bg-ground" data-site="portfolio" data-ends-dark="" data-own-ask="">
      <Navigation overlay={overHero} />

      <div ref={heroRef}>
        <JourneyStage
          stations={stations}
          projectCount={selectedProjects.length}
          services={services.services.map((service) => ({
            key: service.key,
            label: service.linkLabel,
            href: servicePath(service.key, locale),
          }))}
          location={settings.contactLocation || copy.common.locationFallback}
          status={
            settings.heroAvailable
              ? settings.heroAvailabilityLabel || copy.home.availabilityFallback
              : undefined
          }
          email={settings.contactEmail || "info@sweber.dev"}
          legal={[
            { label: copy.nav.projects, href: localizePath("/projects", locale) },
            { label: copy.nav.imprint, href: localizePath("/imprint", locale) },
            { label: copy.nav.privacy, href: localizePath("/privacy", locale) },
          ]}
        />
      </div>
    </div>
  )
}
