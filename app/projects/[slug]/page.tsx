import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ArrowLeft, ArrowUpRight, Github } from "lucide-react"
import { getProjectBySlug, getProjects, getCaseStudyBySlug } from "@/lib/data"
import Navigation from "../../../components/Navigation"
import { ProjectDeepDive } from "@/components/project-deepdive/DeepDiveButton"
import { AI_FEATURES_ENABLED } from "@/lib/features"
import { resolveImage } from "@/lib/project-image"

export const revalidate = 86400

// Pre-render every project detail page at build time so the first visit is a
// CDN cache hit instead of a cold on-demand render.
export async function generateStaticParams() {
  const all = await getProjects()
  return all.map((project) => ({ slug: project.slug }))
}

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
  const heroImage = resolveImage(project.image)

  const descriptionParagraphs = project.description
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)

  // Prefer fields set on the project itself; fall back to the matching legacy
  // caseStudies row so older projects keep rendering.
  const client = project.client || study?.client || ""
  const duration = project.duration || study?.duration || ""
  const challenge = project.challenge || study?.challenge || ""
  const solution = project.solution || study?.solution || ""
  const results: string[] =
    project.results.length > 0
      ? project.results
      : ((study?.results as string[]) ?? [])
  const hasCaseStudyContent = Boolean(challenge || solution || results.length)

  const currentIndex = allProjects.findIndex((p) => p.slug === slug)
  const nextProject =
    currentIndex >= 0 ? allProjects[(currentIndex + 1) % allProjects.length] : null

  const tags = project.tags as string[]

  return (
    <div className="min-h-screen bg-ground">
      <Navigation />

      <div className="flex flex-col gap-14 pt-32 md:gap-20">
        {/* ─── Hero ─── */}
        <section className="sheet flex flex-col gap-6">
          <Link
            href="/projects"
            className="annotate inline-flex items-center gap-1.5 self-start hover:text-signal transition-colors duration-150"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Zurück zu den Projekten
          </Link>

          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance md:text-5xl lg:text-6xl">
            {project.title}
          </h1>

          {project.shortDescription && (
            <p className="measure text-lg leading-relaxed text-fg-muted">
              {project.shortDescription}
            </p>
          )}

          {/* Facts as seated chips rather than a pipe-separated string. */}
          <div className="flex flex-wrap items-center gap-2">
            {client && <span className="well-sm px-3 py-1.5 annotate">{client}</span>}
            {duration && <span className="well-sm px-3 py-1.5 annotate">{duration}</span>}
            {tags.map((tag) => (
              <span key={tag} className="well-sm px-3 py-1.5 font-mono text-xs text-fg-muted">
                {tag}
              </span>
            ))}
          </div>

          {/* Dead "#" links are not rendered at all — a button that goes
              nowhere costs more credibility than a missing one. */}
          {(hasDemoLink || hasRepoLink) && (
            <div className="flex flex-wrap items-center gap-3">
              {hasDemoLink && (
                <a
                  href={project.demo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="control control-primary inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
                >
                  Live ansehen
                  <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                </a>
              )}
              {hasRepoLink && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="control inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
                >
                  <Github className="h-4 w-4" aria-hidden="true" />
                  Source Code
                </a>
              )}
            </div>
          )}
        </section>

        {/* ─── The screen, recessed into the sheet ─── */}
        <section className="sheet">
          <div className="well relative aspect-[16/9] w-full overflow-hidden">
            {heroImage ? (
              <Image
                src={heroImage}
                alt={project.title}
                fill
                sizes="(min-width: 1200px) 1200px, 100vw"
                className="object-cover"
                priority
              />
            ) : (
              <span
                aria-hidden="true"
                className="absolute inset-0 flex select-none items-center justify-center font-display font-bold text-fg-subtle/25"
                style={{ fontSize: "clamp(6rem, 15vw, 14rem)" }}
              >
                {project.title.charAt(0)}
              </span>
            )}
          </div>
        </section>

        {/* ─── Content ─── */}
        <section className="sheet flex flex-col gap-16">
          <div className="measure flex flex-col gap-4">
            {(descriptionParagraphs.length
              ? descriptionParagraphs
              : [project.description]
            ).map((paragraph, index) => (
              <p key={index} className="text-lg leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>

          {AI_FEATURES_ENABLED && (
            <ProjectDeepDive
              slug={project.slug}
              title={project.title}
              description={project.description}
              techStack={tags}
            />
          )}

          {hasCaseStudyContent && (
            <div className="flex flex-col gap-6">
              {challenge && (
                <div className="cast rim flex flex-col gap-3 p-7 md:p-8">
                  <span className="annotate">Ausgangslage</span>
                  <h2 className="font-display text-2xl font-bold tracking-tight">
                    The Challenge
                  </h2>
                  <p className="measure leading-relaxed text-fg-muted">{challenge}</p>
                </div>
              )}

              {solution && (
                <div className="cast rim flex flex-col gap-3 p-7 md:p-8">
                  <span className="annotate">Vorgehen</span>
                  <h2 className="font-display text-2xl font-bold tracking-tight">
                    The Solution
                  </h2>
                  <p className="measure leading-relaxed text-fg-muted">{solution}</p>
                </div>
              )}

              {results.length > 0 && (
                <div className="flex flex-col gap-5">
                  <div className="flex flex-col gap-2">
                    <span className="annotate">Ergebnis · {results.length}</span>
                    <h2 className="font-display text-2xl font-bold tracking-tight">
                      Results
                    </h2>
                  </div>
                  <ol className="well flex flex-col gap-2 p-3 md:p-4">
                    {results.map((result, index) => (
                      <li
                        key={index}
                        className="cast-sm flex items-start gap-4 px-4 py-3.5"
                      >
                        <span className="annotate mt-0.5 shrink-0">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="text-sm leading-relaxed">{result}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {study?.testimonialQuote &&
                study.testimonialAuthor.trim() &&
                study.testimonialCompany.trim() && (
                  <div className="cast rim flex flex-col gap-6 p-7 md:p-8">
                    <blockquote className="font-display text-xl leading-relaxed md:text-2xl">
                      &ldquo;{study.testimonialQuote}&rdquo;
                    </blockquote>
                    <div className="flex flex-col gap-0.5">
                      <p className="font-semibold">{study.testimonialAuthor}</p>
                      <p className="annotate">{study.testimonialCompany}</p>
                    </div>
                  </div>
                )}

              {study?.technologies && (study.technologies as string[]).length > 0 && (
                <div className="flex flex-col gap-3">
                  <span className="annotate">Technologies</span>
                  <div className="flex flex-wrap gap-2">
                    {(study.technologies as string[]).map((tech) => (
                      <span
                        key={tech}
                        className="well-sm px-2.5 py-1 font-mono text-xs text-fg-muted"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </section>

        {/* ─── Pager ─── */}
        <section className="sheet pb-8">
          <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-between">
            <Link
              href="/projects"
              className="control inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium md:self-start"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Alle Projekte
            </Link>

            {nextProject && (
              <Link
                href={`/projects/${nextProject.slug}`}
                className="cast rim group flex flex-col gap-1 p-5 transition-transform duration-150 ease-out hover:-translate-y-0.5 motion-reduce:transform-none md:min-w-[20rem] md:text-right"
              >
                <span className="annotate">Nächstes Projekt</span>
                <span className="font-display text-lg font-semibold transition-colors duration-150 group-hover:text-signal">
                  {nextProject.title}
                </span>
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
