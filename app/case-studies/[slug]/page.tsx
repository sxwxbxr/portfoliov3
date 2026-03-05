"use client"

import { use } from "react"
import Navigation from "../../../components/Navigation"
import { Section } from "../../../components/PageLayout"
import { caseStudies } from "../../../src/config"
import Link from "next/link"

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
        <div className="pt-32">
          <div className="max-w-[1200px] mx-auto px-6 text-center py-24">
            <h1 className="text-4xl font-display font-bold tracking-tight mb-4">Case Study Not Found</h1>
            <p className="text-muted-foreground mb-6">The case study you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/case-studies" className="link-underline text-primary text-sm font-medium">
              &larr; Back to Case Studies
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Find next case study
  const currentIndex = caseStudies.findIndex((s) => s.slug === slug)
  const nextStudy = caseStudies[(currentIndex + 1) % caseStudies.length]

  return (
    <div className="min-h-screen bg-background grain-overlay">
      <Navigation />

      <div className="pt-32">
        {/* Hero */}
        <section className="max-w-[1200px] mx-auto px-6 pb-16 md:pb-20">
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            &larr; All case studies
          </Link>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-[1.05]">
            {study.title}
          </h1>

          <p className="mt-4 text-lg font-medium text-primary">
            {study.client}
          </p>

          {/* Meta bar */}
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 font-mono text-sm text-muted-foreground">
            <span>{study.industry}</span>
            <span className="hidden md:inline text-border">|</span>
            <span>{study.duration}</span>
            <span className="hidden md:inline text-border">|</span>
            <span>{study.team}</span>
          </div>
        </section>

        <div className="border-t border-border" />

        {/* Content */}
        <div className="py-24 md:py-32">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="max-w-3xl space-y-20">
              {/* Challenge */}
              <Section>
                <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-4">
                  The Challenge
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {study.challenge}
                </p>
              </Section>

              {/* Solution */}
              <Section delay={0.1}>
                <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-4">
                  The Solution
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {study.solution}
                </p>
              </Section>

              {/* Results */}
              <Section delay={0.2}>
                <h2 className="text-2xl md:text-3xl font-display font-bold tracking-tight mb-8">
                  Results
                </h2>
                <div className="space-y-0">
                  {study.results.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-start gap-4 py-4 ${
                        index > 0 ? "border-t border-border" : ""
                      }`}
                    >
                      <span className="font-mono text-sm text-muted-foreground mt-0.5">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="text-foreground/90">{result}</span>
                    </div>
                  ))}
                  <div className="border-t border-border" />
                </div>
              </Section>

              {/* Testimonial */}
              {study.testimonial && (
                <Section delay={0.3}>
                  <div className="text-muted-foreground/30 font-display text-6xl md:text-7xl leading-none select-none mb-6">
                    &ldquo;
                  </div>
                  <blockquote className="text-2xl md:text-3xl font-display leading-relaxed -mt-10">
                    {study.testimonial.quote}
                  </blockquote>
                  <div className="mt-8">
                    <p className="font-semibold">{study.testimonial.author}</p>
                    <p className="text-sm text-muted-foreground">{study.testimonial.company}</p>
                  </div>
                </Section>
              )}

              {/* Technologies */}
              <Section delay={0.4}>
                <h3 className="font-display font-semibold text-sm mb-4">Technologies & Tools</h3>
                <p className="text-muted-foreground">
                  {study.technologies.join(", ")}
                </p>
              </Section>
            </div>
          </div>
        </div>

        {/* Navigation footer */}
        <div className="border-t border-border">
          <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <Link
              href="/case-studies"
              className="link-underline text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              &larr; All case studies
            </Link>
            {nextStudy && nextStudy.slug !== study.slug && (
              <Link
                href={`/case-studies/${nextStudy.slug}`}
                className="group text-right"
              >
                <span className="text-sm text-muted-foreground">Next case study</span>
                <p className="font-display font-semibold text-lg group-hover:text-primary transition-colors">
                  {nextStudy.title} &rarr;
                </p>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
