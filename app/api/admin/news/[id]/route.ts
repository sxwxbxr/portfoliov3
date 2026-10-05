export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { and, eq, ne } from "drizzle-orm"
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { packagePosts } from "@/lib/schema"
import { postPatch, describeIssues } from "@/lib/blog/input"
import { revalidatePackagePosts } from "@/lib/blog/revalidate"

type Ctx = { params: Promise<{ id: string }> }

async function parseId(ctx: Ctx): Promise<number | null> {
  const { id } = await ctx.params
  const n = Number(id)
  return Number.isInteger(n) ? n : null
}

async function authed(): Promise<boolean> {
  try {
    await requireAuth()
    return true
  } catch {
    return false
  }
}

export async function GET(_request: Request, ctx: Ctx) {
  if (!(await authed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const id = await parseId(ctx)
  if (id === null) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const result = await db.select().from(packagePosts).where(eq(packagePosts.id, id))
  if (!result[0]) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(result[0])
}

export async function PUT(request: Request, ctx: Ctx) {
  if (!(await authed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const id = await parseId(ctx)
  if (id === null) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const json = await request.json().catch(() => null)
  const parsed = postPatch.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: describeIssues(parsed.error) }, { status: 400 })
  }

  const current = await db.select().from(packagePosts).where(eq(packagePosts.id, id))
  if (!current[0]) return NextResponse.json({ error: "Not found" }, { status: 404 })

  if (parsed.data.slug && parsed.data.slug !== current[0].slug) {
    const clash = await db
      .select({ id: packagePosts.id })
      .from(packagePosts)
      .where(and(eq(packagePosts.slug, parsed.data.slug), ne(packagePosts.id, id)))
    if (clash[0]) {
      return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 })
    }
  }

  const result = await db
    .update(packagePosts)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(packagePosts.id, id))
    .returning()

  revalidatePackagePosts(current[0].slug)
  if (result[0].slug !== current[0].slug) revalidatePackagePosts(result[0].slug)
  return NextResponse.json(result[0])
}

export async function DELETE(_request: Request, ctx: Ctx) {
  if (!(await authed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const id = await parseId(ctx)
  if (id === null) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const result = await db.delete(packagePosts).where(eq(packagePosts.id, id)).returning()
  if (!result[0]) return NextResponse.json({ error: "Not found" }, { status: 404 })

  revalidatePackagePosts(result[0].slug)
  return NextResponse.json({ success: true })
}
