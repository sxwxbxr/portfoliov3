import { NextResponse, type NextRequest } from "next/server"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { packagePosts } from "@/lib/schema"
import { describeIssues } from "@/lib/blog/input"
import { guardIngest, ingestInput, INGEST_SOURCE, publicUrl, withInferredType } from "@/lib/blog/ingest"
import { revalidatePackagePosts } from "@/lib/blog/revalidate"
import type { PostType } from "@/lib/blog/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Ingest endpoint for an external blog system (Schulz Media): it pushes posts
 * here instead of the site pulling them. Contract: docs/BLOG_INTEGRATION.md.
 * Posts are keyed by the sender's `externalId`, so delivering the same post
 * again updates it.
 */

/** Lists every post this sender delivered, drafts included. */
export async function GET(req: NextRequest) {
  const denied = guardIngest(req)
  if (denied) return denied

  const rows = await db
    .select()
    .from(packagePosts)
    .where(eq(packagePosts.source, INGEST_SOURCE))
  return NextResponse.json({ posts: rows.map((r) => ({ ...r, url: publicUrl(r) })) })
}

/** Creates the post, or updates it when `externalId` was delivered before. */
export async function POST(req: NextRequest) {
  const denied = guardIngest(req)
  if (denied) return denied

  const parsed = ingestInput.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: describeIssues(parsed.error) }, { status: 400 })
  }
  const { externalId, ...input } = parsed.data

  // The slug is the public URL, so it must not belong to a different post,
  // whether that one was written in the admin or delivered under another ID.
  const [bySlug] = await db.select().from(packagePosts).where(eq(packagePosts.slug, input.slug))
  if (bySlug && bySlug.externalId !== externalId) {
    return NextResponse.json(
      { error: `slug "${input.slug}" is already used by another post` },
      { status: 409 }
    )
  }

  const [existing] = await db
    .select()
    .from(packagePosts)
    .where(eq(packagePosts.externalId, externalId))

  // A re-delivery without `type` keeps the stored one, so a type corrected in
  // the admin is not overwritten by inference.
  const fields = withInferredType(
    existing && !input.type ? { ...input, type: existing.type as PostType } : input
  )

  const [row] = existing
    ? await db
        .update(packagePosts)
        .set({ ...fields, source: INGEST_SOURCE, updatedAt: new Date() })
        .where(eq(packagePosts.id, existing.id))
        .returning()
    : await db
        .insert(packagePosts)
        .values({ ...fields, externalId, source: INGEST_SOURCE })
        .returning()

  revalidatePackagePosts(row.slug)
  if (existing && existing.slug !== row.slug) revalidatePackagePosts(existing.slug)

  return NextResponse.json(
    { post: { ...row, url: publicUrl(row) }, created: !existing },
    { status: existing ? 200 : 201 }
  )
}
