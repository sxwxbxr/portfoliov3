"use client"

import Navigation from "../../components/Navigation"
import PageLayout from "../../components/PageLayout"
import FadeInSection from "../../components/FadeInSection"
import { InteractiveCard } from "../../components/InteractiveCard"
import { blogPosts } from "../../src/config"
import Link from "next/link"
import { Calendar, Clock, ArrowRight } from "lucide-react"

export default function Blog() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <PageLayout>
        <div className="space-y-16">
          <FadeInSection>
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Blog & Insights
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-serif">
                Sharing knowledge and insights from my experience in software development, project management, and
                digital transformation.
              </p>
            </div>
          </FadeInSection>

          <FadeInSection>
            <div className="grid gap-8">
              {blogPosts.map((post) => (
                <InteractiveCard key={post.id}>
                  <article className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
                    <div className="md:flex">
                      <div className="md:w-1/3">
                        <div className="h-64 md:h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                          <img
                            src={`/abstract-geometric-shapes.png?height=300&width=400&query=${encodeURIComponent(post.title)}`}
                            alt={post.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="md:w-2/3 p-8">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{post.readTime}</span>
                          </div>
                        </div>

                        <h2 className="text-2xl font-bold mb-4 hover:text-primary transition-colors">
                          <Link href={`/blog/${post.id}`}>{post.title}</Link>
                        </h2>

                        <p className="text-muted-foreground mb-6 leading-relaxed">{post.excerpt}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                              <span key={tag} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                                {tag}
                              </span>
                            ))}
                          </div>

                          <Link
                            href={`/blog/${post.id}`}
                            className="flex items-center gap-2 text-primary hover:gap-3 transition-all duration-200 font-medium"
                          >
                            Read More
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                </InteractiveCard>
              ))}
            </div>
          </FadeInSection>

          <FadeInSection>
            <div className="text-center space-y-4 py-16">
              <h2 className="text-3xl font-bold">Case Studies</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Detailed breakdowns of real projects, challenges faced, and solutions implemented.
              </p>
              <Link
                href="/case-studies"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 hover:scale-105"
              >
                View Case Studies
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeInSection>
        </div>
      </PageLayout>
    </div>
  )
}
