export const revalidate = 86400

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import PageLayout, { Section } from "../../components/PageLayout"
import { EmptyState } from "../../components/EmptyState"
import { CareerExplorer } from "@/components/career/CareerExplorer"
import CertificateCard from "@/components/certificates/CertificateCard"
import CertificatesRoadmap from "@/components/certificates/CertificatesRoadmap"
import { getCertificates, getEducationEntries, getExperience } from "@/lib/data"
import { buildCareerTimeline } from "@/lib/career"
import { copy } from "@/lib/copy"

export const metadata = {
  title: copy.career.title,
  description: copy.career.subtitle,
}

export default async function Career() {
  const [work, education, certificates] = await Promise.all([
    getExperience(),
    getEducationEntries(),
    getCertificates(),
  ])

  const timeline = buildCareerTimeline(work, education)

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
      label={copy.career.label(work.length, education.length)}
      title={copy.career.title}
      subtitle={copy.career.subtitle}
    >
      {/* ─── Timeline + entries ────────────────────────────────────────
          One component, because the chart and the entries share a selection:
          the chart is an index into the page rather than a picture of it. */}
      <section className="sheet flex flex-col gap-8 pb-20 md:pb-28">
        {timeline.entries.length === 0 ? (
          <EmptyState label={copy.career.empty} title={copy.career.emptyTitle}>
            {copy.career.emptyBody}
          </EmptyState>
        ) : (
          <>
            <Section className="flex flex-col gap-2">
              <span className="annotate">
                {copy.career.timelineEyebrow(timeline.firstYear, timeline.lastYear)}
              </span>
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                {copy.career.timelineTitle}
              </h2>
              <p className="measure text-sm text-fg-muted">
                {copy.career.timelineHint}
              </p>
            </Section>

            <CareerExplorer timeline={timeline} />
          </>
        )}
      </section>

      {/* ─── Certificates ─── */}
      {certificates.length > 0 && (
        <section className="sheet flex flex-col gap-8 pb-20 md:pb-28">
          <Section className="flex flex-col gap-2">
            <span className="annotate">
              {copy.education.credentialsEyebrow(certificates.length)}
            </span>
            <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
              {copy.education.credentials}
            </h2>
          </Section>

          {completed.length + inProgress.length > 0 && (
            <dl className="grid gap-4 sm:grid-cols-3">
              {[
                { label: copy.education.statusCompleted, value: completed.length },
                { label: copy.education.statusInProgress, value: inProgress.length },
                { label: copy.education.statusPlanned, value: planned.length },
              ].map((stat) => (
                <div key={stat.label} className="cast rim flex flex-col-reverse gap-1 p-5">
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
        </section>
      )}

      {/* ─── Roadmap ─── */}
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
