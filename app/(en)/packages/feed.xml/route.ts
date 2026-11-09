import { renderRss, type FeedItem } from "@/lib/blog/rss"
import { getPackages } from "@/lib/packages"
import { pkgUrl } from "@/lib/packages/urls"

// Cached for 60 min instead of rendered per request: every hit re-read all posts (and, for the
// sitemap, every docs page), which was a main source of Vercel Hobby CPU. A new post therefore
// shows up here within 60 min; revalidatePath/revalidateTag do not reach route handlers.
export const revalidate = 3600

export async function GET() {
  const items: FeedItem[] = getPackages().flatMap((p) => [
    {
      title: `${p.name} is available`,
      link: pkgUrl(`/${p.slug}`),
      guid: pkgUrl(`/${p.slug}`),
      date: p.publishedAt,
      description: p.tagline,
      categories: p.tags,
    },
    ...p.releases.map((r) => ({
      title: r.title,
      link: r.url ?? pkgUrl(`/${p.slug}`),
      // Several releases may share a link, so the guid carries the version.
      guid: pkgUrl(`/${p.slug}?release=${r.version}`),
      date: r.date,
      description: `${p.name} ${r.version}`,
      categories: p.tags,
    })),
  ])
  items.sort((a, b) => b.date.localeCompare(a.date))

  return renderRss({
    title: "Seya Weber Packages",
    link: pkgUrl("/"),
    description: "New libraries and releases from sweber.dev.",
    self: pkgUrl("/feed.xml"),
    items,
  })
}
