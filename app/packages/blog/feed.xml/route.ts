import { blog } from "@/lib/blog"
import { renderRss } from "@/lib/blog/rss"
import { pkgUrl } from "@/lib/packages/urls"

export const revalidate = 60

export async function GET() {
  const posts = await blog.getPosts()
  return renderRss({
    title: "Seya Weber Packages: Blog",
    link: pkgUrl("/blog"),
    description: "Releases, tutorials and notes on the libraries from sweber.dev.",
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
