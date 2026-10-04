import Navigation from "../../../components/Navigation"
import { Block } from "@/components/site/Block"
import { getCaseStudies, getCaseStudyBySlug } from "@/lib/data"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import { notFound } from "next/navigation"
import { CASE_STUDIES_ENABLED } from "@/lib/features"
import { copy } from "@/lib/copy"

export const revalidate = 86400

export async function generateStaticParams() {
  if (!CASE_STUDIES_ENABLED) return []
  const all = await getCaseStudies()
  return all.map((study) => ({ slug: study.slug }))
}

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>
}

export default async function CaseStudy({ params }: CaseStudyPageProps) {
  if (!CASE_STUDIES_ENABLED) notFound()
  const { slug } = await params
  const [study, allStudies] = await Promise.all([
    getCaseStudyBySlug(slug),
    getCaseStudies(),
  ])

  if (!study) {
    notFound()
  }

  // Find next case study
  const currentIndex = allStudies.findIndex((s) => s.slug === slug)
  const nextStudy = currentIndex >= 0 ? allStudies[(currentIndex + 1) % allStudies.length] : null

  const results = study.results as string[]
  const technologies = study.technologies as string[]

  return (
    <div className="min-h-screen bg-ground">
      <Navigation />

      <div className="flex flex-col gap-14 pt-32 md:gap-20">
        {/* ─── Hero ─── */}
        <section className="sheet flex flex-col gap-6">
          <Link
            href="/case-studies"
            className="annotate inline-flex items-center gap-1.5 self-start transition-colors duration-150 hover:text-fg"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.caseStudies.allCaseStudies}
          </Link>

          <h1 className="display text-balance">{study.title}</h1>

          <p className="text-xl leading-snug text-fg-muted md:text-2xl">{study.client}</p>

          <div className="flex flex-wrap items-center gap-2">
            <span className="tab text-xs text-fg-muted">{study.industry}</span>
            <span className="tab text-xs text-fg-muted">{study.duration}</span>
            <span className="tab text-xs text-fg-muted">{study.team}</span>
          </div>
        </section>

        {/* ─── Content ─── */}
        <div>
          {study.challenge && (
            <Block
              label={copy.projects.challengeEyebrow}
              title={copy.projects.challenge}
              lede={<p>{study.challenge}</p>}
            />
          )}

          {study.solution && (
            <Block
              label={copy.projects.solutionEyebrow}
              title={copy.projects.solution}
              lede={<p>{study.solution}</p>}
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

          {/* Testimonial — only show if author and company are filled in. */}
          {study.testimonialQuote &&
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
              label={copy.caseStudies.technologies}
              title={copy.caseStudies.builtWith}
              sub={copy.caseStudies.builtWithSub}
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

        {/* ─── Pager ─── */}
        <section className="sheet pb-24">
          <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-between">
            <Link
              href="/case-studies"
              className="control inline-flex items-center gap-2 py-2.5 pr-5 pl-4 text-sm md:self-start"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.caseStudies.allCaseStudies}
            </Link>

            {nextStudy && nextStudy.slug !== study.slug && (
              <Link
                href={`/case-studies/${nextStudy.slug}`}
                className="control inline-flex items-center justify-between gap-1.5 py-2.5 pr-3 pl-5 text-sm"
              >
                <span>
                  <span className="text-fg-muted">{copy.caseStudies.nextCaseStudy}: </span>
                  {nextStudy.title}
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
