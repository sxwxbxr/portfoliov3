import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowUpRight } from "lucide-react"
import PageLayout, { Section } from "../../components/PageLayout"
import { EmptyState } from "../../components/EmptyState"
import { getCaseStudies } from "@/lib/data"
import { CASE_STUDIES_ENABLED } from "@/lib/features"
import { copy } from "@/lib/copy"

export const revalidate = 86400

export default async function CaseStudies() {
  if (!CASE_STUDIES_ENABLED) notFound()
  const caseStudies = await getCaseStudies()

  return (
    <PageLayout
      label={copy.caseStudies.label(caseStudies.length)}
      title={copy.caseStudies.title}
      subtitle={copy.caseStudies.subtitle}
    >
      <section className="sheet flex flex-col gap-10 pb-24 md:pb-32">
        {caseStudies.length > 0 ? (
          // A collection, so: tiles. The row list this replaced gave every
          // study the same hairline and no object shape of its own.
          <div className="grid gap-5 md:grid-cols-2">
            {caseStudies.map((study, i) => (
              <Section key={study.slug} delay={i * 0.04} className="h-full">
                <Link
                  href={`/case-studies/${study.slug}`}
                  className="cast rim group flex h-full flex-col gap-4 p-6 transition-transform duration-150 ease-out hover:-translate-y-0.5 motion-reduce:transform-none md:p-7"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="annotate" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0 text-fg-subtle transition-colors duration-150 group-hover:text-signal"
                      aria-hidden="true"
                    />
                  </div>

                  <h2 className="font-display text-xl font-semibold tracking-tight transition-colors duration-150 group-hover:text-signal md:text-2xl">
                    {study.title}
                  </h2>

                  <p className="measure text-sm leading-relaxed text-fg-muted">
                    {study.challenge}
                  </p>

                  <div className="mt-auto flex flex-wrap items-center gap-2 pt-1">
                    <span className="well-sm annotate px-2.5 py-1">{study.client}</span>
                    <span className="well-sm annotate px-2.5 py-1">{study.industry}</span>
                    <span className="well-sm annotate px-2.5 py-1">{study.duration}</span>
                  </div>
                </Link>
              </Section>
            ))}
          </div>
        ) : (
          <EmptyState>{copy.caseStudies.empty}</EmptyState>
        )}
      </section>
    </PageLayout>
  )
}
