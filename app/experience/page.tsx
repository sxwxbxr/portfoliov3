"use client"

import PageLayout from "../../components/PageLayout"
import FadeInSection from "../../components/FadeInSection"

export default function Experience() {
  return (
    <PageLayout
      title="Experience"
      subtitle="My professional journey and key achievements in software development and project management"
    >
      <section className="py-24 px-4">
        <div className="max-w-6xl mx-auto">
          <FadeInSection>
            <div className="space-y-8">
              <div className="relative bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="absolute -left-4 top-8 w-8 h-8 bg-primary rounded-full border-4 border-background"></div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <h3 className="text-xl font-semibold text-card-foreground">
                    Project Manager Software and Digitalisation
                  </h3>
                  <span className="text-sm text-muted-foreground bg-primary/10 px-3 py-1 rounded-full">
                    07/2025 – Present
                  </span>
                </div>
                <p className="text-primary font-medium mb-4">Telsonic Ultrasonics</p>
                <ul className="space-y-2 text-card-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    Creating customer specific workflows.
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    Implementing company intern software projects to increase efficiency.
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    Adjusting post-setup automation workflows for customers
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                    The link between customer and software, to ensure smooth communication and project success.
                  </li>
                </ul>
              </div>

              <div className="relative bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="absolute -left-4 top-8 w-8 h-8 bg-secondary rounded-full border-4 border-background"></div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <h3 className="text-xl font-semibold text-card-foreground">Software Developer Apprentice</h3>
                  <span className="text-sm text-muted-foreground bg-secondary/10 px-3 py-1 rounded-full">
                    08/2022 – 07/2024
                  </span>
                </div>
                <p className="text-secondary font-medium mb-4">InnoForce EST</p>
                <ul className="space-y-2 text-card-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                    .NET development and third-party module integration
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                    Implemented test automation templates
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                    Synchronized medical data across multiple locations
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                    Evaluated medical databases in France
                  </li>
                </ul>
              </div>

              <div className="relative bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="absolute -left-4 top-8 w-8 h-8 bg-accent rounded-full border-4 border-background"></div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                  <h3 className="text-xl font-semibold text-card-foreground">Electrical Planner</h3>
                  <span className="text-sm text-muted-foreground bg-accent/10 px-3 py-1 rounded-full">
                    06/2021 – 08/2022
                  </span>
                </div>
                <p className="text-accent font-medium mb-4">Lepcon GmbH</p>
                <ul className="space-y-2 text-card-foreground">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                    Managed electrotechnical planning and procurement
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0"></div>
                    Coordinated electrical revisions of 150+ sites
                  </li>
                </ul>
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>
    </PageLayout>
  )
}
