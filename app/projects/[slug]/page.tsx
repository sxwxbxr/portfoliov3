import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { getProjectBySlug, getProjects, getCaseStudyBySlug } from "@/lib/data"
import Navigation from "../../../components/Navigation"
import fs from "fs"
import path from "path"

export const dynamic = "force-dynamic"

interface ProjectPageProps {
  params: Promise<{ slug: string }>
}

export default async function ProjectDetails({ params }: ProjectPageProps) {
  const { slug } = await params
  const [project, study, allProjects] = await Promise.all([
    getProjectBySlug(slug),
    getCaseStudyBySlug(slug),
    getProjects(),
  ])

  if (!project) {
    notFound()
  }

  const hasDemoLink = Boolean(project.demo && project.demo !== "#")
  const hasRepoLink = Boolean(project.github && project.github !== "#")

  const descriptionParagraphs = project.description
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  // Find next project
  const currentIndex = allProjects.findIndex((p) => p.slug === slug)
  const nextProject = currentIndex >= 0 ? allProjects[(currentIndex + 1) % allProjects.length] : null

  return (
    <div className="min-h-screen bg-background grain-overlay">
      <Navigation />

      <div className="pt-32">
        {/* Hero */}
        <section className="max-w-[1200px] mx-auto px-6 pb-16 md:pb-20">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            &larr; Back to projects
          </Link>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-[1.05]">
            {project.title}
          </h1>

          <p className="mt-4 text-lg text-muted-foreground max-w-2xl leading-relaxed">
            {project.shortDescription}
          </p>

          {/* Meta bar */}
          <div className="glass rounded-lg p-4 md:p-6 mt-8">
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-sm text-muted-foreground">
              {study?.client && (
                <>
                  <span>{study.client}</span>
                  <span className="hidden md:inline text-border">|</span>
                </>
              )}
              <span>{(project.tags as string[]).join(", ")}</span>
              {study?.duration && (
                <>
                  <span className="hidden md:inline text-border">|</span>
                  <span>{study.duration}</span>
                </>
              )}
            </div>
          </div>

          {/* Links */}
          {(hasDemoLink || hasRepoLink) && (
            <div className="mt-8 flex flex-wrap items-center gap-6">
              {hasDemoLink && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-primary text-sm font-medium"
                >
                  View live site &rarr;
                </a>
              )}
              {hasRepoLink && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="link-underline text-primary text-sm font-medium"
                >
                  Source code &rarr;
                </a>
              )}
            </div>
          )}
        </section>

        {/* Project image or placeholder */}
        {(() => {
          const imageExists =
            project.image &&
            fs.existsSync(path.join(process.cwd(), "public", project.image))
          if (imageExists) {
            return (
              <div className="max-w-[1200px] mx-auto px-6 pb-12">
                <div className="relative w-full aspect-[16/9] overflow-hidden border border-border">
                  <Image
                    src={project.image}
                    alt={project.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            )
          }
          return (
            <div className="max-w-[1200px] mx-auto px-6 pb-12">
              <div className="relative w-full aspect-[16/9] overflow-hidden border border-border bg-muted/30 flex items-center justify-center">
                <span
                  className="font-display font-bold text-muted-foreground/10 select-none"
                  style={{ fontSize: "clamp(6rem, 15vw, 14rem)" }}
                >
                  {project.title.charAt(0)}
                </span>
              </div>
            </div>
          )
        })()}

        <div className="border-t border-border" />

        {/* Content */}
        <div className="py-24 md:py-32">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="max-w-3xl">
              {/* Description */}
              <div className="space-y-4">
                {descriptionParagraphs.length ? (
                  descriptionParagraphs.map((paragraph, index) => (
                    <p key={index} className="text-lg leading-relaxed text-foreground/90">
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <p className="text-lg leading-relaxed text-foreground/90">
                    {project.description}
                  </p>
                )}
              </div>

              {/* Case study sections */}
              {study && (
                <div className="mt-20 space-y-16">
                  {/* Challenge */}
                  <div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-4">
                      The Challenge
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      {study.challenge}
                    </p>
                  </div>

                  {/* Solution */}
                  <div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-4">
                      The Solution
                    </h2>
                    <p className="text-muted-foreground leading-relaxed text-lg">
                      {study.solution}
                    </p>
                  </div>

                  {/* Results */}
                  <div>
                    <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-8">
                      Results
                    </h2>
                    <div className="space-y-0">
                      {(study.results as string[]).map((result, index) => (
                        <div
                          key={index}
                          className={`flex items-start gap-4 py-4 ${
                            index > 0 ? "border-t border-border" : ""
                          }`}
                        >
                          <span className="font-mono text-sm text-muted-foreground mt-0.5">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span className="text-foreground/90">{result}</span>
                        </div>
                      ))}
                      <div className="border-t border-border" />
                    </div>
                  </div>

                  {/* Testimonial */}
                  {study.testimonialQuote && (
                    <div className="mt-8">
                      <div className="text-muted-foreground/30 font-display text-5xl leading-none select-none mb-4">
                        &ldquo;
                      </div>
                      <blockquote className="text-xl md:text-2xl font-display leading-relaxed -mt-6">
                        {study.testimonialQuote}
                      </blockquote>
                      <div className="mt-6">
                        <p className="font-semibold">{study.testimonialAuthor}</p>
                        <p className="text-sm text-muted-foreground">{study.testimonialCompany}</p>
                      </div>
                    </div>
                  )}

                  {/* Technologies */}
                  <div>
                    <h3 className="font-display font-semibold text-sm mb-4">Technologies</h3>
                    <p className="text-muted-foreground">
                      {(study.technologies as string[]).join(", ")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Navigation footer */}
        <div className="border-t border-border">
          <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <Link
              href="/projects"
              className="link-underline text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              &larr; All projects
            </Link>
            {nextProject && (
              <Link
                href={`/projects/${nextProject.slug}`}
                className="group text-right"
              >
                <span className="text-sm text-muted-foreground">Next project</span>
                <p className="font-display font-semibold text-lg group-hover:text-primary transition-colors">
                  {nextProject.title} &rarr;
                </p>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
