"use client"

import PageLayout from "../../components/PageLayout"
import { StaggerContainer, StaggerItem } from "../../components/StaggerContainer"

const education = [
  {
    abbr: "BM",
    title: "Berufsmatura TALS",
    institution: "",
    period: "08/2024 – 07/2025",
    description:
      "Advanced vocational education focusing on technical and scientific subjects, preparing for higher education in engineering and technology fields.",
  },
  {
    abbr: "CS",
    title: "EFZ in Computer Science",
    institution: "Application Development – WISS St. Gallen",
    period: "08/2022 – 07/2024",
    description:
      "Comprehensive training in software development, focusing on .NET technologies, database management, and modern application development practices.",
  },
  {
    abbr: "EP",
    title: "EFZ in Electrical Planning",
    institution: "GBS St. Gallen",
    period: "08/2018 – 07/2022",
    description:
      "Specialized training in electrical systems design, planning, and implementation, providing a strong foundation in technical problem-solving.",
  },
]

export default function Education() {
  return (
    <PageLayout
      title="Education"
      subtitle="My academic journey and continuous learning in technology and engineering."
      label="Learning"
    >
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <StaggerContainer className="grid gap-6 md:grid-cols-3" staggerDelay={0.12}>
            {education.map((edu) => (
              <StaggerItem key={edu.title}>
                <div className="bento-card rounded-2xl border border-border bg-card p-8 h-full flex flex-col">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-6">
                    <span className="text-sm font-bold text-primary">{edu.abbr}</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{edu.title}</h3>
                  {edu.institution && (
                    <p className="text-sm text-muted-foreground mb-1">{edu.institution}</p>
                  )}
                  <p className="text-xs text-muted-foreground mb-4">{edu.period}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">{edu.description}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </PageLayout>
  )
}
