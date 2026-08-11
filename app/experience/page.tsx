import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import PageLayout, { Section } from "../../components/PageLayout"
import { EmptyState } from "../../components/EmptyState"
import { getExperience } from "@/lib/data"

export const revalidate = 86400

export default async function Experience() {
  const experience = await getExperience()

  const firstYear = experience
    .map((e) => parseInt(e.period.match(/\d{4}/)?.[0] ?? "", 10))
    .filter((n) => Number.isFinite(n))
    .sort((a, b) => a - b)[0]

  return (
    <PageLayout
      label={
        experience.length === 0
          ? "Werdegang"
          : firstYear
            ? `${experience.length} Stationen · seit ${firstYear}`
            : `${experience.length} Stationen`
      }
      title="Experience"
      subtitle="Mein Weg durch Softwareentwicklung, Projektleitung und Engineering."
    >
      <section className="sheet flex flex-col gap-8 pb-24 md:pb-32">
        {experience.length > 0 ? (
          // A sunken channel with the stations seated in it. The detail pages
          // differ from the homepage summary by carrying responsibilities, so
          // each station is a full plate rather than a single row.
          <div className="well flex flex-col gap-3 p-3 md:p-4">
            {experience.map((exp, i) => (
              <Section key={exp.company + exp.period} delay={i * 0.04}>
                <article
                  className={
                    "cast-sm flex flex-col gap-4 p-5 md:p-6 " +
                    (exp.current ? "border-l-2 border-l-signal" : "")
                  }
                >
                  <header className="flex flex-col gap-1.5 md:flex-row md:items-baseline md:gap-6">
                    <div className="flex items-center gap-2.5 md:flex-1">
                      {exp.current && (
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-signal-bright"
                          aria-hidden="true"
                        />
                      )}
                      <h2
                        className={
                          "font-display text-lg font-semibold tracking-tight " +
                          (exp.current ? "text-signal" : "")
                        }
                      >
                        {exp.company}
                      </h2>
                    </div>
                    <p className="text-sm text-fg-muted md:flex-1">{exp.role}</p>
                    <span className="annotate md:text-right">{exp.period}</span>
                  </header>

                  {exp.description && (
                    <p className="measure text-sm leading-relaxed text-fg-muted">
                      {exp.description}
                    </p>
                  )}

                  {(exp.responsibilities as string[]).length > 0 && (
                    <ul className="flex flex-col gap-2">
                      {(exp.responsibilities as string[]).map((item, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm">
                          <span
                            className="mt-2 h-px w-3 shrink-0 bg-edge"
                            aria-hidden="true"
                          />
                          <span className="leading-relaxed text-fg-muted">{item}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              </Section>
            ))}
          </div>
        ) : (
          <EmptyState>Noch keine Stationen hinterlegt.</EmptyState>
        )}

        <Link
          href="/about"
          className="control inline-flex items-center gap-2 self-start px-4 py-2.5 text-sm font-medium"
        >
          Mehr über mich
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </PageLayout>
  )
}
