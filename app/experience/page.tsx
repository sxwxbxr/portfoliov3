"use client"

import PageLayout from "../../components/PageLayout"
import { AnimatedSection } from "../../components/AnimatedSection"
import { StaggerContainer, StaggerItem } from "../../components/StaggerContainer"

const experiences = [
  {
    role: "Project Manager Software and Digitalisation",
    company: "Telsonic Ultrasonics",
    period: "07/2025 – Present",
    current: true,
    responsibilities: [
      "Creating customer specific workflows.",
      "Implementing company intern software projects to increase efficiency.",
      "Adjusting post-setup automation workflows for customers",
      "The link between customer and software, to ensure smooth communication and project success.",
    ],
  },
  {
    role: "Software Developer Apprentice",
    company: "InnoForce EST",
    period: "08/2022 – 07/2024",
    current: false,
    responsibilities: [
      ".NET development and third-party module integration",
      "Implemented test automation templates",
      "Synchronized medical data across multiple locations",
      "Evaluated medical databases in France",
    ],
  },
  {
    role: "Electrical Planner",
    company: "Lepcon GmbH",
    period: "06/2021 – 08/2022",
    current: false,
    responsibilities: [
      "Managed electrotechnical planning and procurement",
      "Coordinated electrical revisions of 150+ sites",
    ],
  },
]

export default function Experience() {
  return (
    <PageLayout
      title="Experience"
      subtitle="My professional journey and key achievements in software development and project management."
      label="Career"
    >
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <StaggerContainer className="space-y-0" staggerDelay={0.15}>
            {experiences.map((exp, index) => (
              <StaggerItem key={exp.company + exp.period}>
                <div className="relative pl-8 pb-12 last:pb-0">
                  {/* Timeline line */}
                  {index < experiences.length - 1 && (
                    <div className="absolute left-[11px] top-6 bottom-0 w-px bg-border" />
                  )}
                  {/* Timeline dot */}
                  <div className={`absolute left-0 top-1.5 w-[23px] h-[23px] rounded-full border-4 border-background ${
                    exp.current ? "bg-primary" : "bg-muted-foreground/30"
                  }`}>
                    {exp.current && (
                      <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-30" />
                    )}
                  </div>

                  <div className="bento-card rounded-2xl border border-border bg-card p-6 md:p-8">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{exp.role}</h3>
                        <p className="text-primary text-sm font-medium">{exp.company}</p>
                      </div>
                      <span className="text-xs text-muted-foreground bg-muted px-3 py-1.5 rounded-full whitespace-nowrap self-start">
                        {exp.period}
                      </span>
                    </div>
                    <ul className="space-y-2.5">
                      {exp.responsibilities.map((item, i) => (
                        <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-primary/60 rounded-full mt-1.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>
    </PageLayout>
  )
}
