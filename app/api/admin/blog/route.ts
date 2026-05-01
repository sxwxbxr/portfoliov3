export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { revalidatePublic } from "@/lib/cache"
import { db } from "@/lib/db"
import { blogPosts } from "@/lib/schema"

export async function GET() {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await db.select().from(blogPosts)
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  if (!body.title || !body.slug || !body.publishedAt) {
    return NextResponse.json(
      { error: "title, slug, and publishedAt are required" },
      { status: 400 }
    )
  }

  const result = await db
    .insert(blogPosts)
    .values({
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt ?? "",
      content: body.content ?? "",
      publishedAt: body.publishedAt,
      readTime: body.readTime ?? "",
      author: body.author ?? "Seya Weber",
      tags: body.tags ?? [],
      image: body.image ?? "",
      featured: Boolean(body.featured),
    })
    .returning()

  revalidatePublic()
  return NextResponse.json(result[0], { status: 201 })
}
