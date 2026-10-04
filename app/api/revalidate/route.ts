import { timingSafeEqual } from "crypto"
import { revalidatePath } from "next/cache"
import { NextResponse, type NextRequest } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function tokenMatches(given: string, expected: string) {
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

/**
 * Webhook for a remote blog source: call it after a post is published or
 * changed so the package site shows it without waiting for the 60 s ISR window.
 */
export async function POST(req: NextRequest) {
  const expected = process.env.BLOG_REVALIDATE_TOKEN
  if (!expected) {
    return NextResponse.json({ error: "Revalidation is not configured" }, { status: 503 })
  }

  const header = req.headers.get("authorization")
  const given =
    (header?.startsWith("Bearer ") ? header.slice(7) : null) ??
    req.nextUrl.searchParams.get("token") ??
    ""
  if (!tokenMatches(given, expected)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const slug = typeof body?.slug === "string" && /^[a-z0-9-]+$/.test(body.slug) ? body.slug : null

  revalidatePath("/packages/blog")
  revalidatePath("/packages/blog/[slug]", "page")
  if (slug) revalidatePath(`/packages/blog/${slug}`)
  revalidatePath("/packages")
  revalidatePath("/packages/blog/feed.xml")
  revalidatePath("/packages/blog/posts.json")
  revalidatePath("/packages/feed.xml")
  revalidatePath("/packages/packages.json")
  revalidatePath("/packages/sitemap.xml")

  return NextResponse.json({ revalidated: true, slug })
}
