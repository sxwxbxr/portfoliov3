import type { MetadataRoute } from "next"
import { blog } from "@/lib/blog"
import { getPackages } from "@/lib/packages"
import { pkgUrl } from "@/lib/packages/urls"

export const revalidate = 60

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await blog.getPosts()
  return [
    { url: pkgUrl("/"), changeFrequency: "weekly", priority: 1 },
    ...getPackages().map((p) => ({
      url: pkgUrl(`/${p.slug}`),
      lastModified: p.releases[0]?.date ?? p.publishedAt,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
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
