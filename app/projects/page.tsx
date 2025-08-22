"use client"

import { useState, useMemo } from "react"
import Navigation from "../../components/Navigation"
import PageLayout from "../../components/PageLayout"
import FadeInSection from "../../components/FadeInSection"
import ProjectCard from "../../components/ProjectCard"
import { ProjectFilter } from "../../components/ProjectFilter"
import { InteractiveCard } from "../../components/InteractiveCard"
import { projects } from "../../src/config"

export default function Projects() {
  const [filters, setFilters] = useState({ search: "", selectedTags: [] as string[] })

  // Get all unique tags from projects
  const allTags = useMemo(() => {
    const tags = projects.flatMap((project) => project.tags)
    return [...new Set(tags)].sort()
  }, [])

  // Filter projects based on search and tags
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        project.title.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.description.toLowerCase().includes(filters.search.toLowerCase()) ||
        project.tags.some((tag) => tag.toLowerCase().includes(filters.search.toLowerCase()))

      const matchesTags =
        filters.selectedTags.length === 0 || filters.selectedTags.some((tag) => project.tags.includes(tag))

      return matchesSearch && matchesTags
    })
  }, [filters])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageLayout>
        <div className="space-y-16">
          <FadeInSection>
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                My Projects
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-serif">
                Explore the projects I've worked on and their impact on business operations and digital transformation.
              </p>
            </div>
          </FadeInSection>

          <FadeInSection>
            <ProjectFilter tags={allTags} onFilterChange={setFilters} />
          </FadeInSection>

          <section className="py-12">
            <div className="max-w-6xl mx-auto">
              <FadeInSection>
                {filteredProjects.length > 0 ? (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredProjects.map((project, index) => (
                      <InteractiveCard key={project.slug}>
                        <div
                          className="h-full transform hover:scale-105 transition-all duration-300"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <ProjectCard {...project} />
                        </div>
                      </InteractiveCard>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🔍</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No projects found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search terms or filters to find what you're looking for.
                    </p>
                  </div>
                )}
              </FadeInSection>
            </div>
          </section>

          <FadeInSection>
            <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Have a Project in Mind?</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                I'm always excited to work on new challenges. Let's discuss how I can help bring your ideas to life.
              </p>
              <button className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 hover:scale-105 glow-effect">
                Start a Conversation
              </button>
            </div>
          </FadeInSection>
        </div>
      </PageLayout>
    </div>
  )
}
