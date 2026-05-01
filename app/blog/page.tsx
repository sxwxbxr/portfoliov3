import Link from "next/link"
import PageLayout from "../../components/PageLayout"
import { getBlogPosts } from "@/lib/data"

export const revalidate = 60

export default async function Blog() {
  const blogPosts = await getBlogPosts()

  return (
    <PageLayout
      title="Writing"
      subtitle="Thoughts on software development, project management, and digital transformation."
    >
      <section className="pb-24 md:pb-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <div>
            {blogPosts.map((post, i) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block"
              >
                <div
                  className={`flex flex-col md:flex-row md:items-center gap-1 md:gap-6 py-5 ${
                    i > 0 ? "border-t border-border" : ""
                  }`}
                >
                  <h3 className="font-semibold md:flex-1 group-hover:text-primary transition-colors duration-200">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="font-mono">
                      {new Date(post.publishedAt).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
              </Link>
            ))}
            <div className="border-t border-border" />
          </div>

          <div className="mt-8">
            <Link
              href="/case-studies"
              className="link-underline text-primary text-sm font-medium"
            >
              Read case studies &rarr;
            </Link>
          </div>
        </div>
      </section>
    </PageLayout>
  )
}
