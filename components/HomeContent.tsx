"use client"

import Link from "next/link"
import { useRef } from "react"
import { ArrowDown, ArrowUpRight } from "lucide-react"
import { motion, useInView, useReducedMotion, type Variants } from "framer-motion"
import Navigation from "./Navigation"
import { ProjectListItem } from "./ProjectListItem"
import type { SiteSettings } from "@/lib/data"
import { BLOG_ENABLED, CASE_STUDIES_ENABLED } from "@/lib/features"

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

const expertise = [
  {
    category: "Development",
    skills: ["C#", ".NET", "TypeScript", "React", "Next.js", "SQL", "REST APIs", "Python"],
  },
  {
    category: "Project Management",
    skills: [
      "Agile / Scrum",
      "Stakeholder Management",
      "Requirements Engineering",
      "Risk Management",
    ],
  },
  {
    category: "Tools & Platforms",
    skills: ["Azure DevOps", "Git", "Docker", "Vercel", "Jira", "Supabase"],
  },
]

// ── Motion ────────────────────────────────────────────
const EASE = [0.23, 1, 0.32, 1] as const

function Reveal({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-72px" })
  const reduce = useReducedMotion()

  return (
    <motion.section
      ref={ref}
      className={className}
      initial={reduce ? false : { opacity: 0, y: 8 }}
      animate={reduce || inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
      transition={{ duration: 0.42, ease: EASE, delay }}
    >
      {children}
    </motion.section>
  )
}

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
  const reduce = useReducedMotion()
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

  const heroMetrics =
    settings.heroMetrics.length > 0
      ? settings.heroMetrics
      : [
          { value: String(projects.length), label: "Projekte geliefert" },
          { value: String(experience.length), label: "Arbeitgeber" },
          ...(firstYear ? [{ value: `seit ${firstYear}`, label: "im Feld" }] : []),
        ]

  const current = experience.find((e) => e.current)

  return (
    <div className="min-h-screen bg-ground">
      <Navigation />

      {/* ─── Hero ─── */}
      <section className="relative flex min-h-[88vh] flex-col justify-center overflow-hidden pt-24">
        <div className="sheet flex w-full flex-col gap-10">
          <motion.div
            className="flex flex-col gap-5"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.05 }}
          >
            {settings.heroAvailable && (
              <span className="tab self-start">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-signal-bright opacity-40 motion-safe:animate-ping" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-signal-bright" />
                </span>
                <span className="annotate">
                  {settings.heroAvailabilityLabel || "Verfügbar für Projekte"}
                </span>
              </span>
            )}

            <h1
              className="font-display font-bold leading-[0.94] tracking-tight text-balance"
              style={{ fontSize: "clamp(3rem, 7.5vw, 6.5rem)" }}
            >
              Seya Weber
            </h1>

            <p className="text-xl text-fg md:text-2xl">
              {settings.currentRole || "Project Manager & Software Developer"}
              {settings.currentEmployer && (
                <span className="text-fg-muted"> · {settings.currentEmployer}</span>
              )}
            </p>

            <p className="measure text-base leading-relaxed text-fg-muted">
              Ich baue schlanke digitale Lösungen in{" "}
              {settings.contactLocation || "St. Gallen, Schweiz"} — von
              Automatisierungs-Workflows bis zu Full-Stack-Anwendungen.
            </p>
          </motion.div>

          {/* Metrics as cast tiles: the first real objects on the page. */}
          {heroMetrics.length > 0 && (
            <motion.div
              className="flex flex-wrap gap-4"
              initial={reduce ? false : { opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE, delay: 0.14 }}
            >
              {heroMetrics.map((metric) => (
                <div
                  key={metric.label}
                  className="cast rim flex min-w-[9.5rem] flex-1 flex-col gap-1 p-5"
                >
                  <span className="font-display text-3xl font-bold tracking-tight tabular md:text-4xl">
                    {metric.value}
                  </span>
                  <span className="annotate">{metric.label}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>

        <motion.div
          className="sheet mt-14 flex items-center gap-2 text-fg-subtle"
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <span className="annotate">Scroll</span>
          <motion.span
            animate={reduce ? {} : { y: [0, 4, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="h-3.5 w-3.5" aria-hidden="true" />
          </motion.span>
        </motion.div>
      </section>

      {/* ─── Introduction ─── */}
      <Reveal className="py-20 md:py-28">
        <div className="sheet flex flex-col gap-6">
          <span className="annotate">Kurz gesagt</span>
          <h2 className="sr-only">Einführung</h2>
          <p className="measure text-xl leading-relaxed md:text-2xl">
            Ich übersetze komplexe operative Anforderungen in schlanke, wartbare
            Software — und weil ich beide Seiten gelernt habe, verstehe ich sowohl
            die Anforderung als auch das System, das sie erfüllen muss.
          </p>
          <p className="measure leading-relaxed text-fg-muted">
            Mein Weg lief über Elektroplanung, Energieoptimierung,
            Healthcare-Technologie und SaaS-Entwicklung. Diese Breite ist der Grund,
            warum ich in Projekten meist die Übersetzungsarbeit zwischen Fachbereich
            und Technik übernehme.
          </p>
          {current && (
            <p className="annotate">
              Aktuell · {current.role} bei {current.company}
            </p>
          )}
        </div>
      </Reveal>

      {/* ─── Selected Work ─── */}
      <Reveal className="py-20 md:py-28">
        <div className="sheet flex flex-col gap-10">
          <div className="flex flex-wrap items-baseline justify-between gap-4">
            <div className="flex flex-col gap-2">
              <span className="annotate">
                Ausgewählte Arbeit · {projects.length}{" "}
                {projects.length === 1 ? "Projekt" : "Projekte"}
              </span>
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                Selected Work
              </h2>
            </div>
            <Link
              href="/projects"
              className="control inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
            >
              Alle Projekte
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>

          {selectedProjects.length > 0 ? (
            <div className="grid gap-5 sm:grid-cols-2">
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
            <div className="well p-10 text-center text-sm text-fg-muted">
              Noch keine Projekte hinterlegt.
            </div>
          )}
        </div>
      </Reveal>

      {/* ─── Expertise ─── */}
      <Reveal className="py-20 md:py-28">
        <div className="sheet flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <span className="annotate">Expertise · {expertise.length} Bereiche</span>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              Expertise
            </h2>
          </div>

          <Stagger className="flex flex-col gap-4">
            {expertise.map((area) => (
              <motion.div key={area.category} variants={item} className="cast rim def-grid p-6">
                <h3 className="font-display text-sm font-semibold md:text-base">
                  {area.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {area.skills.map((skill) => (
                    <span
                      key={skill}
                      className="well-sm px-2.5 py-1 font-mono text-xs text-fg-muted"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </Stagger>
        </div>
      </Reveal>

      {/* ─── Experience ─── */}
      {experience.length > 0 && (
        <Reveal className="py-20 md:py-28">
          <div className="sheet flex flex-col gap-10">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <div className="flex flex-col gap-2">
                <span className="annotate">
                  Werdegang · {experience.length} Stationen
                  {firstYear ? ` · seit ${firstYear}` : ""}
                </span>
                <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                  Experience
                </h2>
              </div>
              <Link
                href="/experience"
                className="control inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
              >
                Vollständiger Werdegang
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>

            {/* A sunken channel with the stations seated in it. */}
            <Stagger className="well flex flex-col gap-2 p-3 md:p-4">
              {experience.map((entry) => (
                <motion.div
                  key={entry.company}
                  variants={item}
                  className={
                    "flex flex-col gap-1 rounded-lg px-4 py-3.5 md:flex-row md:items-center " +
                    (entry.current ? "cast-sm" : "")
                  }
                >
                  <div className="flex items-center gap-2.5 md:flex-1">
                    {entry.current && (
                      <span
                        className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal-bright"
                        aria-hidden="true"
                      />
                    )}
                    <span
                      className={
                        "font-semibold " +
                        (entry.current ? "text-signal" : "md:ml-4")
                      }
                    >
                      {entry.company}
                    </span>
                  </div>
                  <span className="text-sm text-fg-muted md:flex-1">{entry.role}</span>
                  <span className="annotate md:text-right">{entry.period}</span>
                </motion.div>
              ))}
            </Stagger>
          </div>
        </Reveal>
      )}

      {/* ─── Testimonial ─── */}
      {featuredTestimonial && (
        <Reveal className="py-20 md:py-28">
          <div className="sheet flex flex-col gap-10">
            <div className="flex flex-col gap-2">
              <span className="annotate">Referenz</span>
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                What partners say
              </h2>
            </div>

            <div className="cast rim max-w-3xl p-8 md:p-10">
              <blockquote className="font-display text-2xl leading-relaxed md:text-3xl">
                &ldquo;{featuredTestimonial.testimonialQuote}&rdquo;
              </blockquote>
              <div className="mt-7 flex flex-col gap-0.5">
                <p className="font-semibold">{featuredTestimonial.testimonialAuthor}</p>
                <p className="annotate">{featuredTestimonial.testimonialCompany}</p>
              </div>
              <Link
                href={`/case-studies/${featuredTestimonial.slug}`}
                className="link-underline mt-6 inline-block text-sm font-medium text-signal"
              >
                Case Study lesen &rarr;
              </Link>
            </div>
          </div>
        </Reveal>
      )}

      {/* ─── Writing ─── */}
      {latestPosts.length > 0 && (
        <Reveal className="py-20 md:py-28">
          <div className="sheet flex flex-col gap-10">
            <div className="flex flex-col gap-2">
              <span className="annotate">Writing · {latestPosts.length}</span>
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                Writing
              </h2>
            </div>

            <Stagger className="well flex flex-col gap-2 p-3 md:p-4">
              {latestPosts.map((post) => (
                <motion.div key={post.slug} variants={item}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="group flex flex-col gap-1 rounded-lg px-4 py-3.5 transition-colors duration-150 hover:bg-plate md:flex-row md:items-center md:gap-6"
                  >
                    <h3 className="font-semibold transition-colors duration-150 group-hover:text-signal md:flex-1">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className="annotate">
                        {new Date(post.publishedAt).toLocaleDateString("de-CH", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span className="annotate">{post.readTime}</span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </Stagger>

            <Link
              href="/blog"
              className="link-underline self-start text-sm font-medium text-signal"
            >
              Alle Artikel &rarr;
            </Link>
          </div>
        </Reveal>
      )}
    </div>
  )
}
