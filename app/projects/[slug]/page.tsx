import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Building, CheckCircle, Clock, ExternalLink, Github, Quote, Users } from "lucide-react"

import FadeInSection from "../../../components/FadeInSection"
import Navigation from "../../../components/Navigation"
import PageLayout from "../../../components/PageLayout"
import { caseStudies, projects } from "../../../src/config"

interface ProjectPageProps {
  params: { slug: string }
}

export default function ProjectDetails({ params }: ProjectPageProps) {
  const { slug } = params
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

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageLayout>
        <div className="max-w-4xl mx-auto space-y-16">
          <FadeInSection>
            <div className="space-y-6">
              <Link
                href="/projects"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Projects
              </Link>

              <div className="space-y-5">
                {study?.client && <p className="text-primary font-medium">{study.client}</p>}
                <h1 className="text-4xl md:text-5xl font-bold leading-tight">{project.title}</h1>
                <p className="text-xl text-muted-foreground leading-relaxed font-serif">{project.description}</p>

                {project.tags?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}

                {(hasDemoLink || hasRepoLink) && (
                  <div className="flex flex-wrap gap-4 pt-2">
                    {hasDemoLink && (
                      <a
                        href={project.demo}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-colors"
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
                        className="inline-flex items-center gap-2 px-4 py-2 border border-border rounded-lg font-medium hover:bg-muted transition-colors"
                      >
                        <Github className="w-4 h-4" />
                        View Source
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </FadeInSection>

          <FadeInSection>
            <div className="overflow-hidden rounded-xl border border-border">
              <Image
                src={heroSrc}
                alt={project.title}
                width={800}
                height={400}
                className="w-full h-64 md:h-96 object-cover"
                priority
              />
            </div>
          </FadeInSection>

          {study ? (
            <div className="space-y-12">
              <FadeInSection>
                <div className="grid gap-4 sm:grid-cols-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    <span>{study.industry}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{study.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{study.team}</span>
                  </div>
                </div>
              </FadeInSection>

              <FadeInSection>
                <section className="space-y-8">
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Challenge</h2>
                    <p className="text-muted-foreground leading-relaxed">{study.challenge}</p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Solution</h2>
                    <p className="text-muted-foreground leading-relaxed">{study.solution}</p>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold mb-4">Results</h2>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {study.results.map((result, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 bg-card border border-border rounded-lg">
                          <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{result}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              </FadeInSection>

              <FadeInSection>
                <div className="grid gap-8 lg:grid-cols-2">
                  <div className="bg-card border border-border rounded-xl p-6">
                    <h3 className="font-semibold mb-4">Technologies &amp; Focus Areas</h3>
                    <div className="flex flex-wrap gap-2">
                      {study.technologies.map((tech) => (
                        <span key={tech} className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>

                  {study.testimonial && (
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
                      <Quote className="w-8 h-8 text-primary mb-4" />
                      <blockquote className="text-lg italic mb-4">&quot;{study.testimonial.quote}&quot;</blockquote>
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium">{study.testimonial.author}</p>
                        <p>{study.testimonial.company}</p>
                      </div>
                    </div>
                  )}
                </div>
              </FadeInSection>
            </div>
          ) : (
            <FadeInSection>
              <div className="bg-card border border-border rounded-xl p-8 space-y-4">
                <h2 className="text-2xl font-bold">Project Overview</h2>
                <p className="text-muted-foreground leading-relaxed">{project.description}</p>
                {project.tags?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            </FadeInSection>
          )}
        </div>
      </PageLayout>
    </div>
  )
}

export function generateStaticParams() {
  return projects.map((project) => ({ slug: project.slug }))
}

