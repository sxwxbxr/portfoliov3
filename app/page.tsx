"use client"

import Link from "next/link"
import Navigation from "../components/Navigation"
import { ProjectListItem } from "../components/ProjectListItem"
import { projects, blogPosts, caseStudies } from "../src/config"
import { motion, useInView, useReducedMotion, type Variants } from "framer-motion"
import { useRef } from "react"
import { ArrowDown } from "lucide-react"
import { CursorSpotlight } from "../components/CursorSpotlight"

// ── Data ──────────────────────────────────────────────
const selectedProjects = projects.slice(0, 6)
const latestPosts = blogPosts.slice(0, 2)
const featuredTestimonial = caseStudies.find((cs) => cs.testimonial)!

const experience = [
  {
    company: "Telsonic AG",
    role: "Project Manager & Software Developer",
    period: "2024 -- Present",
    current: true,
  },
  {
    company: "INNOFORCE Est.",
    role: "Software Developer",
    period: "2023 -- 2024",
    current: false,
  },
  {
    company: "Credit Suisse (ISS)",
    role: "Energy Optimization Planner",
    period: "2021 -- 2022",
    current: false,
  },
  {
    company: "Bettermann AG",
    role: "Electrical Planner",
    period: "2019 -- 2021",
    current: false,
  },
]

const expertise = [
  {
    category: "Development",
    skills: "C#, .NET, TypeScript, React, Next.js, SQL, REST APIs, Python",
  },
  {
    category: "Project Management",
    skills:
      "Agile / Scrum, Stakeholder Management, Requirements Engineering, Risk Management",
  },
  {
    category: "Tools & Platforms",
    skills: "Azure DevOps, Git, Docker, Vercel, Jira, Supabase",
  },
]

// ── Animation helpers ─────────────────────────────────
const sectionTransition = {
  duration: 0.6,
  ease: [0.16, 1, 0.3, 1] as const,
}

function Section({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-80px" })
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.section
      ref={ref}
      className={className}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={
        prefersReducedMotion
          ? { opacity: 1, y: 0 }
          : isInView
            ? { opacity: 1, y: 0 }
            : { opacity: 0, y: 20 }
      }
      transition={{ ...sectionTransition, delay }}
    >
      {children}
    </motion.section>
  )
}

function StaggerChildren({
  children,
  className = "",
  staggerDelay = 0.05,
}: {
  children: React.ReactNode
  className?: string
  staggerDelay?: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-60px" })
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

const staggerChildVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
}

// ── Page ──────────────────────────────────────────────
export default function Home() {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      className="min-h-screen bg-background grain-overlay"
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Navigation />

      {/* ─── Section 1: Hero ─── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        {/* Cursor spotlight — desktop only */}
        <CursorSpotlight />

        {/* Subtle radial gradient background */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 50% 50%, var(--primary) 0%, transparent 70%)",
            opacity: 0.04,
          }}
        />

        <div className="max-w-[1200px] mx-auto px-6 w-full">
          {/* Hero title — staggered line-by-line entrance */}
          <div className="overflow-hidden">
            <motion.h1
              className="font-display font-bold tracking-tight leading-[0.95]"
              style={{ fontSize: "clamp(3.5rem, 8vw, 7rem)" }}
              initial={prefersReducedMotion ? false : { opacity: 0, y: 60, clipPath: "inset(100% 0 0 0)" }}
              animate={{ opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)" }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.1,
              }}
            >
              Seya Weber
            </motion.h1>
          </div>

          <div className="overflow-hidden">
            <motion.p
              className="mt-4 text-lg md:text-xl text-muted-foreground"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 30, clipPath: "inset(100% 0 0 0)" }}
              animate={{ opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)" }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.16,
              }}
            >
              Project Manager & Software Developer
            </motion.p>
          </div>

          <div className="overflow-hidden">
            <motion.p
              className="mt-3 text-base text-muted-foreground/80 max-w-lg"
              initial={prefersReducedMotion ? false : { opacity: 0, y: 24, clipPath: "inset(100% 0 0 0)" }}
              animate={{ opacity: 1, y: 0, clipPath: "inset(0% 0 0 0)" }}
              transition={{
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
                delay: 0.22,
              }}
            >
              Building lean digital solutions in St. Gallen, Switzerland.
            </motion.p>
          </div>
        </div>

        {/* Bottom-left: availability indicator */}
        <motion.div
          className="absolute bottom-8 left-6 md:left-[max(1.5rem,calc((100vw-1200px)/2+1.5rem))] flex items-center gap-2.5"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-500 opacity-40" />
            <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-green-500" />
          </span>
          <span className="text-xs text-muted-foreground">
            Available for projects
          </span>
        </motion.div>

        {/* Bottom-right: scroll indicator */}
        <motion.div
          className="absolute bottom-8 right-6 md:right-[max(1.5rem,calc((100vw-1200px)/2+1.5rem))] flex items-center gap-2 text-muted-foreground"
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <span className="text-xs">Scroll</span>
          <motion.div
            animate={prefersReducedMotion ? {} : { y: [0, 4, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── Section 2: Introduction ─── */}
      <Section className="py-24 md:py-32 border-t border-border">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_0.6fr] gap-16 md:gap-12">
            {/* Left — editorial copy */}
            <div>
              <p className="text-xl md:text-2xl leading-relaxed text-foreground/90">
                I&apos;m a project manager and developer based in St.&nbsp;Gallen,
                Switzerland. I specialize in turning complex operational needs
                into lean, maintainable digital solutions&thinsp;&mdash;&thinsp;from
                custom automation workflows to full-stack applications.
              </p>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground">
                With a background spanning electrical planning, energy
                optimization, healthcare technology, and SaaS development, I
                bring an unusual breadth of context to every project I touch.
              </p>
            </div>

            {/* Right — metrics */}
            <div className="flex flex-col gap-8 md:border-l md:border-border md:pl-12">
              {[
                { value: `${projects.length}+`, label: "Projects Delivered" },
                { value: "3+", label: "Years Experience" },
                { value: "5+", label: "Technologies" },
              ].map((metric) => (
                <div key={metric.label}>
                  <span className="font-display text-4xl md:text-5xl font-bold tracking-tight">
                    {metric.value}
                  </span>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {metric.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* ─── Section 3: Selected Work ─── */}
      <Section className="py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-12">
            Selected Work
          </h2>

          <div>
            {selectedProjects.map((project, i) => (
              <ProjectListItem key={project.slug} project={project} index={i} />
            ))}
            {/* Bottom border on last item */}
            <div className="border-t border-border" />
          </div>

          <div className="mt-8">
            <Link
              href="/projects"
              className="link-underline text-primary text-sm font-medium"
            >
              View all projects &rarr;
            </Link>
          </div>
        </div>
      </Section>

      {/* ─── Section 4: Expertise ─── */}
      <Section className="py-24 md:py-32 border-t border-border">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-16">
            Expertise
          </h2>

          <StaggerChildren className="space-y-0" staggerDelay={0.06}>
            {expertise.map((area, i) => (
              <motion.div
                key={area.category}
                variants={staggerChildVariants}
                className={`grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-12 py-6 ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <h3 className="font-display font-semibold text-sm md:text-base md:sticky md:top-24">
                  {area.category}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {area.skills}
                </p>
              </motion.div>
            ))}
            <div className="border-t border-border" />
          </StaggerChildren>
        </div>
      </Section>

      {/* ─── Section 5: Experience ─── */}
      <Section className="py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-12">
            Experience
          </h2>

          <StaggerChildren staggerDelay={0.05}>
            {experience.map((entry, i) => (
              <motion.div
                key={entry.company}
                variants={staggerChildVariants}
                className={`flex flex-col md:flex-row md:items-center gap-1 md:gap-0 py-4 ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <div className="flex items-center gap-2.5 md:flex-1">
                  {entry.current && (
                    <span className="relative flex h-2 w-2 shrink-0">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                    </span>
                  )}
                  <span
                    className={`font-semibold ${
                      !entry.current ? "md:ml-[18px]" : ""
                    }`}
                  >
                    {entry.company}
                  </span>
                </div>
                <span className="text-muted-foreground text-sm md:flex-1">
                  {entry.role}
                </span>
                <span className="font-mono text-sm text-muted-foreground md:text-right">
                  {entry.period}
                </span>
              </motion.div>
            ))}
            <div className="border-t border-border" />
          </StaggerChildren>

          <div className="mt-8">
            <Link
              href="/about"
              className="link-underline text-primary text-sm font-medium"
            >
              More about me &rarr;
            </Link>
          </div>
        </div>
      </Section>

      {/* ─── Section 6: Testimonial ─── */}
      <Section className="py-24 md:py-32 border-t border-border">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-16">
            What partners say
          </h2>

          <div className="max-w-3xl">
            <div className="text-muted-foreground/30 font-display text-6xl md:text-7xl leading-none select-none mb-6">
              &ldquo;
            </div>
            <blockquote className="text-2xl md:text-3xl font-display leading-relaxed -mt-10">
              {featuredTestimonial.testimonial?.quote}
            </blockquote>
            <div className="mt-8">
              <p className="font-semibold">
                {featuredTestimonial.testimonial?.author}
              </p>
              <p className="text-sm text-muted-foreground">
                {featuredTestimonial.testimonial?.company}
              </p>
            </div>
            <div className="mt-6">
              <Link
                href={`/case-studies/${featuredTestimonial.slug}`}
                className="link-underline text-primary text-sm font-medium"
              >
                Read case study &rarr;
              </Link>
            </div>
          </div>
        </div>
      </Section>

      {/* ─── Section 7: Writing ─── */}
      <Section className="py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-12">
            Writing
          </h2>

          <StaggerChildren staggerDelay={0.06}>
            {latestPosts.map((post, i) => (
              <motion.div key={post.id} variants={staggerChildVariants}>
                <Link
                  href={`/blog/${post.id}`}
                  className="group block"
                >
                  <div
                    className={`flex flex-col md:flex-row md:items-center gap-1 md:gap-6 py-5 ${
                      i > 0 ? "border-t border-border" : ""
                    }`}
                  >
                    <h3 className="font-semibold md:flex-1 group-hover:text-primary transition-colors duration-200">
                      {post.title}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-mono">
                        {new Date(post.publishedAt).toLocaleDateString("en-US", {
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                      <span>{post.readTime}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            <div className="border-t border-border" />
          </StaggerChildren>

          <div className="mt-8">
            <Link
              href="/blog"
              className="link-underline text-primary text-sm font-medium"
            >
              All articles &rarr;
            </Link>
          </div>
        </div>
      </Section>
    </motion.div>
  )
}
