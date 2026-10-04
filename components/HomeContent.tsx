"use client"

import Link from "next/link"
import { useRef } from "react"
import { ArrowUpRight, ChevronRight } from "lucide-react"
import { motion, useInView, useReducedMotion, type Variants } from "framer-motion"
import Navigation from "./Navigation"
import Hero from "./site/Hero"
import { Block } from "./site/Block"
import { ProjectListItem } from "./ProjectListItem"
import { EmptyState } from "./EmptyState"
import type { SiteSettings } from "@/lib/data"
import { BLOG_ENABLED, CASE_STUDIES_ENABLED } from "@/lib/features"
import { copy } from "@/lib/copy"

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

const expertise = copy.common.expertiseAreas

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

// ── Component ────────────────────────────────────────
export default function HomeContent({
  projects,
  experience,
  blogPosts,
  caseStudies,
  settings,
}: HomeContentProps) {
  const selectedProjects = projects.slice(0, 6)

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

  const thisYear = new Date().getFullYear()
  const startYear = firstYear && firstYear < thisYear ? firstYear : thisYear - 8
  const years = Array.from({ length: thisYear - startYear + 1 }, (_, i) => String(startYear + i))
  // A few from each area, so the strip reads as a range rather than one list.
  const skills = expertise
    .flatMap((area) => (area.skills as readonly string[]).filter((s) => s.length <= 12).slice(0, 3))
    .slice(0, 12)

  const pillLink = "control inline-flex items-center gap-1 self-start py-2 pr-3 pl-4 text-sm"

  return (
    <div className="min-h-screen bg-ground">
      <Navigation />

      <Hero settings={settings} metrics={heroMetrics} years={years} skills={skills} />

      <div className="mt-24 md:mt-32">
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
            <Link href="/projects" className={pillLink}>
              {copy.projects.allProjects}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          }
        >
          {selectedProjects.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
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
          <Stagger className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
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
              <Link href="/career" className={pillLink}>
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

        {/* ─── Closing call to action ─── */}
        <section className="block">
          <div className="sheet flex flex-col items-center gap-8 py-8 text-center md:py-12">
            <p className="annotate">{copy.home.ctaEyebrow}</p>
            <h2 className="display">{copy.home.ctaTitle}</h2>
            <Link
              href="/contact"
              className="control control-primary inline-flex items-center gap-1 py-2.5 pr-4 pl-5 text-sm"
            >
              {copy.home.ctaButton}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
