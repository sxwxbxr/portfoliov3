export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { revalidatePublic } from "@/lib/cache"
import { db } from "@/lib/db"
import { experienceEntries } from "@/lib/schema"
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
    .from(experienceEntries)
    .where(eq(experienceEntries.id, parseInt(id)))

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
    .update(experienceEntries)
    .set({
      company: body.company,
      role: body.role,
      period: body.period,
      current: body.current,
      description: body.description,
      responsibilities: body.responsibilities,
      sortOrder: body.sortOrder,
    })
    .where(eq(experienceEntries.id, parseInt(id)))
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
    .delete(experienceEntries)
    .where(eq(experienceEntries.id, parseInt(id)))

  revalidatePublic()
  return NextResponse.json({ success: true })
}
