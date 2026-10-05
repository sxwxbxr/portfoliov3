import { getReleaseNotes } from "@/lib/blog"
import { renderRss } from "@/lib/blog/rss"
import { pkgUrl } from "@/lib/packages/urls"

// Rendered per request, like the blog feed: a new release note must appear at once.
export const dynamic = "force-dynamic"

export async function GET() {
  const posts = await getReleaseNotes()
  return renderRss({
    title: "Seya Weber Packages: Release notes",
    link: pkgUrl("/releasenotes"),
    description: "What changed in each version of the libraries from sweber.dev.",
    self: pkgUrl("/releasenotes/feed.xml"),
    items: posts.map((p) => ({
      title: p.title,
      link: p.canonicalUrl ?? pkgUrl(`/blog/${p.slug}`),
      date: p.publishedAt,
      description: p.excerpt,
      categories: p.tags,
    })),
  })
}
