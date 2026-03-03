import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Building, CheckCircle, Clock, ExternalLink, Quote, Users, ArrowUpRight } from "lucide-react"
import { SiGithub } from "react-icons/si"

import Navigation from "../../../components/Navigation"
import { AnimatedSection } from "../../../components/AnimatedSection"
import { caseStudies, projects } from "../../../src/config"

interface ProjectPageProps {
  params: { slug: string } | Promise<{ slug: string }>
}

export default async function ProjectDetails({ params }: ProjectPageProps) {
  const { slug } = await params
  const project = projects.find((item) => item.slug === slug)
  const study = caseStudies.find((item) => item.slug === slug)

  if (!project) {
    notFound()
  }

  const heroImage = (study?.image ?? project.image ?? "/abstract-geometric-shapes.png").trim()
  const heroSrc = heroImage.includes("?")
    ? heroImage
    : `${heroImage}?height=400&width=800&query=${encodeURIComponent(project.title)}`

  const hasDemoLink = Boolean(project.demo && project.demo !== "#")
  const hasRepoLink = Boolean(project.github && project.github !== "#")

  const descriptionParagraphs = project.description
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  return (
    <div className="min-h-screen bg-background grain-overlay">
      <Navigation />

      <div className="pt-16">
        <section className="py-20 md:py-28 px-6 mesh-gradient">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              All Projects
            </Link>

            <div className="space-y-5">
              {study?.client && (
                <p className="text-sm font-medium text-primary">{study.client}</p>
              )}
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
                {project.title}
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                {project.shortDescription}
              </p>

              {(hasDemoLink || hasRepoLink) && (
                <div className="flex flex-wrap gap-3 pt-2">
                  {hasDemoLink && (
                    <a
                      href={project.demo}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-foreground text-background rounded-full text-sm font-medium hover:opacity-80 transition-opacity"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Demo
                    </a>
                  )}
                  {hasRepoLink && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 border border-border rounded-full text-sm font-medium hover:bg-muted transition-colors"
                    >
                      <SiGithub className="w-4 h-4" />
                      Source Code
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        <main className="py-20 md:py-28 px-6">
          <div className="max-w-4xl mx-auto space-y-16">
            <div className="overflow-hidden rounded-2xl border border-border">
              <Image
                src={heroSrc}
                alt={project.title}
                width={800}
                height={400}
                className="w-full h-64 md:h-96 object-cover"
                priority
              />
            </div>

            <section className="bento-card rounded-2xl border border-border bg-card p-8 md:p-10 space-y-6">
              <div className="space-y-4">
                <p className="text-xs font-medium text-primary uppercase tracking-widest">Overview</p>
                <h2 className="text-2xl font-bold">Project Details</h2>
                {descriptionParagraphs.length ? (
                  descriptionParagraphs.map((paragraph, index) => (
                    <p key={index} className="text-muted-foreground leading-relaxed">
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p className="text-muted-foreground leading-relaxed">{project.description}</p>
                )}
              </div>

              {project.tags?.length ? (
                <div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
                    Technologies & Focus Areas
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </section>

            {study ? (
              <div className="space-y-12">
                <div className="grid gap-4 sm:grid-cols-3">
                  {[
                    { icon: Building, text: study.industry },
                    { icon: Clock, text: study.duration },
                    { icon: Users, text: study.team },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-muted-foreground rounded-xl border border-border bg-card p-4">
                      <item.icon className="w-4 h-4 text-primary" />
                      <span>{item.text}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-10">
                  {[
                    { label: "Challenge", content: study.challenge },
                    { label: "Solution", content: study.solution },
                  ].map((section) => (
                    <div key={section.label}>
                      <p className="text-xs font-medium text-primary uppercase tracking-widest mb-3">{section.label}</p>
                      <h2 className="text-2xl font-bold mb-4">The {section.label}</h2>
                      <p className="text-muted-foreground leading-relaxed">{section.content}</p>
                    </div>
                  ))}

                  <div>
                    <p className="text-xs font-medium text-primary uppercase tracking-widest mb-3">Outcomes</p>
                    <h2 className="text-2xl font-bold mb-6">Results Achieved</h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {study.results.map((result, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
                          <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{result}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="bento-card rounded-2xl border border-border bg-card p-6">
                    <p className="text-xs font-medium text-primary uppercase tracking-widest mb-4">Stack</p>
                    <div className="flex flex-wrap gap-2">
                      {study.technologies.map((tech) => (
                        <span key={tech} className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {study.testimonial && (
                    <div className="bento-card rounded-2xl border border-primary/20 bg-primary/5 p-6">
                      <Quote className="w-8 h-8 text-primary/30 mb-4" />
                      <blockquote className="text-base italic leading-relaxed mb-4">
                        &quot;{study.testimonial.quote}&quot;
                      </blockquote>
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">{study.testimonial.author}</p>
                        <p>{study.testimonial.company}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  )
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }))
}
