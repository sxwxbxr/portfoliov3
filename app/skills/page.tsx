"use client"

import PageLayout from "../../components/PageLayout"
import { AnimatedSection } from "../../components/AnimatedSection"
import { StaggerContainer, StaggerItem } from "../../components/StaggerContainer"
import { SkillProgress } from "../../components/SkillProgress"
import { GitHubActivity } from "../../components/GitHubActivity"
import { CurrentlyPlaying } from "../../components/CurrentlyPlaying"

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
      subtitle="Technical expertise and competencies I've developed throughout my career in software development and project management."
      label="Competencies"
    >
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Main skill bars + sidebar */}
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <AnimatedSection>
                <div className="bento-card rounded-2xl border border-border bg-card p-8">
                  <SkillProgress />
                </div>
              </AnimatedSection>
            </div>

            <div className="space-y-6">
              <AnimatedSection delay={0.1}>
                <CurrentlyPlaying />
              </AnimatedSection>
              <AnimatedSection delay={0.2}>
                <GitHubActivity />
              </AnimatedSection>
            </div>
          </div>

          {/* Frameworks, Languages, Certifications */}
          <StaggerContainer className="grid gap-6 md:grid-cols-3" staggerDelay={0.1}>
            <StaggerItem>
              <div className="bento-card rounded-2xl border border-border bg-card p-8 h-full">
                <p className="text-xs font-medium text-primary uppercase tracking-widest mb-4">Frameworks & Tools</p>
                <div className="flex flex-wrap gap-2">
                  {frameworks.map((fw) => (
                    <span key={fw} className="text-xs px-3 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
                      {fw}
                    </span>
                  ))}
                </div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="bento-card rounded-2xl border border-border bg-card p-8 h-full">
                <p className="text-xs font-medium text-primary uppercase tracking-widest mb-4">Languages</p>
                <div className="space-y-3">
                  {languages.map((lang) => (
                    <div key={lang.name} className="flex items-center justify-between text-sm">
                      <span className="font-medium">{lang.name}</span>
                      <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">{lang.level}</span>
                    </div>
                  ))}
                </div>
              </div>
            </StaggerItem>

            <StaggerItem>
              <div className="bento-card rounded-2xl border border-border bg-card p-8 h-full">
                <p className="text-xs font-medium text-primary uppercase tracking-widest mb-4">Certifications</p>
                <div className="p-4 rounded-xl bg-muted/40 border border-border">
                  <p className="text-sm font-medium">N.a.</p>
                  <p className="text-xs text-muted-foreground mt-1">A thoroughly planned Certification Roadmap is set for 2025/26</p>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>

          {/* PM + Technical Skills */}
          <div className="grid gap-6 md:grid-cols-2">
            <AnimatedSection>
              <div className="bento-card rounded-2xl border border-border bg-card p-8 h-full">
                <p className="text-xs font-medium text-primary uppercase tracking-widest mb-6">Project Management</p>
                <ul className="space-y-4">
                  {pmSkills.map((skill) => (
                    <li key={skill.name} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium">{skill.name}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">{skill.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <div className="bento-card rounded-2xl border border-border bg-card p-8 h-full">
                <p className="text-xs font-medium text-primary uppercase tracking-widest mb-6">Technical Expertise</p>
                <ul className="space-y-4">
                  {techSkills.map((skill) => (
                    <li key={skill.name} className="flex items-start gap-3">
                      <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-2 flex-shrink-0" />
                      <div>
                        <span className="text-sm font-medium">{skill.name}</span>
                        <p className="text-xs text-muted-foreground mt-0.5">{skill.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
