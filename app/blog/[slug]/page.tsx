"use client"

import { use } from "react"
import Navigation from "../../../components/Navigation"
import { JsonLd } from "../../../components/JsonLd"
import { blogPosts } from "../../../src/config"
import Link from "next/link"
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
        <div className="pt-32">
          <div className="max-w-[1200px] mx-auto px-6 text-center py-24">
            <h1 className="text-4xl font-display font-bold tracking-tight mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-6">The blog post you&apos;re looking for doesn&apos;t exist.</p>
            <Link href="/blog" className="link-underline text-primary text-sm font-medium">
              &larr; Back to Writing
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

  // Find next/prev posts
  const currentIndex = blogPosts.findIndex((p) => p.id === slug)
  const nextPost = currentIndex < blogPosts.length - 1 ? blogPosts[currentIndex + 1] : null
  const prevPost = currentIndex > 0 ? blogPosts[currentIndex - 1] : null

  return (
    <div className="min-h-screen bg-background grain-overlay">
      <JsonLd data={blogPostStructuredData} />
      <Navigation />

      <div className="pt-32">
        {/* Header */}
        <section className="max-w-[1200px] mx-auto px-6 pb-16 md:pb-20">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8"
          >
            &larr; All articles
          </Link>

          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight leading-[1.1]">
            {post.title}
          </h1>

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="font-mono">
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
            <span className="text-border">&middot;</span>
            <span>{post.readTime}</span>
            <span className="text-border">&middot;</span>
            <span>{post.author}</span>
          </div>
        </section>

        <div className="border-t border-border" />

        {/* Article body */}
        <main className="py-24 md:py-32">
          <article className="max-w-[720px] mx-auto px-6">
            <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-display prose-headings:tracking-tight prose-p:leading-[1.75] prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>

            {/* Tags */}
            <div className="mt-16 pt-8 border-t border-border">
              <p className="font-mono text-xs text-muted-foreground mb-3">Tagged</p>
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-sm text-muted-foreground"
                  >
                    {tag}{post.tags.indexOf(tag) < post.tags.length - 1 ? "," : ""}
                  </span>
                ))}
              </div>
            </div>

            {/* Author */}
            <div className="mt-12 pt-8 border-t border-border">
              <p className="font-mono text-xs text-muted-foreground">Written by</p>
              <p className="font-semibold mt-1">{post.author}</p>
            </div>
          </article>
        </main>

        {/* Post navigation */}
        <div className="border-t border-border">
          <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {prevPost ? (
              <Link href={`/blog/${prevPost.id}`} className="group">
                <span className="text-sm text-muted-foreground">&larr; Previous</span>
                <p className="font-semibold group-hover:text-primary transition-colors">
                  {prevPost.title}
                </p>
              </Link>
            ) : (
              <Link
                href="/blog"
                className="link-underline text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                &larr; All articles
              </Link>
            )}
            {nextPost && (
              <Link href={`/blog/${nextPost.id}`} className="group text-right">
                <span className="text-sm text-muted-foreground">Next &rarr;</span>
                <p className="font-semibold group-hover:text-primary transition-colors">
                  {nextPost.title}
                </p>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
