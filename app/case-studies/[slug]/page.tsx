"use client"

import { use } from "react"
import Navigation from "../../../components/Navigation"
import { AnimatedSection } from "../../../components/AnimatedSection"
import { caseStudies } from "../../../src/config"
import Link from "next/link"
import { ArrowLeft, Users, Clock, Building, CheckCircle, Quote } from "lucide-react"
import Image from "next/image"

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>
}

export default function CaseStudy({ params }: CaseStudyPageProps) {
  const { slug } = use(params)
  const study = caseStudies.find((s) => s.slug === slug)

  if (!study) {
    return (
      <div className="min-h-screen bg-background grain-overlay">
        <Navigation />
        <div className="pt-16">
          <div className="py-20 px-6 text-center">
            <h1 className="text-4xl font-bold mb-4">Case Study Not Found</h1>
            <p className="text-muted-foreground mb-6">The case study you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/case-studies" className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Case Studies
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background grain-overlay">
      <Navigation />

      <div className="pt-16">
        <section className="py-20 md:py-28 px-6 mesh-gradient">
          <div className="max-w-4xl mx-auto">
            <Link
              href="/case-studies"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              All Case Studies
            </Link>

            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
              <span className="inline-flex items-center gap-1.5 bg-card/80 rounded-full px-3 py-1 border border-border">
                <Building className="w-3 h-3" /> {study.industry}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-card/80 rounded-full px-3 py-1 border border-border">
                <Clock className="w-3 h-3" /> {study.duration}
              </span>
              <span className="inline-flex items-center gap-1.5 bg-card/80 rounded-full px-3 py-1 border border-border">
                <Users className="w-3 h-3" /> {study.team}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight mb-4">
              {study.title}
            </h1>
            <p className="text-lg font-medium text-primary">{study.client}</p>
          </div>
        </section>

        <main className="py-20 md:py-28 px-6">
          <div className="max-w-4xl mx-auto">
            <AnimatedSection>
              <div className="overflow-hidden rounded-2xl border border-border mb-16">
                <Image
                  src={`/abstract-geometric-shapes.png?height=400&width=800&query=${encodeURIComponent(study.title)}`}
                  alt={study.title}
                  width={800}
                  height={400}
                  className="w-full h-64 md:h-96 object-cover"
                />
              </div>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-12">
              <div className="md:col-span-2 space-y-12">
                <AnimatedSection>
                  <div>
                    <p className="text-xs font-medium text-primary uppercase tracking-widest mb-3">Challenge</p>
                    <h2 className="text-2xl font-bold mb-4">The Challenge</h2>
                    <p className="text-muted-foreground leading-relaxed">{study.challenge}</p>
                  </div>
                </AnimatedSection>

                <AnimatedSection delay={0.1}>
                  <div>
                    <p className="text-xs font-medium text-primary uppercase tracking-widest mb-3">Solution</p>
                    <h2 className="text-2xl font-bold mb-4">The Solution</h2>
                    <p className="text-muted-foreground leading-relaxed">{study.solution}</p>
                  </div>
                </AnimatedSection>

                <AnimatedSection delay={0.2}>
                  <div>
                    <p className="text-xs font-medium text-primary uppercase tracking-widest mb-3">Outcomes</p>
                    <h2 className="text-2xl font-bold mb-6">Results Achieved</h2>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {study.results.map((result, index) => (
                        <div key={index} className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card">
                          <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{result}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>

                {study.testimonial && (
                  <AnimatedSection delay={0.3}>
                    <div className="bento-card rounded-2xl border border-primary/20 bg-primary/5 p-8">
                      <Quote className="w-8 h-8 text-primary/30 mb-4" />
                      <blockquote className="text-lg italic leading-relaxed mb-4">
                        &quot;{study.testimonial.quote}&quot;
                      </blockquote>
                      <div className="text-sm text-muted-foreground">
                        <p className="font-medium text-foreground">{study.testimonial.author}</p>
                        <p>{study.testimonial.company}</p>
                      </div>
                    </div>
                  </AnimatedSection>
                )}
              </div>

              <div className="space-y-6">
                <AnimatedSection delay={0.1}>
                  <div className="bento-card rounded-2xl border border-border bg-card p-6">
                    <p className="text-xs font-medium text-primary uppercase tracking-widest mb-4">Stack</p>
                    <div className="flex flex-wrap gap-2">
                      {study.technologies.map((tech) => (
                        <span key={tech} className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-xs font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>

                <AnimatedSection delay={0.2}>
                  <div className="bento-card rounded-2xl border border-border bg-card p-6">
                    <p className="text-xs font-medium text-primary uppercase tracking-widest mb-4">Details</p>
                    <div className="space-y-3 text-sm">
                      {[
                        { label: "Industry", value: study.industry },
                        { label: "Duration", value: study.duration },
                        { label: "Team Size", value: study.team },
                      ].map((detail) => (
                        <div key={detail.label} className="flex justify-between">
                          <span className="text-muted-foreground">{detail.label}</span>
                          <span className="font-medium">{detail.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </AnimatedSection>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
