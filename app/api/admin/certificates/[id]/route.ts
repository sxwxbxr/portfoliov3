export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { certificates } from "@/lib/schema"
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
    .from(certificates)
    .where(eq(certificates.id, parseInt(id)))

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
    .update(certificates)
    .set({
      name: body.name,
      fullTitle: body.fullTitle,
      provider: body.provider,
      category: body.category,
      status: body.status,
      description: body.description,
      credentialUrl: body.credentialUrl,
      credentialId: body.credentialId,
      issueDate: body.issueDate,
      expiryDate: body.expiryDate,
      plannedStart: body.plannedStart,
      plannedEnd: body.plannedEnd,
      estimatedHours: body.estimatedHours,
      estimatedCost: body.estimatedCost,
      difficulty: body.difficulty,
      skills: body.skills,
      whyPoints: body.whyPoints,
      accentColor: body.accentColor,
      sortOrder: body.sortOrder,
    })
    .where(eq(certificates.id, parseInt(id)))
    .returning()

  if (!result[0]) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

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
  await db.delete(certificates).where(eq(certificates.id, parseInt(id)))

  return NextResponse.json({ success: true })
}
