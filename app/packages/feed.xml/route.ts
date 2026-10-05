import { renderRss, type FeedItem } from "@/lib/blog/rss"
import { getPackages } from "@/lib/packages"
import { pkgUrl } from "@/lib/packages/urls"

// Rendered per request: these list package posts, and a post published in
// /admin/news or through the ingest API must appear here immediately. A
// cached route handler did not pick up revalidatePath/revalidateTag.
export const dynamic = "force-dynamic"

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
