"use client"

import Navigation from "../../components/Navigation"
import PageLayout from "../../components/PageLayout"
import FadeInSection from "../../components/FadeInSection"
import { SkillProgress } from "../../components/SkillProgress"
import { GitHubActivity } from "../../components/GitHubActivity"
import { CurrentlyPlaying } from "../../components/CurrentlyPlaying"
import { InteractiveCard } from "../../components/InteractiveCard"

export default function Skills() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageLayout>
        <div className="space-y-16">
          <FadeInSection>
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Skills & Expertise
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-serif">
                Technical expertise and competencies I've developed throughout my career in software development and
                project management.
              </p>
            </div>
          </FadeInSection>

          <section className="py-12">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                  <FadeInSection>
                    <SkillProgress />
                  </FadeInSection>
                </div>

                <div className="space-y-6">
                  <FadeInSection>
                    <CurrentlyPlaying />
                  </FadeInSection>

                  <FadeInSection>
                    <GitHubActivity />
                  </FadeInSection>
                </div>
              </div>
            </div>
          </section>

          <FadeInSection>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <InteractiveCard>
                <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-all duration-300 h-full">
                  <h3 className="text-xl font-semibold mb-6 text-primary">Frameworks & Tools</h3>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        .NET 8
                      </span>
                      <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        WPF
                      </span>
                      <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        React
                      </span>
                      <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        Next.js
                      </span>
                      <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        Android Studio
                      </span>
                      <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        PySide6
                      </span>
                      <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                        QtWebEngine
                      </span>
                    </div>
                  </div>
                </div>
              </InteractiveCard>

              <InteractiveCard>
                <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-all duration-300 h-full">
                  <h3 className="text-xl font-semibold mb-6 text-secondary">Languages</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">English</span>
                      <span className="text-sm text-muted-foreground bg-secondary/10 px-2 py-1 rounded">
                        C1 Advanced
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">German</span>
                      <span className="text-sm text-muted-foreground bg-secondary/10 px-2 py-1 rounded">Native</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">French</span>
                      <span className="text-sm text-muted-foreground bg-secondary/10 px-2 py-1 rounded">B2</span>
                    </div>
                  </div>
                </div>
              </InteractiveCard>

              <InteractiveCard>
                <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-all duration-300 h-full">
                  <h3 className="text-xl font-semibold mb-6 text-accent">Certifications</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg">
                      <h4 className="font-medium text-sm">Microsoft Certified</h4>
                      <p className="text-xs text-muted-foreground">Azure Developer Associate</p>
                    </div>
                    <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg">
                      <h4 className="font-medium text-sm">Scrum Master</h4>
                      <p className="text-xs text-muted-foreground">Certified ScrumMaster (CSM)</p>
                    </div>
                  </div>
                </div>
              </InteractiveCard>
            </div>
          </FadeInSection>

          <FadeInSection>
            <div className="grid md:grid-cols-2 gap-8">
              <InteractiveCard>
                <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-all duration-300 h-full">
                  <h3 className="text-xl font-semibold mb-6">Project Management</h3>
                  <ul className="space-y-3 text-card-foreground">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium">Agile Methodologies</span>
                        <p className="text-sm text-muted-foreground">Scrum, Kanban, and hybrid approaches</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium">Requirements Analysis</span>
                        <p className="text-sm text-muted-foreground">Stakeholder interviews and documentation</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium">Process Optimization</span>
                        <p className="text-sm text-muted-foreground">Workflow automation and efficiency improvements</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium">Team Leadership</span>
                        <p className="text-sm text-muted-foreground">Cross-functional team coordination</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </InteractiveCard>

              <InteractiveCard>
                <div className="bg-card border border-border rounded-xl p-8 hover:shadow-lg transition-all duration-300 h-full">
                  <h3 className="text-xl font-semibold mb-6">Technical Expertise</h3>
                  <ul className="space-y-3 text-card-foreground">
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium">Database Design</span>
                        <p className="text-sm text-muted-foreground">SQL Server, PostgreSQL optimization</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium">API Development</span>
                        <p className="text-sm text-muted-foreground">RESTful services and integration</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium">Test Automation</span>
                        <p className="text-sm text-muted-foreground">Unit, integration, and E2E testing</p>
                      </div>
                    </li>
                    <li className="flex items-start gap-3">
                      <div className="w-2 h-2 bg-secondary rounded-full mt-2 flex-shrink-0"></div>
                      <div>
                        <span className="font-medium">System Architecture</span>
                        <p className="text-sm text-muted-foreground">Scalable design patterns and microservices</p>
                      </div>
                    </li>
                  </ul>
                </div>
              </InteractiveCard>
            </div>
          </FadeInSection>
        </div>
      </PageLayout>
    </div>
  )
}
