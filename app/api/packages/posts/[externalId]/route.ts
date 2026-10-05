import { NextResponse, type NextRequest } from "next/server"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { packagePosts } from "@/lib/schema"
import { describeIssues, postPatch } from "@/lib/blog/input"
import { guardIngest, INGEST_SOURCE, publicUrl } from "@/lib/blog/ingest"
import { revalidatePackagePosts } from "@/lib/blog/revalidate"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Params = { params: Promise<{ externalId: string }> }

// The sender can only see and change its own posts, never admin-written ones.
async function find(externalId: string) {
  const [row] = await db
    .select()
    .from(packagePosts)
    .where(and(eq(packagePosts.externalId, externalId), eq(packagePosts.source, INGEST_SOURCE)))
  return row ?? null
}

const notFound = () => NextResponse.json({ error: "Not found" }, { status: 404 })

export async function GET(req: NextRequest, { params }: Params) {
  const denied = guardIngest(req)
  if (denied) return denied
  const row = await find(decodeURIComponent((await params).externalId))
  return row ? NextResponse.json({ post: { ...row, url: publicUrl(row) } }) : notFound()
}

/** Partial update, e.g. `{ "status": "draft" }` to unpublish. */
export async function PATCH(req: NextRequest, { params }: Params) {
  const denied = guardIngest(req)
  if (denied) return denied
  const row = await find(decodeURIComponent((await params).externalId))
  if (!row) return notFound()

  const parsed = postPatch.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: describeIssues(parsed.error) }, { status: 400 })
  }

  if (parsed.data.slug && parsed.data.slug !== row.slug) {
    const [clash] = await db
      .select({ id: packagePosts.id })
      .from(packagePosts)
      .where(eq(packagePosts.slug, parsed.data.slug))
    if (clash) {
      return NextResponse.json(
        { error: `slug "${parsed.data.slug}" is already used by another post` },
        { status: 409 }
      )
    }
  }

  const [updated] = await db
    .update(packagePosts)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(packagePosts.id, row.id))
    .returning()

  revalidatePackagePosts(updated.slug)
  if (updated.slug !== row.slug) revalidatePackagePosts(row.slug)
  return NextResponse.json({ post: { ...updated, url: publicUrl(updated) } })
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const denied = guardIngest(req)
  if (denied) return denied
  const row = await find(decodeURIComponent((await params).externalId))
  if (!row) return notFound()

  await db.delete(packagePosts).where(eq(packagePosts.id, row.id))
  revalidatePackagePosts(row.slug)
  return new NextResponse(null, { status: 204 })
}
