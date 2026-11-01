import { NextResponse } from "next/server"
import { getPostsForPackage } from "@/lib/blog"
import { getPackages } from "@/lib/packages"
import { pkgUrl } from "@/lib/packages/urls"

// Cached for 5 min instead of rendered per request: every hit re-read all posts (and, for the
// sitemap, every docs page), which was a main source of Vercel Hobby CPU. A new post therefore
// shows up here within 5 min; revalidatePath/revalidateTag do not reach route handlers.
export const revalidate = 300

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
