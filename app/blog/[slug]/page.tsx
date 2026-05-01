import Navigation from "../../../components/Navigation"
import { JsonLd } from "../../../components/JsonLd"
import { getBlogPosts, getBlogPostBySlug } from "@/lib/data"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import { notFound } from "next/navigation"

export const revalidate = 60

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPost({ params }: BlogPostPageProps) {
  const { slug } = await params
  const [post, allPosts] = await Promise.all([
    getBlogPostBySlug(slug),
    getBlogPosts(),
  ])

  if (!post) {
    notFound()
  }

  const blogPostStructuredData = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt,
    image: `https://sweber.dev${post.image}`,
    author: {
      "@type": "Person",
      name: post.author,
      url: "https://sweber.dev",
    },
    publisher: {
      "@type": "Person",
      name: "Seya Weber",
      url: "https://sweber.dev",
    },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://sweber.dev/blog/${post.slug}`,
    },
    keywords: (post.tags as string[]).join(", "),
  }

  // Find next/prev posts
  const currentIndex = allPosts.findIndex((p) => p.slug === slug)
  const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null
  const prevPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null

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
        <div className="py-24 md:py-32">
          <article className="max-w-[720px] mx-auto px-6">
            <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-display prose-headings:tracking-tight prose-p:leading-[1.75] prose-a:text-primary prose-a:no-underline hover:prose-a:underline">
              <ReactMarkdown>{post.content}</ReactMarkdown>
            </div>

            {/* Tags */}
            <div className="mt-16 pt-8 border-t border-border">
              <p className="font-mono text-xs text-muted-foreground mb-3">Tagged</p>
              <div className="flex flex-wrap gap-2">
                {(post.tags as string[]).map((tag) => (
                  <span
                    key={tag}
                    className="text-sm text-muted-foreground"
                  >
                    {tag}{(post.tags as string[]).indexOf(tag) < (post.tags as string[]).length - 1 ? "," : ""}
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
        </div>

        {/* Post navigation */}
        <div className="border-t border-border">
          <div className="max-w-[1200px] mx-auto px-6 py-16 md:py-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            {prevPost ? (
              <Link href={`/blog/${prevPost.slug}`} className="group">
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
              <Link href={`/blog/${nextPost.slug}`} className="group text-right">
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
