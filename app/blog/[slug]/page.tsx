"use client"

import { use } from "react"
import Navigation from "../../../components/Navigation"
import PageLayout from "../../../components/PageLayout"
import FadeInSection from "../../../components/FadeInSection"
import { JsonLd } from "../../../components/JsonLd"
import { blogPosts } from "../../../src/config"
import Link from "next/link"
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export default function BlogPost({ params }: BlogPostPageProps) {
  const { slug } = use(params)
  const post = blogPosts.find((p) => p.id === slug)

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <PageLayout>
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Post Not Found</h1>
            <p className="text-muted-foreground">The blog post you're looking for doesn't exist.</p>
            <Link href="/blog" className="inline-flex items-center gap-2 text-primary hover:underline">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>
        </PageLayout>
      </div>
    )
  }

  const blogPostStructuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: `https://seyaweber.com${post.image}`,
    author: {
      "@type": "Person",
      name: post.author,
      url: "https://seyaweber.com",
    },
    publisher: {
      "@type": "Person",
      name: "Seya Weber",
      url: "https://seyaweber.com",
    },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://seyaweber.com/blog/${post.id}`,
    },
    keywords: post.tags.join(", "),
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href,
        })
      } catch (err) {
        console.log("Error sharing:", err)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <JsonLd data={blogPostStructuredData} />
      <Navigation />
      <PageLayout>
        <article className="max-w-4xl mx-auto">
          <FadeInSection>
            <div className="mb-8">
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Link>

              <div className="space-y-6">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{post.readTime}</span>
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleShare} className="ml-auto">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>

                <h1 className="text-4xl md:text-5xl font-bold leading-tight">{post.title}</h1>

                <p className="text-xl text-muted-foreground leading-relaxed font-serif">{post.excerpt}</p>

                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag} className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </FadeInSection>

          <FadeInSection>
            <div className="mb-12">
              <img
                src={`/abstract-geometric-shapes.png?height=400&width=800&query=${encodeURIComponent(post.title)}`}
                alt={post.title}
                className="w-full h-64 md:h-96 object-cover rounded-xl"
              />
            </div>
          </FadeInSection>

          <FadeInSection>
            <div className="prose prose-lg max-w-none dark:prose-invert">
              <div
                dangerouslySetInnerHTML={{
                  __html: post.content.replace(/\n/g, "<br />").replace(/#{1,6}\s/g, (match) => {
                    const level = match.trim().length
                    return `<h${level} class="text-${4 - level}xl font-bold mt-8 mb-4">`
                  }),
                }}
              />
            </div>
          </FadeInSection>

          <FadeInSection>
            <div className="mt-16 pt-8 border-t border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Written by</p>
                  <p className="font-semibold">{post.author}</p>
                </div>
                <Button onClick={handleShare} variant="outline">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share Article
                </Button>
              </div>
            </div>
          </FadeInSection>
        </article>
      </PageLayout>
    </div>
  )
}
