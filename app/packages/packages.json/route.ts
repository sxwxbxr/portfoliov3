import { NextResponse } from "next/server"
import { getPostsForPackage } from "@/lib/blog"
import { getPackages } from "@/lib/packages"
import { pkgUrl } from "@/lib/packages/urls"

// Rendered per request: these list package posts, and a post published in
// /admin/news or through the ingest API must appear here immediately. A
// cached route handler did not pick up revalidatePath/revalidateTag.
export const dynamic = "force-dynamic"

export async function GET() {
  const packages = await Promise.all(
    getPackages().map(async (p) => ({
      name: p.name,
      slug: p.slug,
      tagline: p.tagline,
      description: p.description,
      status: p.status,
      tags: p.tags,
      license: p.license,
      install: p.install,
      npm: p.npm,
      links: p.links,
      features: p.features,
      comparison: p.comparison ?? [],
      pro: p.pro ?? null,
      pricing: p.pricing ?? null,
      url: pkgUrl(`/${p.slug}`),
      pricingUrl: pkgUrl(`/${p.slug}#pricing`),
      videos: p.videos,
      latestPosts: (await getPostsForPackage(p.slug, 3)).map((post) => ({
        title: post.title,
        excerpt: post.excerpt,
        publishedAt: post.publishedAt,
        type: post.type,
        url: post.canonicalUrl ?? pkgUrl(`/blog/${post.slug}`),
      })),
    }))
  )

  return NextResponse.json(
    { generatedAt: new Date().toISOString(), packages },
    { headers: { "Access-Control-Allow-Origin": "*" } }
  )
}
