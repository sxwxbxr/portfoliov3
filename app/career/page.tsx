export const revalidate = 86400

import Link from "next/link"
import { ChevronRight } from "lucide-react"
import PageLayout from "../../components/PageLayout"
import { Block } from "../../components/site/Block"
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
      {timeline.entries.length === 0 ? (
        <section className="sheet pb-18 md:pb-24">
          <EmptyState label={copy.career.empty} title={copy.career.emptyTitle}>
            {copy.career.emptyBody}
          </EmptyState>
        </section>
      ) : (
        <Block
          flush
          label={copy.career.timelineEyebrow(timeline.firstYear, timeline.lastYear)}
          title={copy.career.timelineTitle}
          sub={copy.career.timelineSub}
          lede={<p>{copy.career.timelineHint}</p>}
        >
          <CareerExplorer timeline={timeline} />
        </Block>
      )}

      {/* ─── Certificates ─── */}
      {certificates.length > 0 && (
        <Block
          label={copy.education.credentialsEyebrow(certificates.length)}
          title={copy.education.credentials}
          sub={copy.education.credentialsSub}
        >
          <div className="flex flex-col gap-12 md:gap-16">
            {completed.length + inProgress.length > 0 && (
              <dl className="grid gap-3 sm:grid-cols-3">
                {[
                  { label: copy.education.statusCompleted, value: completed.length },
                  { label: copy.education.statusInProgress, value: inProgress.length },
                  { label: copy.education.statusPlanned, value: planned.length },
                ].map((stat) => (
                  <div key={stat.label} className="cast flex flex-col-reverse gap-1 p-5">
                    <dt className="annotate">{stat.label}</dt>
                    <dd className="text-3xl tracking-tight tabular md:text-4xl">
                      {String(stat.value).padStart(2, "0")}
                    </dd>
                  </div>
                ))}
              </dl>
            )}

            {groups.map((group) => (
              <div key={group.key} className="flex flex-col gap-5">
                <div className="flex items-baseline justify-between gap-4 border-b border-edge-soft pb-3">
                  <h3 className="text-lg tracking-tight">{group.label}</h3>
                  <span className="annotate">
                    {String(group.items.length).padStart(2, "0")}
                  </span>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  {group.items.map((cert) => (
                    <CertificateCard key={cert.id} cert={cert} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Block>
      )}

      {/* ─── Roadmap ─── */}
      {hasRoadmap && (
        <Block
          label={copy.education.roadmapEyebrow}
          title={copy.education.roadmapTitle}
        >
          <CertificatesRoadmap certs={certificates} />
        </Block>
      )}

      <section className="sheet pb-24 md:pb-32">
        <Link
          href="/about"
          className="control inline-flex items-center gap-1 py-2 pr-3 pl-4 text-sm"
        >
          {copy.common.moreAboutMe}
          <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Link>
      </section>
    </PageLayout>
  )
}
