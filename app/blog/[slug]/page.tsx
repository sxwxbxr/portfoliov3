"use client"

import { use } from "react"
import Navigation from "../../../components/Navigation"
import { AnimatedSection } from "../../../components/AnimatedSection"
import { JsonLd } from "../../../components/JsonLd"
import { blogPosts } from "../../../src/config"
import Link from "next/link"
import { Calendar, Clock, ArrowLeft, Share2 } from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export default function BlogPost({ params }: BlogPostPageProps) {
  const { slug } = use(params)
  const post = blogPosts.find((p) => p.id === slug)

  if (!post) {
    return (
      <div className="min-h-screen bg-background grain-overlay">
        <Navigation />
        <div className="pt-16">
          <div className="py-20 px-6 text-center">
            <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-6">The blog post you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/blog" className="inline-flex items-center gap-2 text-primary hover:underline text-sm">
              <ArrowLeft className="w-4 h-4" />
              Back to Blog
            </Link>
          </div>
        </div>
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
      navigator.clipboard.writeText(window.location.href)
    }
  }

  return (
    <div className="min-h-screen bg-background grain-overlay">
      <JsonLd data={blogPostStructuredData} />
      <Navigation />

      <div className="pt-16">
        <section className="py-20 md:py-28 px-6 mesh-gradient">
          <div className="max-w-3xl mx-auto">
            <Link
              href="/blog"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              All Articles
            </Link>

            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <time>{new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</time>
              </div>
              <span className="w-1 h-1 rounded-full bg-border" />
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                <span>{post.readTime}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleShare} className="ml-auto">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
            </div>

            <h1 className="text-4xl md:text-5xl font-bold leading-[1.1] tracking-tight mb-6">
              {post.title}
            </h1>

            <p className="text-lg text-muted-foreground leading-relaxed mb-6">{post.excerpt}</p>

            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </section>

        <main className="py-20 md:py-28 px-6">
          <article className="max-w-3xl mx-auto">
            <AnimatedSection>
              <div className="overflow-hidden rounded-2xl border border-border mb-16">
                <Image
                  src={`/abstract-geometric-shapes.png?height=400&width=800&query=${encodeURIComponent(post.title)}`}
                  alt={post.title}
                  width={800}
                  height={400}
                  className="w-full h-64 md:h-96 object-cover"
                />
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.1}>
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <ReactMarkdown>{post.content}</ReactMarkdown>
              </div>
            </AnimatedSection>

            <AnimatedSection delay={0.2}>
              <div className="mt-16 pt-8 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-widest">Written by</p>
                    <p className="font-semibold mt-1">{post.author}</p>
                  </div>
                  <Button onClick={handleShare} variant="outline" className="rounded-full">
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </AnimatedSection>
          </article>
        </main>
      </div>
    </div>
  )
}
