"use client"

import Link from "next/link"
import Navigation from "../components/Navigation"
import FadeInSection from "../components/FadeInSection"
import { ParticleBackground } from "../components/ParticleBackground"
import { AnimatedCounter } from "../components/AnimatedCounter"
import { InteractiveCard } from "../components/InteractiveCard"
import { EtherealShadows } from "../components/EtherealShadows"
import { projects, blogPosts, caseStudies } from "../src/config"
import { ArrowDown, MapPin, ArrowRight, Users, Award, Calendar, Quote } from "lucide-react"

const featuredProjects = projects.slice(0, 3)
const featuredTestimonials = caseStudies.filter((study) => study.testimonial).slice(0, 2)
const latestWriting = blogPosts.slice(0, 2)
const servicePreview = [
  {
    title: "Digital transformation leadership",
    description:
      "Fractional leadership for complex software migrations, workflow automation, and cross-team programs with measurable outcomes.",
  },
  {
    title: "Product & delivery coaching",
    description:
      "Hands-on support to align discovery, delivery, and stakeholder communication so your roadmap ships on time and on budget.",
  },
  {
    title: "Technical implementation",
    description:
      "Execution for .NET, C#, and automation initiatives—from proof of concept to production with documentation and training."
  },
]

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="relative min-h-screen flex items-center justify-center gradient-bg overflow-hidden pt-16">
        <ParticleBackground />
        <EtherealShadows />
        <FadeInSection>
          <div className="text-center space-y-8 px-4 max-w-4xl mx-auto relative z-10">
            <div className="space-y-4">
              <div className="inline-block p-3 rounded-full bg-primary/10 mb-6 float-animation glow-effect">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center hover:scale-110 transition-transform duration-300 cursor-pointer">
                  <span className="text-2xl font-bold text-primary">SW</span>
                </div>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent leading-tight animate-in fade-in slide-in-from-bottom-4 duration-1000">
                Hi, I&apos;m Seya Weber
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-serif animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
                Project Manager Software and Digitalisation and Founder of <Link href="https://nxrthstack.sweber.dev" className="hover:text-primary transition-colors">NxrthStack</Link> in St. Gallen, Switzerland.
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-muted-foreground animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
              <MapPin className="w-4 h-4" />
              <span>St. Gallen, Switzerland</span>
            </div>

            <div className="flex gap-4 justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
              <Link
                href="/contact"
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 hover:scale-105 glow-effect hover:shadow-lg hover:shadow-primary/25"
              >
                Get in Touch
              </Link>
              <Link
                href="/projects"
                className="px-8 py-3 border border-border rounded-lg font-medium hover:bg-card transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                View Projects
              </Link>
            </div>

            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <ArrowDown className="w-6 h-6 text-muted-foreground hover:text-primary transition-colors cursor-pointer" />
            </div>
          </div>
        </FadeInSection>
      </section>

      <section className="py-16 px-4 bg-card/50">
        <div className="max-w-6xl mx-auto">
          <FadeInSection>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <Users className="w-8 h-8 text-primary mx-auto mb-4" />
                <AnimatedCounter end={projects.length} suffix="+" />
                <p className="text-muted-foreground">Projects Completed</p>
              </div>
              <div className="space-y-2">
                <Award className="w-8 h-8 text-primary mx-auto mb-4" />
                <AnimatedCounter end={1} suffix="+" />
                <p className="text-muted-foreground">Years Experience</p>
              </div>
              <div className="space-y-2">
                <Calendar className="w-8 h-8 text-primary mx-auto mb-4" />
                <AnimatedCounter end={100} suffix="%" />
                <p className="text-muted-foreground">Client Satisfaction</p>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeInSection>
            <div className="grid md:grid-cols-3 gap-8">
              <InteractiveCard>
                <Link
                  href="/about"
                  className="group bg-card border border-border rounded-xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 block"
                >
                  <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors">About Me</h3>
                  <p className="text-muted-foreground mb-4">
                    Learn more about my background and passion for technology.
                  </p>
                  <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </InteractiveCard>

              <InteractiveCard>
                <Link
                  href="/experience"
                  className="group bg-card border border-border rounded-xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 block"
                >
                  <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors">Experience</h3>
                  <p className="text-muted-foreground mb-4">Explore my professional journey and key achievements.</p>
                  <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </InteractiveCard>

              <InteractiveCard>
                <Link
                  href="/projects"
                  className="group bg-card border border-border rounded-xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 block"
                >
                  <h3 className="text-xl font-semibold mb-4 group-hover:text-primary transition-colors">Projects</h3>
                  <p className="text-muted-foreground mb-4">Discover the projects I&apos;ve worked on and their impact.</p>
                  <ArrowRight className="w-5 h-5 text-primary group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </InteractiveCard>
            </div>
          </FadeInSection>
        </div>
      </section>

      <section className="py-24 px-4 bg-card/40">
        <div className="max-w-6xl mx-auto space-y-12">
          <FadeInSection>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold">Featured Projects</h2>
                <p className="text-muted-foreground max-w-2xl">
                  A snapshot of multidisciplinary engagements that span software delivery, automation, and operations.
                </p>
              </div>
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
              >
                Explore all projects
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeInSection>

          <FadeInSection>
            <div className="grid gap-6 md:grid-cols-3">
              {featuredProjects.map((project) => (
                <InteractiveCard key={project.slug}>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl"
                  >
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      {project.tags.slice(0, 2).map((tag) => (
                        <span key={tag} className="rounded-full bg-primary/10 px-3 py-1 text-primary">
                          {tag}
                        </span>
                      ))}
                    </div>
                    <h3 className="mt-6 text-2xl font-semibold leading-snug group-hover:text-primary transition-colors">
                      {project.title}
                    </h3>
                    <p className="mt-4 text-muted-foreground leading-relaxed">{project.shortDescription}</p>
                    <div className="mt-auto flex items-center gap-2 pt-6 text-sm font-medium text-primary">
                      View case details
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                </InteractiveCard>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <FadeInSection>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold">Services at a Glance</h2>
                <p className="text-muted-foreground max-w-2xl">
                  Partner with me for strategy, delivery, and implementation support tailored to your product or transformation initiative.
                </p>
              </div>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
              >
                View full services
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeInSection>

          <FadeInSection>
            <div className="grid gap-6 md:grid-cols-3">
              {servicePreview.map((service) => (
                <InteractiveCard key={service.title}>
                  <div className="h-full rounded-xl border border-border bg-card p-6">
                    <h3 className="text-xl font-semibold">{service.title}</h3>
                    <p className="mt-4 text-muted-foreground leading-relaxed">{service.description}</p>
                  </div>
                </InteractiveCard>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      <section className="py-24 px-4 bg-muted/40">
        <div className="max-w-6xl mx-auto space-y-12">
          <FadeInSection>
            <h2 className="text-3xl md:text-4xl font-bold text-center">What partners say</h2>
            <p className="text-muted-foreground text-center max-w-3xl mx-auto">
              Real feedback from engagements across healthcare, finance, and residential projects.
            </p>
          </FadeInSection>

          <FadeInSection>
            <div className="grid gap-6 md:grid-cols-2">
              {featuredTestimonials.map((testimonial) => (
                <InteractiveCard key={testimonial.slug}>
                  <div className="flex h-full flex-col rounded-xl border border-border bg-card p-8">
                    <Quote className="h-10 w-10 text-primary" aria-hidden="true" />
                    <blockquote className="mt-6 flex-1 text-lg italic leading-relaxed">“{testimonial.testimonial?.quote}”</blockquote>
                    <div className="mt-6 text-sm text-muted-foreground">
                      <p className="font-semibold text-foreground">{testimonial.testimonial?.author}</p>
                      <p>{testimonial.testimonial?.company}</p>
                    </div>
                    <Link
                      href={`/case-studies/${testimonial.slug}`}
                      className="mt-6 inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
                    >
                      Read the full story
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </InteractiveCard>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>

      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto space-y-12">
          <FadeInSection>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold">Latest writing</h2>
                <p className="text-muted-foreground max-w-2xl">
                  Essays and notes on moving complex initiatives from idea to production without losing momentum.
                </p>
              </div>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
              >
                Visit the blog
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeInSection>

          <FadeInSection>
            <div className="grid gap-6 md:grid-cols-2">
              {latestWriting.map((post) => (
                <InteractiveCard key={post.id}>
                  <Link
                    href={`/blog/${post.id}`}
                    className="group flex h-full flex-col rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
                  >
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                    <h3 className="mt-4 text-2xl font-semibold leading-snug group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="mt-4 flex-1 text-muted-foreground leading-relaxed">{post.excerpt}</p>
                    <div className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">
                      Read article
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                </InteractiveCard>
              ))}
            </div>
          </FadeInSection>
        </div>
      </section>
    </div>
  )
}
