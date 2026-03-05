"use client"

import Link from "next/link"
import Image from "next/image"
import PageLayout, { Section } from "../../components/PageLayout"

const expertise = [
  {
    category: "Development",
    skills: "C#, .NET, TypeScript, React, Next.js, SQL, REST APIs, Python",
  },
  {
    category: "Project Management",
    skills: "Agile / Scrum, Stakeholder Management, Requirements Engineering, Risk Management",
  },
  {
    category: "Tools & Platforms",
    skills: "Azure DevOps, Git, Docker, Vercel, Jira, Supabase",
  },
]

const education = [
  {
    title: "Berufsmatura TALS",
    institution: "",
    period: "2024 -- 2025",
  },
  {
    title: "EFZ in Computer Science",
    institution: "Application Development -- WISS St. Gallen",
    period: "2022 -- 2024",
  },
  {
    title: "EFZ in Electrical Planning",
    institution: "GBS St. Gallen",
    period: "2018 -- 2022",
  },
]

export default function About() {
  return (
    <PageLayout
      title="About"
      subtitle="Project manager, developer, and builder of lean digital solutions in St. Gallen, Switzerland."
    >
      {/* Bio */}
      <Section className="pb-24 md:pb-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_0.4fr] gap-16 md:gap-12">
            {/* Left -- text */}
            <div className="max-w-3xl space-y-6">
              <p className="text-xl md:text-2xl leading-relaxed text-foreground/90">
                I&apos;m a Software & Digitalization Project Manager at Telsonic, creating customer-specific automation
                workflows in business-critical systems. I also run Weber Development, building custom software for various companies.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground">
                With a dual background in software engineering and electrical design, I turn complex operational
                needs into clear requirements, lean processes, and maintainable solutions. My career path has taken me
                through electrical planning, energy optimization for a Swiss banking portfolio, healthcare data migration, and
                now into industrial automation and SaaS product development.
              </p>
              <p className="text-lg leading-relaxed text-muted-foreground">
                I believe in creating solutions that not only solve immediate problems but also scale with business
                growth. My experience spans from hands-on development to strategic project management, allowing me
                to bridge the gap between technical implementation and business objectives.
              </p>
            </div>

            {/* Right -- photo + facts */}
            <div className="space-y-8">
              <Image
                src="/260216_professionalMG.jpeg"
                alt="Seya Weber, Project Manager and Software Developer"
                width={400}
                height={533}
                className="aspect-[3/4] w-full rounded-sm object-cover object-top"
              />
              <div className="space-y-3">
                {[
                  { label: "Location", value: "St. Gallen, CH" },
                  { label: "Experience", value: "3+ Years" },
                  { label: "Focus", value: "Automation & PM" },
                  { label: "Languages", value: "DE, EN, FR" },
                ].map((fact) => (
                  <div key={fact.label} className="flex justify-between text-sm border-b border-border pb-3 last:border-0">
                    <span className="text-muted-foreground">{fact.label}</span>
                    <span className="font-mono">{fact.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Expertise */}
      <Section className="py-24 md:py-32 border-t border-border">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-16">
            Expertise
          </h2>

          <div className="space-y-0">
            {expertise.map((area, i) => (
              <div
                key={area.category}
                className={`grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-12 py-6 ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <h3 className="font-display font-semibold text-sm md:text-base">
                  {area.category}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {area.skills}
                </p>
              </div>
            ))}
            <div className="border-t border-border" />
          </div>
        </div>
      </Section>

      {/* Education */}
      <Section className="py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-12">
            Education
          </h2>

          <div>
            {education.map((edu, i) => (
              <div
                key={edu.title}
                className={`flex flex-col md:flex-row md:items-center gap-1 md:gap-0 py-4 ${
                  i > 0 ? "border-t border-border" : ""
                }`}
              >
                <span className="font-semibold md:flex-1">{edu.title}</span>
                {edu.institution && (
                  <span className="text-muted-foreground text-sm md:flex-1">
                    {edu.institution}
                  </span>
                )}
                <span className="font-mono text-sm text-muted-foreground md:text-right">
                  {edu.period}
                </span>
              </div>
            ))}
            <div className="border-t border-border" />
          </div>
        </div>
      </Section>

      {/* Connect */}
      <Section className="py-24 md:py-32 border-t border-border">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight">
                Want to work together?
              </h2>
              <p className="mt-2 text-muted-foreground">
                I&apos;m available for new projects and collaborations.
              </p>
            </div>
            <div className="flex items-center gap-6">
              <Link
                href="/contact"
                className="link-underline text-primary font-medium"
              >
                Get in touch &rarr;
              </Link>
              <a
                href="/documents/CV_SeyaWeber.pdf"
                className="link-underline text-sm text-muted-foreground hover:text-foreground transition-colors"
                download
              >
                Download CV
              </a>
            </div>
          </div>
        </div>
      </Section>
    </PageLayout>
  )
}
