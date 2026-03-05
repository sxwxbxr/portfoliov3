"use client"

import Link from "next/link"
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

const frameworks = [".NET 8", "WPF", "React", "Next.js", "Android Studio", "PySide6", "QtWebEngine"]

const languages = [
  { name: "English", level: "C1 Advanced" },
  { name: "German", level: "Native" },
  { name: "French", level: "B2" },
]

const pmSkills = [
  { name: "Agile Methodologies", detail: "Scrum, Kanban, and hybrid approaches" },
  { name: "Requirements Analysis", detail: "Stakeholder interviews and documentation" },
  { name: "Process Optimization", detail: "Workflow automation and efficiency improvements" },
  { name: "Team Leadership", detail: "Cross-functional team coordination" },
]

const techSkills = [
  { name: "Database Design", detail: "SQL Server, PostgreSQL optimization" },
  { name: "API Development", detail: "RESTful services and integration" },
  { name: "Test Automation", detail: "Unit, integration, and E2E testing" },
  { name: "System Architecture", detail: "Usage of GO4 patterns and microservices" },
]

export default function Skills() {
  return (
    <PageLayout
      title="Skills & Expertise"
      subtitle="Technical expertise and competencies developed across software development, project management, and engineering."
    >
      {/* Core expertise */}
      <section className="pb-24 md:pb-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="space-y-0">
            {expertise.map((area, i) => (
              <Section key={area.category} delay={i * 0.05}>
                <div
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
              </Section>
            ))}
            <div className="border-t border-border" />
          </div>
        </div>
      </section>

      {/* Frameworks */}
      <section className="py-24 md:py-32 border-t border-border">
        <div className="max-w-[1200px] mx-auto px-6">
          <Section>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-12">
              Frameworks & Tools
            </h2>
            <p className="text-muted-foreground">
              {frameworks.join(", ")}
            </p>
          </Section>
        </div>
      </section>

      {/* Detailed skills */}
      <section className="py-24 md:py-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <Section>
              <div className="glass rounded-xl p-6">
                <h2 className="text-2xl font-display font-bold tracking-tight mb-8">
                  Project Management
                </h2>
                <div>
                  {pmSkills.map((skill, i) => (
                    <div
                      key={skill.name}
                      className={`py-4 ${i > 0 ? "border-t border-border" : ""}`}
                    >
                      <p className="font-semibold text-sm">{skill.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{skill.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Section>

            <Section delay={0.1}>
              <div className="glass rounded-xl p-6">
                <h2 className="text-2xl font-display font-bold tracking-tight mb-8">
                  Technical Expertise
                </h2>
                <div>
                  {techSkills.map((skill, i) => (
                    <div
                      key={skill.name}
                      className={`py-4 ${i > 0 ? "border-t border-border" : ""}`}
                    >
                      <p className="font-semibold text-sm">{skill.name}</p>
                      <p className="text-sm text-muted-foreground mt-1">{skill.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </Section>
          </div>
        </div>
      </section>

      {/* Languages */}
      <section className="py-24 md:py-32 border-t border-border">
        <div className="max-w-[1200px] mx-auto px-6">
          <Section>
            <h2 className="text-3xl md:text-4xl font-display font-bold tracking-tight mb-12">
              Languages
            </h2>
            <div>
              {languages.map((lang, i) => (
                <div
                  key={lang.name}
                  className={`flex items-center justify-between py-4 ${
                    i > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <span className="font-semibold">{lang.name}</span>
                  <span className="font-mono text-sm text-muted-foreground">{lang.level}</span>
                </div>
              ))}
              <div className="border-t border-border" />
            </div>
          </Section>

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
