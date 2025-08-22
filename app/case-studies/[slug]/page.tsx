"use client"

import { use } from "react"
import Navigation from "../../../components/Navigation"
import PageLayout from "../../../components/PageLayout"
import FadeInSection from "../../../components/FadeInSection"
import { caseStudies } from "../../../src/config"
import Link from "next/link"
import { ArrowLeft, Users, Clock, Building, CheckCircle, Quote } from "lucide-react"
import Image from "next/image"

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>
}

export default function CaseStudy({ params }: CaseStudyPageProps) {
  const { slug } = use(params)
  const study = caseStudies.find((s) => s.id === slug)

  if (!study) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <PageLayout>
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Case Study Not Found</h1>
            <p className="text-muted-foreground">The case study you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/case-studies" className="inline-flex items-center gap-2 text-primary hover:underline">
              <ArrowLeft className="w-4 h-4" />
              Back to Case Studies
            </Link>
          </div>
        </PageLayout>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageLayout>
        <div className="max-w-4xl mx-auto">
          <FadeInSection>
            <div className="mb-8">
              <Link
                href="/case-studies"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Case Studies
              </Link>

              <div className="space-y-6">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Building className="w-4 h-4" />
                    <span>{study.industry}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{study.duration}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>{study.team}</span>
                  </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold leading-tight">{study.title}</h1>

                <p className="text-xl text-primary font-medium">{study.client}</p>
              </div>
            </div>
          </FadeInSection>

          <FadeInSection>
            <div className="mb-12">
              <Image
                src={`/abstract-geometric-shapes.png?height=400&width=800&query=${encodeURIComponent(study.title)}`}
                alt={study.title}
                width={800}
                height={400}
                className="w-full h-64 md:h-96 object-cover rounded-xl"
              />
            </div>
          </FadeInSection>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2 space-y-12">
              <FadeInSection>
                <div>
                  <h2 className="text-2xl font-bold mb-4">The Challenge</h2>
                  <p className="text-muted-foreground leading-relaxed">{study.challenge}</p>
                </div>
              </FadeInSection>

              <FadeInSection>
                <div>
                  <h2 className="text-2xl font-bold mb-4">The Solution</h2>
                  <p className="text-muted-foreground leading-relaxed">{study.solution}</p>
                </div>
              </FadeInSection>

              <FadeInSection>
                <div>
                  <h2 className="text-2xl font-bold mb-6">Results Achieved</h2>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {study.results.map((result, index) => (
                      <div key={index} className="flex items-start gap-3 p-4 bg-card border border-border rounded-lg">
                        <CheckCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{result}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeInSection>

              {study.testimonial && (
                <FadeInSection>
                  <div className="bg-primary/5 border border-primary/20 rounded-xl p-8">
                    <Quote className="w-8 h-8 text-primary mb-4" />
                    <blockquote className="text-lg italic mb-4">&quot;{study.testimonial.quote}&quot;</blockquote>
                    <div className="text-sm text-muted-foreground">
                      <p className="font-medium">{study.testimonial.author}</p>
                      <p>{study.testimonial.company}</p>
                    </div>
                  </div>
                </FadeInSection>
              )}
            </div>

            <div className="space-y-8">
              <FadeInSection>
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-bold mb-4">Technologies Used</h3>
                  <div className="flex flex-wrap gap-2">
                    {study.technologies.map((tech) => (
                      <span key={tech} className="px-3 py-1 bg-secondary/10 text-secondary rounded-full text-sm">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </FadeInSection>

              <FadeInSection>
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="font-bold mb-4">Project Details</h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Industry:</span>
                      <span>{study.industry}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Duration:</span>
                      <span>{study.duration}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Team Size:</span>
                      <span>{study.team}</span>
                    </div>
                  </div>
                </div>
              </FadeInSection>
            </div>
          </div>
        </div>
      </PageLayout>
    </div>
  )
}
