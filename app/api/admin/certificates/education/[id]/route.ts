export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { revalidatePublic } from "@/lib/cache"
import { db } from "@/lib/db"
import { educationEntries } from "@/lib/schema"
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
    .from(educationEntries)
    .where(eq(educationEntries.id, parseInt(id)))

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

  if (!body.title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 })
  }

  const result = await db
    .update(educationEntries)
    .set({
      title: body.title,
      institution: body.institution ?? "",
      period: body.period ?? "",
      description: body.description ?? "",
      sortOrder: body.sortOrder ?? 0,
    })
    .where(eq(educationEntries.id, parseInt(id)))
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
  await db
    .delete(educationEntries)
    .where(eq(educationEntries.id, parseInt(id)))

  revalidatePublic()
  return NextResponse.json({ success: true })
}
