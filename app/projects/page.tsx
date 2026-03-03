"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import PageLayout from "../../components/PageLayout"
import { AnimatedSection } from "../../components/AnimatedSection"
import { StaggerContainer, StaggerItem } from "../../components/StaggerContainer"
import { ProjectFilter } from "../../components/ProjectFilter"
import { projects } from "../../src/config"
import { ArrowUpRight, ExternalLink } from "lucide-react"
import { SiGithub } from "react-icons/si"

export default function Projects() {
  const [filters, setFilters] = useState({ search: "", selectedTags: [] as string[] })

  const allTags = useMemo(() => {
    const tags = projects.flatMap((project) => project.tags)
    return [...new Set(tags)].sort()
  }, [])

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.shortDescription.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.tags.some((tag) => tag.toLowerCase().includes(filters.search.toLowerCase()))

      const matchesTags =
        filters.selectedTags.length === 0 || filters.selectedTags.some((tag) => project.tags.includes(tag))

      return matchesSearch && matchesTags
    })
  }, [filters])

  return (
    <PageLayout
      title="Projects"
      subtitle="Explore the projects I've worked on and their impact on business operations and digital transformation."
      label="My work"
    >
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <ProjectFilter tags={allTags} onFilterChange={setFilters} />
          </AnimatedSection>

          <div className="mt-12">
            {filteredProjects.length > 0 ? (
              <StaggerContainer className="grid gap-6 md:grid-cols-2 lg:grid-cols-3" staggerDelay={0.08}>
                {filteredProjects.map((project) => {
                  const hasDemo = Boolean(project.demo && project.demo !== "#")
                  const hasGithub = Boolean(project.github && project.github !== "#")

                  return (
                    <StaggerItem key={project.slug}>
                      <div className="bento-card rounded-2xl border border-border bg-card overflow-hidden h-full flex flex-col">
                        <div className="aspect-[16/10] bg-gradient-to-br from-primary/5 to-secondary/5 dot-grid relative">
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-5xl font-bold text-primary/10">{project.title.charAt(0)}</span>
                          </div>
                          <div className="absolute bottom-3 left-3 flex gap-2">
                            {hasDemo && (
                              <a
                                href={project.demo}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg glass text-foreground hover:text-primary transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            )}
                            {hasGithub && (
                              <a
                                href={project.github}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 rounded-lg glass text-foreground hover:text-primary transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <SiGithub className="w-4 h-4" />
                              </a>
                            )}
                          </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            {project.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                                {tag}
                              </span>
                            ))}
                          </div>
                          <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed flex-1 line-clamp-2">
                            {project.shortDescription}
                          </p>
                          <Link
                            href={`/projects/${project.slug}`}
                            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:gap-2.5 transition-all"
                          >
                            View details <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    </StaggerItem>
                  )
                })}
              </StaggerContainer>
            ) : (
              <AnimatedSection>
                <div className="text-center py-20">
                  <p className="text-4xl mb-4">0</p>
                  <h3 className="text-lg font-semibold mb-2">No projects found</h3>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your search terms or filters.
                  </p>
                </div>
              </AnimatedSection>
            )}
          </div>

          <AnimatedSection delay={0.2}>
            <div className="mt-20 bento-card rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-secondary/5 p-10 md:p-14 text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Have a project in mind?</h3>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                I&apos;m always excited to work on new challenges. Let&apos;s discuss how I can help bring your ideas to life.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full text-sm font-medium hover:opacity-80 transition-opacity"
              >
                Start a conversation
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </PageLayout>
  )
}
