export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { revalidatePublic } from "@/lib/cache"
import { db } from "@/lib/db"
import { projects } from "@/lib/schema"
import { asc } from "drizzle-orm"

export async function GET() {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await db.select().from(projects).orderBy(asc(projects.sortOrder))
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  if (!body.title || !body.slug || !body.shortDescription || !body.description) {
    return NextResponse.json(
      { error: "title, slug, shortDescription, and description are required" },
      { status: 400 }
    )
  }

  const result = await db
    .insert(projects)
    .values({
      title: body.title,
      slug: body.slug,
      shortDescription: body.shortDescription,
      description: body.description,
      image: body.image ?? "",
      tags: body.tags ?? [],
      github: body.github ?? "#",
      demo: body.demo ?? "#",
      sortOrder: body.sortOrder ?? 0,
      client: body.client ?? "",
      duration: body.duration ?? "",
      challenge: body.challenge ?? "",
      solution: body.solution ?? "",
      results: body.results ?? [],
    })
    .returning()

  revalidatePublic()
  return NextResponse.json(result[0], { status: 201 })
}
