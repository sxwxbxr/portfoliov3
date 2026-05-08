export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { revalidatePublic } from "@/lib/cache"
import { db } from "@/lib/db"
import { projects } from "@/lib/schema"
import { eq } from "drizzle-orm"

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const result = await db
    .select()
    .from(projects)
    .where(eq(projects.id, parseInt(id)))

  if (!result[0]) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  return NextResponse.json(result[0])
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  const body = await request.json()

  const result = await db
    .update(projects)
    .set({
      title: body.title,
      slug: body.slug,
      shortDescription: body.shortDescription,
      description: body.description,
      image: body.image,
      tags: body.tags,
      github: body.github,
      demo: body.demo,
      sortOrder: body.sortOrder,
      client: body.client ?? "",
      duration: body.duration ?? "",
      challenge: body.challenge ?? "",
      solution: body.solution ?? "",
      results: body.results ?? [],
    })
    .where(eq(projects.id, parseInt(id)))
    .returning()

  if (!result[0]) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  revalidatePublic()
  return NextResponse.json(result[0])
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  await db.delete(projects).where(eq(projects.id, parseInt(id)))

  revalidatePublic()
  return NextResponse.json({ success: true })
}
