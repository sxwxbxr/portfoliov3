export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { desc, eq } from "drizzle-orm"
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { packagePosts } from "@/lib/schema"
import { postInput, describeIssues } from "@/lib/blog/input"
import { revalidatePackagePosts } from "@/lib/blog/revalidate"

export async function GET() {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await db
    .select()
    .from(packagePosts)
    .orderBy(desc(packagePosts.publishedAt), desc(packagePosts.id))
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const json = await request.json().catch(() => null)
  const parsed = postInput.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json({ error: describeIssues(parsed.error) }, { status: 400 })
  }

  const existing = await db
    .select({ id: packagePosts.id })
    .from(packagePosts)
    .where(eq(packagePosts.slug, parsed.data.slug))
  if (existing[0]) {
    return NextResponse.json({ error: "A post with this slug already exists" }, { status: 409 })
  }

  const result = await db
    .insert(packagePosts)
    .values({ ...parsed.data, source: "admin" })
    .returning()

  revalidatePackagePosts(parsed.data.slug)
  return NextResponse.json(result[0], { status: 201 })
}
