"use client"

import Navigation from "../../components/Navigation"
import PageLayout from "../../components/PageLayout"
import FadeInSection from "../../components/FadeInSection"
import { InteractiveCard } from "../../components/InteractiveCard"
import { caseStudies } from "../../src/config"
import Link from "next/link"
import { ArrowRight, Users, Clock, Building } from "lucide-react"
import Image from "next/image"

export default function CaseStudies() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageLayout>
        <div className="space-y-16">
          <FadeInSection>
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Case Studies
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-serif">
                Real-world projects, challenges overcome, and measurable results achieved for clients across different
                industries.
              </p>
            </div>
          </FadeInSection>

          <FadeInSection>
            <div className="grid gap-12">
              {caseStudies.map((study) => (
                <InteractiveCard key={study.id}>
                  <div className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="md:flex">
                      <div className="md:w-2/5">
                        <div className="h-64 md:h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <Image
                            src={`/abstract-geometric-shapes.png?height=400&width=600&query=${encodeURIComponent(study.title)}`}
                            alt={study.title}
                            width={600}
                            height={400}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="md:w-3/5 p-8">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
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

                        <h2 className="text-2xl font-bold mb-2">{study.title}</h2>
                        <p className="text-primary font-medium mb-4">{study.client}</p>

                        <div className="space-y-4 mb-6">
                          <div>
                            <h3 className="font-semibold mb-2">Challenge</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">{study.challenge}</p>
                          </div>

                          <div>
                            <h3 className="font-semibold mb-2">Key Results</h3>
                            <ul className="text-sm text-muted-foreground space-y-1">
                              {study.results.slice(0, 2).map((result, idx) => (
                                <li key={idx} className="flex items-center gap-2">
                                  <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                                  {result}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                            {study.technologies.slice(0, 3).map((tech) => (
                              <span key={tech} className="px-2 py-1 bg-secondary/10 text-secondary rounded text-xs">
                                {tech}
                              </span>
                            ))}
                            {study.technologies.length > 3 && (
                              <span className="px-2 py-1 bg-muted text-muted-foreground rounded text-xs">
                                +{study.technologies.length - 3} more
                              </span>
                            )}
                          </div>

                          <Link
                            href={`/case-studies/${study.id}`}
                            className="flex items-center gap-2 text-primary hover:gap-3 transition-all duration-200 font-medium"
                          >
                            View Details
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </InteractiveCard>
              ))}
            </div>
          </FadeInSection>
        </div>
      </PageLayout>
    </div>
  )
}
