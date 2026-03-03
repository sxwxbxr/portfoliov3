"use client"

import Link from "next/link"
import PageLayout from "../../components/PageLayout"
import { AnimatedSection } from "../../components/AnimatedSection"
import { StaggerContainer, StaggerItem } from "../../components/StaggerContainer"
import { caseStudies } from "../../src/config"
import { ArrowUpRight, Clock, Building, Users } from "lucide-react"

export default function CaseStudies() {
  return (
    <PageLayout
      title="Case Studies"
      subtitle="Real-world projects, challenges overcome, and measurable results achieved for clients across different industries."
      label="Results"
    >
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <StaggerContainer className="space-y-8" staggerDelay={0.15}>
            {caseStudies.map((study) => (
              <StaggerItem key={study.slug}>
                <div className="bento-card rounded-2xl border border-border bg-card overflow-hidden">
                  <div className="md:flex">
                    <div className="md:w-2/5 bg-gradient-to-br from-primary/5 to-secondary/5 dot-grid p-8 md:p-10 flex flex-col justify-center min-h-[200px]">
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="inline-flex items-center gap-1.5 bg-background/80 rounded-full px-3 py-1">
                          <Building className="w-3 h-3" /> {study.industry}
                        </span>
                        <span className="inline-flex items-center gap-1.5 bg-background/80 rounded-full px-3 py-1">
                          <Clock className="w-3 h-3" /> {study.duration}
                        </span>
                      </div>
                      <h2 className="mt-4 text-2xl md:text-3xl font-bold leading-tight">{study.title}</h2>
                      <p className="mt-2 text-sm font-medium text-primary">{study.client}</p>
                    </div>

                    <div className="md:w-3/5 p-8 md:p-10">
                      <div className="space-y-6">
                        <div>
                          <p className="text-xs font-medium text-primary uppercase tracking-widest mb-2">Challenge</p>
                          <p className="text-sm text-muted-foreground leading-relaxed">{study.challenge}</p>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-primary uppercase tracking-widest mb-2">Key Results</p>
                          <ul className="space-y-2">
                            {study.results.slice(0, 3).map((result, idx) => (
                              <li key={idx} className="flex items-start gap-2.5 text-sm text-muted-foreground">
                                <div className="w-1.5 h-1.5 bg-primary rounded-full mt-1.5 flex-shrink-0" />
                                {result}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex flex-wrap gap-1.5">
                            {study.technologies.slice(0, 4).map((tech) => (
                              <span key={tech} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                                {tech}
                              </span>
                            ))}
                          </div>

                          <Link
                            href={`/case-studies/${study.slug}`}
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
                          >
                            Details <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </div>
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
