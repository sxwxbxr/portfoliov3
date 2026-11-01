import { getArticles } from "@/lib/blog"
import { renderRss } from "@/lib/blog/rss"
import { pkgUrl } from "@/lib/packages/urls"

// Cached for 5 min instead of rendered per request: every hit re-read all posts (and, for the
// sitemap, every docs page), which was a main source of Vercel Hobby CPU. A new post therefore
// shows up here within 5 min; revalidatePath/revalidateTag do not reach route handlers.
export const revalidate = 300

export async function GET() {
  const posts = await getArticles()
  return renderRss({
    title: "Seya Weber Packages: Blog",
    link: pkgUrl("/blog"),
    description: "Tutorials and notes on the libraries from sweber.dev.",
    self: pkgUrl("/blog/feed.xml"),
    items: posts.map((p) => ({
      title: p.title,
      link: p.canonicalUrl ?? pkgUrl(`/blog/${p.slug}`),
      date: p.publishedAt,
      description: p.excerpt,
      categories: p.tags,
    })),
  })
}
