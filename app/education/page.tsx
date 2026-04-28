export const dynamic = "force-dynamic"

import Link from "next/link"
import PageLayout, { Section } from "../../components/PageLayout"
import CertificateCard from "@/components/certificates/CertificateCard"
import CertificatesRoadmap from "@/components/certificates/CertificatesRoadmap"
import { getCertificates } from "@/lib/data"

const education = [
  {
    title: "Berufsmatura TALS",
    institution: "",
    period: "2024 -- 2025",
    description:
      "Advanced vocational education focusing on technical and scientific subjects, preparing for higher education in engineering and technology fields.",
  },
  {
    title: "EFZ in Computer Science",
    institution: "Application Development -- WISS St. Gallen",
    period: "2022 -- 2024",
    description:
      "Comprehensive training in software development, focusing on .NET technologies, database management, and modern application development practices.",
  },
  {
    title: "EFZ in Electrical Planning",
    institution: "GBS St. Gallen",
    period: "2018 -- 2022",
    description:
      "Specialized training in electrical systems design, planning, and implementation, providing a strong foundation in technical problem-solving.",
  },
]

export default async function Education() {
  const certificates = await getCertificates()

  const completed = certificates.filter((c) => c.status === "completed")
  const inProgress = certificates.filter((c) => c.status === "in-progress")
  const planned = certificates.filter((c) => c.status === "planned")

  const groups = [
    { key: "in-progress", label: "In Progress", items: inProgress },
    { key: "completed", label: "Completed", items: completed },
    { key: "planned", label: "Planned", items: planned },
  ].filter((g) => g.items.length > 0)

  const hasRoadmap = certificates.some(
    (c) => c.status !== "completed" && c.plannedStart
  )

  return (
    <PageLayout
      title="Education"
      subtitle="My academic journey -- and the certifications mapping the road ahead."
    >
      {/* Academic background */}
      <section className="pb-16 md:pb-20">
        <div className="max-w-[1200px] mx-auto px-6">
          <div>
            {education.map((edu, i) => (
              <Section key={edu.title} delay={i * 0.05}>
                <div
                  className={`py-8 ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-0 mb-3">
                    <h3 className="font-semibold text-lg md:flex-1">
                      {edu.title}
                    </h3>
                    {edu.institution && (
                      <span className="text-muted-foreground text-sm md:flex-1">
                        {edu.institution}
                      </span>
                    )}
                    <span className="font-mono text-sm text-muted-foreground md:text-right">
                      {edu.period}
                    </span>
                  </div>
                  <p className="text-muted-foreground leading-relaxed max-w-2xl">
                    {edu.description}
                  </p>
                </div>
              </Section>
            ))}
            <div className="border-t border-border" />
          </div>
        </div>
      </section>

      {/* Certificates */}
      <Section className="py-16 md:py-24 border-t border-border">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] items-baseline gap-4 md:gap-8 mb-10">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
              § Certificates
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              Credentials &amp; roadmap
            </h2>
          </div>

          {certificates.length === 0 ? (
            <div className="glass rounded-xl p-10 md:p-14 text-center">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Nothing posted yet
              </p>
              <h3 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
                The shelf is empty -- for now.
              </h3>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto leading-relaxed">
                The next stack of certifications around AI, security, and cloud
                is being planned. Once the first cert is in motion it&apos;ll
                show up here with progress and a roadmap.
              </p>
            </div>
          ) : (
            <>
              <dl className="grid grid-cols-3 border-y border-border mb-12">
                {[
                  { label: "Completed", value: completed.length },
                  { label: "In Progress", value: inProgress.length },
                  { label: "Planned", value: planned.length },
                ].map((stat, i) => (
                  <div
                    key={stat.label}
                    className={`py-6 px-4 ${
                      i > 0 ? "border-l border-border" : ""
                    }`}
                  >
                    <dt className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                      {stat.label}
                    </dt>
                    <dd className="font-display text-3xl md:text-4xl font-semibold mt-2">
                      {String(stat.value).padStart(2, "0")}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="space-y-12 md:space-y-16">
                {groups.map((group) => (
                  <div key={group.key}>
                    <div className="flex items-baseline justify-between gap-4 mb-6">
                      <h3 className="font-display text-xl md:text-2xl font-semibold tracking-tight">
                        {group.label}
                      </h3>
                      <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                        {String(group.items.length).padStart(2, "0")}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {group.items.map((cert) => (
                        <CertificateCard key={cert.id} cert={cert} />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </Section>

      {/* Roadmap timeline */}
      {hasRoadmap && (
        <Section className="py-16 md:py-24 border-t border-border">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] items-baseline gap-4 md:gap-8 mb-10">
              <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                § Roadmap
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
                What&apos;s next on the bench.
              </h2>
            </div>
            <CertificatesRoadmap certs={certificates} />
          </div>
        </Section>
      )}

      <Section className="py-16 md:py-24 border-t border-border">
        <div className="max-w-[1200px] mx-auto px-6">
          <Link
            href="/about"
            className="link-underline text-primary text-sm font-medium"
          >
            More about me &rarr;
          </Link>
        </div>
      </Section>
    </PageLayout>
  )
}
