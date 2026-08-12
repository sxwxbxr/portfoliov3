import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowUpRight } from "lucide-react"
import PageLayout, { Section } from "../../components/PageLayout"
import { EmptyState } from "../../components/EmptyState"
import { getBlogPosts } from "@/lib/data"
import { BLOG_ENABLED, CASE_STUDIES_ENABLED } from "@/lib/features"
import { copy } from "@/lib/copy"

export const revalidate = 86400

export default async function Blog() {
  if (!BLOG_ENABLED) notFound()
  const blogPosts = await getBlogPosts()

  return (
    <PageLayout
      label={copy.blog.label(blogPosts.length)}
      title={copy.blog.title}
      subtitle={copy.blog.subtitle}
    >
      <section className="sheet flex flex-col gap-10 pb-24 md:pb-32">
        {blogPosts.length > 0 ? (
          // A sequence, so: a sunken channel with each article seated in it —
          // the same shape /experience uses for its stations.
          <ol className="well flex flex-col gap-2 p-3 md:p-4">
            {blogPosts.map((post, i) => (
              <li key={post.slug}>
                <Section delay={i * 0.04}>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="cast-sm group flex flex-col gap-2 p-5 md:flex-row md:items-baseline md:gap-6"
                  >
                    <span className="annotate shrink-0" aria-hidden="true">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <h2 className="font-display font-semibold tracking-tight transition-colors duration-150 group-hover:text-signal md:flex-1">
                      {post.title}
                    </h2>
                    <span className="annotate">
                      {new Date(post.publishedAt).toLocaleDateString(
                        copy.common.dateLocale,
                        { month: "short", year: "numeric" }
                      )}
                    </span>
                    <span className="annotate md:w-20 md:text-right">
                      {post.readTime}
                    </span>
                  </Link>
                </Section>
              </li>
            ))}
          </ol>
        ) : (
          <EmptyState>{copy.blog.empty}</EmptyState>
        )}

        {CASE_STUDIES_ENABLED && (
          <Link
            href="/case-studies"
            className="control inline-flex items-center gap-2 self-start px-4 py-2.5 text-sm font-medium"
          >
            {copy.projects.viewCaseStudies}
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </section>
    </PageLayout>
  )
}
