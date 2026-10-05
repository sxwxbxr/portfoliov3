import type { MetadataRoute } from "next"
import { blog } from "@/lib/blog"
import { getPackages } from "@/lib/packages"
import { getBundles } from "@/lib/packages/bundles"
import { getDocsNavFor } from "@/lib/packages/docs"
import { demoUrlOf } from "@/lib/packages/schema"
import { pkgUrl } from "@/lib/packages/urls"

// Rendered per request: these list package posts, and a post published in
// /admin/news or through the ingest API must appear here immediately. A
// cached route handler did not pick up revalidatePath/revalidateTag.
export const dynamic = "force-dynamic"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await blog.getPosts()
  // A package whose docs cannot be fetched simply contributes no entries.
  const docsEntries = (
    await Promise.all(
      getPackages().map(async (p) => {
        const nav = p.docs ? await getDocsNavFor(p.docs) : null
        if (!nav) return []
        return [
          { url: pkgUrl(`/${p.slug}/docs`), changeFrequency: "weekly" as const, priority: 0.8 },
          ...nav.pages.map((page) => ({
            url: pkgUrl(`/${p.slug}/docs/${page.path}`),
            changeFrequency: "weekly" as const,
            priority: 0.7,
          })),
        ]
      })
    )
  ).flat()
  return [
    { url: pkgUrl("/"), changeFrequency: "weekly", priority: 1 },
    ...getPackages().map((p) => ({
      url: pkgUrl(`/${p.slug}`),
      lastModified: p.releases[0]?.date ?? p.publishedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
    ...getPackages().flatMap((p) => {
      const demo = demoUrlOf(p)
      return demo ? [{ url: pkgUrl(demo), changeFrequency: "monthly" as const, priority: 0.8 }] : []
    }),
    ...getBundles().map((b) => ({
      url: pkgUrl(`/bundles/${b.slug}`),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    })),
    ...docsEntries,
    { url: pkgUrl("/license"), changeFrequency: "yearly", priority: 0.4 },
    { url: pkgUrl("/blog"), changeFrequency: "weekly", priority: 0.7 },
    ...posts
      // A post that lives elsewhere is indexed there, not here.
      .filter((p) => !p.canonicalUrl)
      .map((p) => ({
        url: pkgUrl(`/blog/${p.slug}`),
        lastModified: p.updatedAt ?? p.publishedAt,
        changeFrequency: "monthly" as const,
        priority: 0.6,
      })),
  ]
}
