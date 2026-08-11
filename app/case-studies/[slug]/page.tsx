import Navigation from "../../../components/Navigation"
import { Section } from "../../../components/PageLayout"
import { getCaseStudies, getCaseStudyBySlug } from "@/lib/data"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { notFound } from "next/navigation"
import { CASE_STUDIES_ENABLED } from "@/lib/features"

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
            className="annotate inline-flex items-center gap-1.5 self-start transition-colors duration-150 hover:text-signal"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            Alle Case Studies
          </Link>

          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance md:text-5xl lg:text-6xl">
            {study.title}
          </h1>

          <p className="text-lg font-medium text-signal">{study.client}</p>

          {/* Facts as seated chips rather than a pipe-separated string —
              the same treatment /projects/[slug] gives its hero facts. */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="well-sm annotate px-3 py-1.5">{study.industry}</span>
            <span className="well-sm annotate px-3 py-1.5">{study.duration}</span>
            <span className="well-sm annotate px-3 py-1.5">{study.team}</span>
          </div>
        </section>

        {/* ─── Content ─── */}
        <section className="sheet flex flex-col gap-6">
          {study.challenge && (
            <Section>
              <div className="cast rim flex flex-col gap-3 p-7 md:p-8">
                <span className="annotate">Ausgangslage</span>
                <h2 className="font-display text-2xl font-bold tracking-tight">
                  The Challenge
                </h2>
                <p className="measure leading-relaxed text-fg-muted">
                  {study.challenge}
                </p>
              </div>
            </Section>
          )}

          {study.solution && (
            <Section delay={0.1}>
              <div className="cast rim flex flex-col gap-3 p-7 md:p-8">
                <span className="annotate">Vorgehen</span>
                <h2 className="font-display text-2xl font-bold tracking-tight">
                  The Solution
                </h2>
                <p className="measure leading-relaxed text-fg-muted">
                  {study.solution}
                </p>
              </div>
            </Section>
          )}

          {results.length > 0 && (
            <Section delay={0.2}>
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
            </Section>
          )}

          {/* Testimonial — only show if author and company are filled in. */}
          {study.testimonialQuote &&
            study.testimonialAuthor.trim() &&
            study.testimonialCompany.trim() && (
              <Section delay={0.3}>
                <div className="cast rim flex flex-col gap-6 p-7 md:p-8">
                  <blockquote className="font-display text-xl leading-relaxed md:text-2xl">
                    &ldquo;{study.testimonialQuote}&rdquo;
                  </blockquote>
                  <div className="flex flex-col gap-0.5">
                    <p className="font-semibold">{study.testimonialAuthor}</p>
                    <p className="annotate">{study.testimonialCompany}</p>
                  </div>
                </div>
              </Section>
            )}

          {technologies.length > 0 && (
            <Section delay={0.4}>
              <div className="flex flex-col gap-3">
                <span className="annotate">Technologies &amp; Tools</span>
                <div className="flex flex-wrap gap-2">
                  {technologies.map((tech) => (
                    <span
                      key={tech}
                      className="well-sm px-2.5 py-1 font-mono text-xs text-fg-muted"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </Section>
          )}
        </section>

        {/* ─── Pager ─── */}
        <section className="sheet pb-8">
          <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-between">
            <Link
              href="/case-studies"
              className="control inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium md:self-start"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Alle Case Studies
            </Link>

            {nextStudy && nextStudy.slug !== study.slug && (
              <Link
                href={`/case-studies/${nextStudy.slug}`}
                className="cast rim group flex flex-col gap-1 p-5 transition-transform duration-150 ease-out hover:-translate-y-0.5 motion-reduce:transform-none md:min-w-[20rem] md:text-right"
              >
                <span className="annotate inline-flex items-center gap-1.5 md:self-end">
                  Nächste Case Study
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="font-display text-lg font-semibold transition-colors duration-150 group-hover:text-signal">
                  {nextStudy.title}
                </span>
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
