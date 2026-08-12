export const revalidate = 86400

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import PageLayout, { Section } from "../../components/PageLayout"
import { EmptyState } from "../../components/EmptyState"
import CertificateCard from "@/components/certificates/CertificateCard"
import CertificatesRoadmap from "@/components/certificates/CertificatesRoadmap"
import { getCertificates, getEducationEntries } from "@/lib/data"
import { copy } from "@/lib/copy"

export default async function Education() {
  const [certificates, education] = await Promise.all([
    getCertificates(),
    getEducationEntries(),
  ])

  const completed = certificates.filter((c) => c.status === "completed")
  const inProgress = certificates.filter((c) => c.status === "in-progress")
  const planned = certificates.filter((c) => c.status === "planned")

  const groups = [
    { key: "in-progress", label: copy.education.statusInProgress, items: inProgress },
    { key: "completed", label: copy.education.statusCompleted, items: completed },
    { key: "planned", label: copy.education.statusPlanned, items: planned },
  ].filter((g) => g.items.length > 0)

  const hasRoadmap = certificates.some(
    (c) => c.status !== "completed" && c.plannedStart
  )

  return (
    <PageLayout
      label={copy.education.label(education.length, certificates.length)}
      title={copy.education.title}
      subtitle={copy.education.subtitle}
    >
      {/* ─── Academic background ───────────────────────────────────────
          Tiles, not a seated channel. /about and /experience already render
          their histories as rows in a well; here each station carries a
          description, so it earns the surface of its own plate. */}
      {education.length > 0 && (
        <section className="sheet flex flex-col gap-8 pb-20 md:pb-28">
          <Section className="flex flex-col gap-2">
            <span className="annotate">
              {copy.education.academicEyebrow(education.length)}
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              {copy.education.academicBackground}
            </h2>
          </Section>

          <div className="grid gap-5 md:grid-cols-2">
            {education.map((edu, i) => (
              <Section key={edu.id} delay={i * 0.05} className="h-full">
                <article className="cast rim flex h-full flex-col gap-3 p-6 md:p-7">
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="annotate">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {edu.period && <span className="annotate">{edu.period}</span>}
                  </div>

                  <h3 className="font-display text-lg font-semibold tracking-tight md:text-xl">
                    {edu.title}
                  </h3>

                  {edu.institution && (
                    <p className="text-sm text-fg-muted">{edu.institution}</p>
                  )}

                  {edu.description && (
                    <p className="text-sm leading-relaxed text-fg-muted">
                      {edu.description}
                    </p>
                  )}
                </article>
              </Section>
            ))}
          </div>
        </section>
      )}

      {/* ─── Credentials ─── */}
      <section className="sheet flex flex-col gap-8 pb-20 md:pb-28">
        <Section className="flex flex-col gap-2">
          <span className="annotate">
            {copy.education.credentialsEyebrow(certificates.length)}
          </span>
          <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            {copy.education.credentials}
          </h2>
        </Section>

        {certificates.length === 0 ? (
          <EmptyState
            label={copy.education.empty}
            title={copy.education.emptyTitle}
          >
            {copy.education.emptyBody}
          </EmptyState>
        ) : (
          <>
            {completed.length + inProgress.length > 0 && (
              // Counters as cast tiles, matching the hero metrics on /.
              // flex-col-reverse keeps dt before dd in the DOM while the
              // number still reads first.
              <dl className="grid gap-4 sm:grid-cols-3">
                {[
                  { label: copy.education.statusCompleted, value: completed.length },
                  { label: copy.education.statusInProgress, value: inProgress.length },
                  { label: copy.education.statusPlanned, value: planned.length },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="cast rim flex flex-col-reverse gap-1 p-5"
                  >
                    <dt className="annotate">{stat.label}</dt>
                    <dd className="font-display text-3xl font-bold tracking-tight tabular md:text-4xl">
                      {String(stat.value).padStart(2, "0")}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            <div className="flex flex-col gap-12 md:gap-16">
              {groups.map((group) => (
                <div key={group.key} className="flex flex-col gap-5">
                  <div className="flex items-baseline justify-between gap-4">
                    <h3 className="font-display text-xl font-semibold tracking-tight md:text-2xl">
                      {group.label}
                    </h3>
                    <span className="annotate">
                      {String(group.items.length).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="grid gap-5 md:grid-cols-2">
                    {group.items.map((cert) => (
                      <CertificateCard key={cert.id} cert={cert} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      {/* ─── Roadmap timeline ─── */}
      {hasRoadmap && (
        <Section className="sheet flex flex-col gap-8 pb-20 md:pb-28">
          <div className="flex flex-col gap-2">
            <span className="annotate">{copy.education.roadmapEyebrow}</span>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              {copy.education.roadmapTitle}
            </h2>
          </div>
          <CertificatesRoadmap certs={certificates} />
        </Section>
      )}

      <section className="sheet pb-24 md:pb-32">
        <Link
          href="/about"
          className="control inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
        >
          {copy.common.moreAboutMe}
          <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>
    </PageLayout>
  )
}
