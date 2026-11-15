"use client"

import Link from "next/link"
import { useRef } from "react"
import { ArrowUpRight, ChevronRight } from "lucide-react"
import { motion, useInView, useReducedMotion, type Variants } from "framer-motion"
import Navigation from "./Navigation"
import SheetStage from "./hero/SheetStage"
import { Block } from "./site/Block"
import { ProjectListItem } from "./ProjectListItem"
import { EmptyState } from "./EmptyState"
import type { SiteSettings } from "@/lib/data"
import { BLOG_ENABLED, CASE_STUDIES_ENABLED } from "@/lib/features"
import { useCopy, useLocale } from "@/components/LocaleProvider"
import { localizePath } from "@/lib/i18n"
import { FaqList } from "./site/FaqList"
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

// ── Motion ────────────────────────────────────────────
const EASE = [0.23, 1, 0.32, 1] as const

function Stagger({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-56px" })
  const reduce = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: reduce ? 0 : 0.028 } },
      }}
    >
      {children}
    </motion.div>
  )
}

// Offset is horizontal. A vertical stagger down a vertical list reads as the
// whole list sagging.
const item: Variants = {
  hidden: { opacity: 0, x: -4 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.32, ease: EASE } },
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

// ── Component ────────────────────────────────────────
export default function HomeContent({
  projects,
  experience,
  blogPosts,
  caseStudies,
  settings,
}: HomeContentProps) {
  const copy = useCopy()
  const locale = useLocale()
  const expertise = copy.common.expertiseAreas
  const homeCopy = locale === "de" ? homeDe : homeEn
  const services = servicesOverview(locale)
  const serviceLabels = servicesLabels(locale)
  // Should none of the slugs exist (a renamed entry), the stage still has
  // its first two sheets.
  const chosen = projects.filter((p) => HOME_PROJECTS.includes(p.slug))
  const selectedProjects = chosen.length > 0 ? chosen : projects.slice(0, 2)

  const featuredPosts = blogPosts.filter((p) => p.featured)
  const sortedByDate = [...blogPosts].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
  const newestDate = sortedByDate[0]
    ? new Date(sortedByDate[0].publishedAt).getTime()
    : 0
  const monthsSinceNewest = newestDate
    ? (Date.now() - newestDate) / (1000 * 60 * 60 * 24 * 30)
    : Infinity
  const blogIsFresh = monthsSinceNewest <= 12

  const latestPosts = !BLOG_ENABLED
    ? []
    : featuredPosts.length > 0
      ? featuredPosts.slice(0, 2)
      : blogIsFresh
        ? sortedByDate.slice(0, 2)
        : []

  const featuredTestimonial = CASE_STUDIES_ENABLED
    ? (caseStudies.find(
        (cs) =>
          cs.testimonialQuote &&
          cs.testimonialAuthor.trim() &&
          cs.testimonialCompany.trim()
      ) ?? null)
    : null

  // Derived fallback metrics. Every number traces to a row that exists, so an
  // empty site_settings row cannot produce a claim the content does not back.
  const firstYear = experience
    .map((e) => parseInt(e.period.match(/\d{4}/)?.[0] ?? "", 10))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b)[0]

  // A derived metric is only shown when it actually counts something. Rendering
  // "0 Projects delivered" on an unseeded database is worse than rendering
  // nothing, and the tiles are the first objects a visitor sees.
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

  // The bar sits on the hero's signal field for as long as the hero is
  // under it, and takes the paper look once the page below has arrived.
  const heroRef = useRef<HTMLDivElement>(null)
  const overHero = useInView(heroRef, { margin: "0px 0px -90% 0px", initial: true })

  const pillLink = "control inline-flex items-center gap-1 self-start py-2 pr-3 pl-4 text-sm"

  return (
    <div className="min-h-screen bg-ground" data-site="portfolio">
      <Navigation overlay={overHero} />

      <div ref={heroRef}>
        <SheetStage
          projects={selectedProjects}
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
        />
      </div>

      {/* Runs sideways with the scroll. The words are the services and the
          projects, both of which are real links further down. */}
      <div className="band" aria-hidden="true">
        <p>
          {[...services.services, ...services.services].map((service, i) => (
            <span key={i}>{service.linkLabel}</span>
          ))}
        </p>
        {selectedProjects.length > 0 && (
          <p>
            {[...selectedProjects, ...selectedProjects, ...selectedProjects].map((project, i) => (
              <span key={i}>{project.title}</span>
            ))}
          </p>
        )}
      </div>

      {/* What the hero shows in pictures, said once in a sentence, with the
          figures from site_settings. */}
      <section className="sheet flex flex-col gap-10 py-20 md:py-28">
        <p className="max-w-[24ch] text-[clamp(1.75rem,3.6vw,3.25rem)] leading-[1.05] font-medium tracking-[-0.03em]">
          {copy.home.heroOffer}
          <span className="headline-sub">{copy.home.heroPerson}</span>
        </p>
        {/* TODO(Seya): tiles render settings.heroMetrics (DB). Labels that need
            context, e.g. "Properties managed 150+", should be reworded in /admin/settings
            so a stranger understands them (what, for whom, over what period). */}
        {heroMetrics.length > 0 && (
          <dl className="grid grid-cols-1 divide-y divide-edge-soft border-y border-edge-soft sm:grid-cols-3 sm:divide-x sm:divide-y-0">
            {heroMetrics.map((metric) => (
              <div key={metric.label} className="flex flex-col gap-1 py-6 sm:px-6 sm:first:pl-0">
                <dt className="annotate order-2">{metric.label}</dt>
                <dd className="order-1 text-3xl tracking-tight tabular">{metric.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </section>

      <div>
        {/* ─── Services: what is offered, to whom, where. The hero carries the
            first two sentences of the opening paragraph, so this adds the rest. ─── */}
        <Block
          label={copy.nav.services}
          title={services.servicesHeading}
          lede={
            <>
              <p>{homeCopy.complement}</p>
              <p>{homeCopy.serviceArea}</p>
            </>
          }
        >
          <ul className="border-t border-edge-soft">
            {services.services.map((service) => (
              <li key={service.key} className="def-grid border-b border-edge-soft py-5">
                <h3 className="text-lg tracking-tight">
                  <Link
                    href={servicePath(service.key, locale)}
                    className="link-underline hover:text-fg-muted"
                  >
                    {service.title}
                  </Link>
                </h3>
                <p className="text-sm leading-relaxed text-fg-muted">{service.text}</p>
              </li>
            ))}
          </ul>
        </Block>

        {/* ─── Introduction ─── */}
        <Block
          label={copy.home.introLabel}
          title={copy.home.introTitle}
          sub={copy.home.introSub}
          lede={
            <>
              <p>{copy.home.introLead}</p>
              <p>{copy.home.introBody}</p>
              {current && (
                <p className="annotate">{copy.home.currentRole(current.role, current.company)}</p>
              )}
            </>
          }
        />

        {/* ─── Selected Work ─── */}
        <Block
          label={copy.home.workLabel}
          title={copy.home.workTitle}
          sub={copy.home.workSub}
          aside={
            <Link href={localizePath("/projects", locale)} className={pillLink}>
              {copy.projects.allProjects}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          }
        >
          {selectedProjects.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {selectedProjects.map((project, i) => (
                <ProjectListItem
                  key={project.slug}
                  project={project}
                  index={i}
                  imageSrc={project.imageSrc ?? null}
                  priority={i < 2}
                />
              ))}
            </div>
          ) : (
            <EmptyState>{copy.projects.empty}</EmptyState>
          )}
        </Block>

        {/* ─── Expertise ─── */}
        <Block
          label={copy.home.expertiseLabel}
          title={copy.home.expertiseTitle}
          sub={copy.home.expertiseSub}
        >
          <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
            {expertise.map((area) => (
              <motion.div
                key={area.category}
                variants={item}
                className="cast flex flex-col gap-5 p-6 md:p-7"
              >
                <h3 className="text-lg tracking-tight">{area.category}</h3>
                <ul className="flex flex-wrap gap-1.5">
                  {area.skills.map((skill) => (
                    <li key={skill} className="tab text-xs text-fg-muted">
                      {skill}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </Stagger>
        </Block>

        {/* ─── Experience ─── */}
        {experience.length > 0 && (
          <Block
            label={copy.home.careerLabel}
            title={copy.home.careerTitle}
            sub={copy.home.careerSub(firstYear)}
            aside={
              <Link href={localizePath("/career", locale)} className={pillLink}>
                {copy.home.fullCareer}
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            }
          >
            <Stagger className="flex flex-col border-t border-edge-soft">
              {experience.map((entry) => (
                <motion.div
                  key={entry.company}
                  variants={item}
                  className="grid gap-1 border-b border-edge-soft py-5 md:grid-cols-[1fr_1fr_auto] md:items-baseline md:gap-6"
                >
                  <span className="flex items-center gap-2.5">
                    {entry.current && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal" aria-hidden="true" />
                    )}
                    <span>{entry.company}</span>
                  </span>
                  <span className="text-sm text-fg-muted">{entry.role}</span>
                  <span className="annotate md:text-right">{entry.period}</span>
                </motion.div>
              ))}
            </Stagger>
          </Block>
        )}

        {/* ─── Testimonial ─── */}
        {featuredTestimonial && (
          <Block
            label={copy.home.referenceLabel}
            title={copy.home.testimonials}
            sub={copy.home.referenceSub}
          >
            <figure className="cast flex flex-col gap-8 p-8 md:p-12">
              <blockquote className="text-2xl leading-snug tracking-tight md:text-3xl">
                &ldquo;{featuredTestimonial.testimonialQuote}&rdquo;
              </blockquote>
              <figcaption className="flex flex-wrap items-end justify-between gap-4">
                <span className="flex flex-col">
                  <span>{featuredTestimonial.testimonialAuthor}</span>
                  <span className="text-sm text-fg-muted">
                    {featuredTestimonial.testimonialCompany}
                  </span>
                </span>
                <Link
                  href={`/case-studies/${featuredTestimonial.slug}`}
                  className="link-underline text-sm text-fg-muted hover:text-fg"
                >
                  {copy.home.readCaseStudy} &rarr;
                </Link>
              </figcaption>
            </figure>
          </Block>
        )}

        {/* ─── Writing ─── */}
        {latestPosts.length > 0 && (
          <Block
            label={copy.home.writingLabel}
            title={copy.home.writingTitle}
            sub={copy.home.writingSub}
            aside={
              <Link href="/blog" className={pillLink}>
                {copy.blog.allArticles}
                <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            }
          >
            <Stagger className="flex flex-col border-t border-edge-soft">
              {latestPosts.map((post) => (
                <motion.div key={post.slug} variants={item}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col gap-1 border-b border-edge-soft py-5 md:flex-row md:items-baseline md:gap-6"
                  >
                    <h3 className="text-fg transition-opacity duration-150 group-hover:opacity-70 md:flex-1">
                      {post.title}
                    </h3>
                    <span className="annotate">
                      {new Date(post.publishedAt).toLocaleDateString(copy.common.dateLocale, {
                        month: "short",
                        year: "numeric",
                      })}{" "}
                      · {post.readTime}
                    </span>
                    <ArrowUpRight
                      className="hidden h-4 w-4 text-fg-subtle transition-colors group-hover:text-fg md:block"
                      aria-hidden="true"
                    />
                  </Link>
                </motion.div>
              ))}
            </Stagger>
          </Block>
        )}

        {/* ─── FAQ: only questions with a finished answer. Pricing, prototype
            time and code ownership wait for TODO(Seya) in content/home. ─── */}
        {homeCopy.faq.length > 0 && (
          <Block label="FAQ" title={serviceLabels.faq}>
            <FaqList items={homeCopy.faq} />
          </Block>
        )}

        {/* The closing call to action is the footer's opening line. */}
      </div>
    </div>
  )
}
