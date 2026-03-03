"use client"

import Link from "next/link"
import Navigation from "../components/Navigation"
import { AnimatedSection } from "../components/AnimatedSection"
import { StaggerContainer, StaggerItem } from "../components/StaggerContainer"
import { Marquee } from "../components/Marquee"
import { MagneticButton } from "../components/MagneticButton"
import { projects, blogPosts, caseStudies } from "../src/config"
import { ArrowUpRight, ArrowRight, Quote, MapPin } from "lucide-react"
import { motion } from "framer-motion"

const featuredProjects = projects.slice(0, 4)
const featuredTestimonials = caseStudies.filter((study) => study.testimonial).slice(0, 2)
const latestWriting = blogPosts.slice(0, 2)
const marqueeItems = [
  "Project Management",
  "Software Development",
  "Digital Transformation",
  "Process Automation",
  ".NET & C#",
  "Next.js & React",
  "Agile Delivery",
  "Data Migration",
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background grain-overlay">
      <Navigation />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center mesh-gradient overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-32 w-full">
          <div className="max-w-4xl">
            <AnimatedSection delay={0.1}>
              <div className="flex items-center gap-3 mb-8">
                <div className="relative w-3 h-3 rounded-full bg-green-500">
                  <span className="absolute inset-0 rounded-full bg-green-500 animate-ping opacity-40" />
                </div>
                <span className="text-sm text-muted-foreground font-medium">Available for projects</span>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[0.95]">
                <span className="block">I design &</span>
                <span className="block mt-2">build digital</span>
                <span className="block mt-2 text-gradient">experiences.</span>
              </h1>
            </AnimatedSection>

            <AnimatedSection delay={0.4}>
              <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-xl leading-relaxed">
                Seya Weber — Project Manager & Developer from St. Gallen, Switzerland.
                I turn complex operational needs into lean solutions and ship them.
              </p>
            </AnimatedSection>

            <AnimatedSection delay={0.5}>
              <div className="mt-10 flex flex-wrap gap-4">
                <MagneticButton>
                  <Link
                    href="/projects"
                    className="inline-flex items-center gap-2 px-7 py-3.5 bg-foreground text-background rounded-full text-sm font-medium hover:opacity-80 transition-opacity"
                  >
                    View Projects
                    <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </MagneticButton>
                <MagneticButton>
                  <Link
                    href="/contact"
                    className="inline-flex items-center gap-2 px-7 py-3.5 border border-border rounded-full text-sm font-medium hover:bg-muted transition-colors"
                  >
                    Get in touch
                  </Link>
                </MagneticButton>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.6}>
              <div className="mt-16 flex items-center gap-6 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>St. Gallen, CH</span>
                </div>
                <span className="text-border">|</span>
                <span>{projects.length}+ projects delivered</span>
              </div>
            </AnimatedSection>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </section>

      {/* Marquee */}
      <section className="py-6 border-b border-border bg-card/30 overflow-hidden">
        <Marquee
          items={marqueeItems}
          className="text-sm font-medium text-muted-foreground/60 tracking-wide uppercase"
        />
      </section>

      {/* Bento Grid */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="mb-16">
              <p className="text-sm font-medium text-primary tracking-wide uppercase mb-3">Overview</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">What I bring to the table</h2>
            </div>
          </AnimatedSection>

          <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.08}>
            <StaggerItem>
              <Link href="/about" className="block bento-card rounded-2xl border border-border bg-card p-8 h-full">
                <div className="flex flex-col h-full min-h-[200px]">
                  <p className="text-xs font-medium text-primary uppercase tracking-widest mb-4">About</p>
                  <h3 className="text-xl font-semibold mb-3">Software & Digitalization</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    Dual background in software engineering and electrical design.
                    I bridge technical implementation and business objectives.
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
                    Learn more <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </StaggerItem>

            <StaggerItem>
              <Link href="/experience" className="block bento-card rounded-2xl border border-border bg-card p-8 h-full">
                <div className="flex flex-col h-full min-h-[200px]">
                  <p className="text-xs font-medium text-primary uppercase tracking-widest mb-4">Experience</p>
                  <h3 className="text-xl font-semibold mb-3">PM at Telsonic</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    Creating customer-specific automation workflows and
                    implementing internal software to increase efficiency.
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
                    See journey <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </StaggerItem>

            <StaggerItem>
              <Link href="/services" className="block bento-card rounded-2xl border border-border bg-card p-8 h-full md:col-span-2 lg:col-span-1">
                <div className="flex flex-col h-full min-h-[200px]">
                  <p className="text-xs font-medium text-primary uppercase tracking-widest mb-4">Services</p>
                  <h3 className="text-xl font-semibold mb-3">End-to-end delivery</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    From strategy to hands-on execution — delivery leadership,
                    solution acceleration, and process coaching.
                  </p>
                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
                    Explore services <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </Link>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-24 md:py-32 px-6 bg-card/40">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-16">
              <div>
                <p className="text-sm font-medium text-primary tracking-wide uppercase mb-3">Work</p>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Selected Projects</h2>
              </div>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                View all projects
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </AnimatedSection>

          <StaggerContainer className="grid gap-6 md:grid-cols-2" staggerDelay={0.12}>
            {featuredProjects.map((project) => (
              <StaggerItem key={project.slug}>
                <Link
                  href={`/projects/${project.slug}`}
                  className="group block bento-card rounded-2xl border border-border bg-card overflow-hidden"
                >
                  <div className="aspect-[16/10] bg-gradient-to-br from-primary/5 to-secondary/5 dot-grid relative">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-6xl font-bold text-primary/10">{project.title.charAt(0)}</span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-xs font-medium px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {project.shortDescription}
                    </p>
                    <div className="mt-4 flex items-center gap-2 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                      View project <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="mb-16">
              <p className="text-sm font-medium text-primary tracking-wide uppercase mb-3">Testimonials</p>
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight">What partners say</h2>
            </div>
          </AnimatedSection>

          <StaggerContainer className="grid gap-6 md:grid-cols-2" staggerDelay={0.15}>
            {featuredTestimonials.map((testimonial) => (
              <StaggerItem key={testimonial.slug}>
                <div className="bento-card rounded-2xl border border-border bg-card p-8 md:p-10 h-full flex flex-col">
                  <Quote className="w-8 h-8 text-primary/30 mb-6" />
                  <blockquote className="text-lg leading-relaxed flex-1">
                    &ldquo;{testimonial.testimonial?.quote}&rdquo;
                  </blockquote>
                  <div className="mt-8 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{testimonial.testimonial?.author}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.testimonial?.company}</p>
                    </div>
                    <Link
                      href={`/case-studies/${testimonial.slug}`}
                      className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
                    >
                      Read story <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* Latest Writing */}
      <section className="py-24 md:py-32 px-6 bg-card/40">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-16">
              <div>
                <p className="text-sm font-medium text-primary tracking-wide uppercase mb-3">Blog</p>
                <h2 className="text-3xl md:text-5xl font-bold tracking-tight">Latest writing</h2>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                All articles
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </AnimatedSection>

          <StaggerContainer className="grid gap-6 md:grid-cols-2" staggerDelay={0.12}>
            {latestWriting.map((post) => (
              <StaggerItem key={post.id}>
                <Link
                  href={`/blog/${post.id}`}
                  className="group block bento-card rounded-2xl border border-border bg-card p-8 h-full"
                >
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mb-6">
                    <time>{new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</time>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-semibold leading-snug group-hover:text-primary transition-colors mb-4">
                    {post.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{post.excerpt}</p>
                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-primary">
                    Read article <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </div>
  )
}
