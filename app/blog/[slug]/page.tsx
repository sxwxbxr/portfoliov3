import Navigation from "../../../components/Navigation"
import { JsonLd } from "../../../components/JsonLd"
import { ProseMarkdown } from "../../../components/ProseMarkdown"
import { getBlogPosts, getBlogPostBySlug } from "@/lib/data"
import Link from "next/link"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { notFound } from "next/navigation"
import { BLOG_ENABLED } from "@/lib/features"
import { copy } from "@/lib/copy"

export const revalidate = 86400

export async function generateStaticParams() {
  if (!BLOG_ENABLED) return []
  const all = await getBlogPosts()
  return all.map((post) => ({ slug: post.slug }))
}

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export default async function BlogPost({ params }: BlogPostPageProps) {
  if (!BLOG_ENABLED) notFound()
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

  const tags = post.tags as string[]

  return (
    <div className="min-h-screen bg-ground">
      <JsonLd data={blogPostStructuredData} />
      <Navigation />

      <div className="flex flex-col gap-14 pt-32 md:gap-20">
        {/* ─── Hero ─── */}
        <section className="sheet flex flex-col gap-6">
          <Link
            href="/blog"
            className="annotate inline-flex items-center gap-1.5 self-start transition-colors duration-150 hover:text-signal"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.blog.allArticles}
          </Link>

          <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance md:text-5xl">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="measure text-lg leading-relaxed text-fg-muted">
              {post.excerpt}
            </p>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <span className="well-sm annotate px-3 py-1.5">
              {new Date(post.publishedAt).toLocaleDateString(
                copy.common.dateLocale,
                { month: "long", day: "numeric", year: "numeric" }
              )}
            </span>
            <span className="well-sm annotate px-3 py-1.5">{post.readTime}</span>
            <span className="well-sm annotate px-3 py-1.5">{post.author}</span>
          </div>
        </section>

        {/* ─── Article body, one continuous plate ─── */}
        <section className="sheet">
          <article className="cast rim mx-auto flex max-w-[860px] flex-col gap-10 p-7 md:p-12">
            <ProseMarkdown>{post.content}</ProseMarkdown>

            {tags.length > 0 && (
              <div className="flex flex-col gap-3">
                <span className="annotate">{copy.blog.taggedEyebrow(tags.length)}</span>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="well-sm px-2.5 py-1 font-mono text-xs text-fg-muted"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1">
              <span className="annotate">{copy.blog.writtenBy}</span>
              <p className="font-display font-semibold">{post.author}</p>
            </div>
          </article>
        </section>

        {/* ─── Pager ─── */}
        <section className="sheet pb-8">
          <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center md:justify-between">
            {prevPost ? (
              <Link
                href={`/blog/${prevPost.slug}`}
                className="cast rim group flex flex-col gap-1 p-5 transition-transform duration-150 ease-out hover:-translate-y-0.5 motion-reduce:transform-none md:min-w-[20rem]"
              >
                <span className="annotate inline-flex items-center gap-1.5">
                  <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                  {copy.blog.previousArticle}
                </span>
                <span className="font-display text-lg font-semibold transition-colors duration-150 group-hover:text-signal">
                  {prevPost.title}
                </span>
              </Link>
            ) : (
              <Link
                href="/blog"
                className="control inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium md:self-start"
              >
                <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                {copy.blog.allArticles}
              </Link>
            )}

            {nextPost && (
              <Link
                href={`/blog/${nextPost.slug}`}
                className="cast rim group flex flex-col gap-1 p-5 transition-transform duration-150 ease-out hover:-translate-y-0.5 motion-reduce:transform-none md:min-w-[20rem] md:text-right"
              >
                <span className="annotate inline-flex items-center gap-1.5 md:self-end">
                  {copy.blog.nextArticle}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
                <span className="font-display text-lg font-semibold transition-colors duration-150 group-hover:text-signal">
                  {nextPost.title}
                </span>
              </Link>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
