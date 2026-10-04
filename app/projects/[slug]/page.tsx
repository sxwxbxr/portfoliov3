import Link from "next/link"
import Image from "next/image"
import { notFound } from "next/navigation"
import { ArrowLeft, ChevronRight, Github } from "lucide-react"
import { getProjectBySlug, getProjects, getCaseStudyBySlug } from "@/lib/data"
import Navigation from "../../../components/Navigation"
import { Block } from "@/components/site/Block"
import { ProjectDeepDive } from "@/components/project-deepdive/DeepDiveButton"
import { AI_FEATURES_ENABLED } from "@/lib/features"
import { resolveImage } from "@/lib/project-image"
import { copy } from "@/lib/copy"

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
  const technologies = (study?.technologies as string[] | undefined) ?? []

  return (
    <div className="min-h-screen bg-ground">
      <Navigation />

      <div className="flex flex-col gap-14 pt-32 md:gap-20">
        {/* ─── Hero ─── */}
        <section className="sheet flex flex-col gap-6">
          <Link
            href="/projects"
            className="annotate inline-flex items-center gap-1.5 self-start transition-colors duration-150 hover:text-fg"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.projects.backToProjects}
          </Link>

          <h1 className="display text-balance">{project.title}</h1>

          {project.shortDescription && (
            <p className="measure text-xl leading-snug text-fg-muted md:text-2xl">
              {project.shortDescription}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            {client && <span className="tab text-xs text-fg-muted">{client}</span>}
            {duration && <span className="tab text-xs text-fg-muted">{duration}</span>}
            {tags.map((tag) => (
              <span key={tag} className="tab text-xs text-fg-muted">
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
                  className="control control-primary inline-flex items-center gap-1.5 py-2.5 pr-4 pl-5 text-sm"
                >
                  {copy.projects.viewLive}
                  <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
              {hasRepoLink && (
                <a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="control inline-flex items-center gap-2 py-2.5 pr-5 pl-4 text-sm"
                >
                  <Github className="h-4 w-4" aria-hidden="true" />
                  {copy.projects.sourceCode}
                </a>
              )}
            </div>
          )}
        </section>

        {/* ─── Artwork in a flat card ─── */}
        <section className="sheet">
          <div className="cast p-3 md:p-4">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-sm bg-well">
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
                  className="absolute inset-0 flex select-none items-center justify-center text-fg-subtle/25"
                  style={{ fontSize: "clamp(6rem, 15vw, 14rem)" }}
                >
                  {project.title.charAt(0)}
                </span>
              )}
            </div>
          </div>
        </section>

        {/* ─── Description ─── */}
        <section className="sheet flex flex-col gap-10">
          <div className="measure flex flex-col gap-4">
            {(descriptionParagraphs.length
              ? descriptionParagraphs
              : [project.description]
            ).map((paragraph, index) => (
              <p key={index} className="lede">
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
        </section>

        {/* ─── Case-study blocks ─── */}
        {hasCaseStudyContent && (
          <div>
            {challenge && (
              <Block
                label={copy.projects.challengeEyebrow}
                title={copy.projects.challenge}
                lede={<p>{challenge}</p>}
              />
            )}

            {solution && (
              <Block
                label={copy.projects.solutionEyebrow}
                title={copy.projects.solution}
                lede={<p>{solution}</p>}
              />
            )}

            {results.length > 0 && (
              <Block
                label={copy.projects.resultsEyebrow(results.length)}
                title={copy.projects.results}
              >
                <ol className="border-t border-edge-soft">
                  {results.map((result, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-4 border-b border-edge-soft py-5"
                    >
                      <span className="annotate mt-0.5 shrink-0">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="leading-relaxed text-fg-muted">{result}</span>
                    </li>
                  ))}
                </ol>
              </Block>
            )}

            {study?.testimonialQuote &&
              study.testimonialAuthor.trim() &&
              study.testimonialCompany.trim() && (
                <section className="sheet pb-18 md:pb-24">
                  <div className="cast flex flex-col gap-6 p-6 md:p-7">
                    <blockquote className="text-xl leading-relaxed md:text-2xl">
                      &ldquo;{study.testimonialQuote}&rdquo;
                    </blockquote>
                    <div className="flex flex-col gap-0.5">
                      <p>{study.testimonialAuthor}</p>
                      <p className="annotate">{study.testimonialCompany}</p>
                    </div>
                  </div>
                </section>
              )}

            {technologies.length > 0 && (
              <Block
                label={copy.projects.technologies}
                title={copy.projects.builtWith}
                sub={copy.projects.builtWithSub}
              >
                <div className="flex flex-wrap gap-2">
                  {technologies.map((tech) => (
                    <span key={tech} className="tab text-xs text-fg-muted">
                      {tech}
                    </span>
                  ))}
                </div>
              </Block>
            )}
          </div>
        )}

        {/* ─── Pager ─── */}
        <section className="sheet pb-24">
          <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-between">
            <Link
              href="/projects"
              className="control inline-flex items-center gap-2 py-2.5 pr-5 pl-4 text-sm md:self-start"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.projects.allProjects}
            </Link>

            {nextProject && (
              <Link
                href={`/projects/${nextProject.slug}`}
                className="control inline-flex items-center justify-between gap-1.5 py-2.5 pr-3 pl-5 text-sm"
              >
                <span>
                  <span className="text-fg-muted">{copy.projects.nextProject}: </span>
                  {nextProject.title}
                </span>
                <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
