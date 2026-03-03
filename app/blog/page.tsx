"use client"

import Link from "next/link"
import PageLayout from "../../components/PageLayout"
import { AnimatedSection } from "../../components/AnimatedSection"
import { StaggerContainer, StaggerItem } from "../../components/StaggerContainer"
import { blogPosts } from "../../src/config"
import { ArrowUpRight, ArrowRight } from "lucide-react"

export default function Blog() {
  return (
    <PageLayout
      title="Blog & Insights"
      subtitle="Sharing knowledge and insights from my experience in software development, project management, and digital transformation."
      label="Writing"
    >
      <section className="py-20 md:py-28 px-6">
        <div className="max-w-4xl mx-auto">
          <StaggerContainer className="space-y-0 divide-y divide-border" staggerDelay={0.12}>
            {blogPosts?.map((post) => (
              <StaggerItem key={post.id}>
                <Link
                  href={`/blog/${post.id}`}
                  className="group block py-10 first:pt-0 last:pb-0"
                >
                  <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
                    <div className="md:w-36 flex-shrink-0">
                      <time className="text-sm text-muted-foreground">
                        {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </time>
                      <p className="text-xs text-muted-foreground mt-1">{post.readTime}</p>
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl md:text-2xl font-semibold leading-snug group-hover:text-primary transition-colors mb-3">
                        {post.title}
                      </h2>
                      <p className="text-muted-foreground leading-relaxed mb-4">{post.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex flex-wrap gap-1.5">
                          {post.tags.map((tag) => (
                            <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <span className="text-sm font-medium text-primary flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          Read <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>

          <AnimatedSection delay={0.2}>
            <div className="mt-20 bento-card rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-secondary/5 p-10 md:p-14 text-center">
              <h3 className="text-2xl md:text-3xl font-bold mb-4">Case Studies</h3>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">
                Detailed breakdowns of real projects, challenges faced, and solutions implemented.
              </p>
              <Link
                href="/case-studies"
                className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background rounded-full text-sm font-medium hover:opacity-80 transition-opacity"
              >
                View Case Studies
                <ArrowUpRight className="w-4 h-4" />
              </Link>
            </div>
          </AnimatedSection>
        </div>
      </section>
    </PageLayout>
  )
}
