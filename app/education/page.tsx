"use client"

import Link from "next/link"
import PageLayout, { Section } from "../../components/PageLayout"

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

export default function Education() {
  return (
    <PageLayout
      title="Education"
      subtitle="My academic journey in technology and engineering."
    >
      <section className="pb-24 md:pb-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <div>
            {education.map((edu, i) => (
              <Section key={edu.title} delay={i * 0.05}>
                <div
                  className={`py-8 ${
                    i > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-2 md:gap-0 mb-3">
                    <h3 className="font-semibold text-lg md:flex-1">{edu.title}</h3>
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

          <div className="mt-8">
            <Link
              href="/about"
              className="link-underline text-primary text-sm font-medium"
            >
              More about me &rarr;
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
