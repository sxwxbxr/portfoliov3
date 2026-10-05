import { NextResponse, type NextRequest } from "next/server"
import { checkBearer } from "@/lib/blog/ingest"
import { revalidatePackagePosts } from "@/lib/blog/revalidate"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Webhook for a remote blog source: call it after a post is published or
 * changed so the package site shows it without waiting for the 60 s ISR window.
 * Posts pushed through /api/packages/posts revalidate on their own.
 */
export async function POST(req: NextRequest) {
  const auth = checkBearer(req, "BLOG_REVALIDATE_TOKEN", { allowQuery: true })
  if (auth === "unconfigured") {
    return NextResponse.json({ error: "Revalidation is not configured" }, { status: 503 })
  }
  if (auth === "unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const slug = typeof body?.slug === "string" && /^[a-z0-9-]+$/.test(body.slug) ? body.slug : undefined

  revalidatePackagePosts(slug)
  return NextResponse.json({ revalidated: true, slug: slug ?? null })
}
