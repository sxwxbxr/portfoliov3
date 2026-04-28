export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { certificates } from "@/lib/schema"
import { asc } from "drizzle-orm"

export async function GET() {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await db
    .select()
    .from(certificates)
    .orderBy(asc(certificates.sortOrder))
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  if (!body.name) {
    return NextResponse.json(
      { error: "name is required" },
      { status: 400 }
    )
  }

  const result = await db
    .insert(certificates)
    .values({
      name: body.name,
      fullTitle: body.fullTitle ?? "",
      provider: body.provider ?? "",
      category: body.category ?? "",
      status: body.status ?? "planned",
      description: body.description ?? "",
      credentialUrl: body.credentialUrl ?? "",
      credentialId: body.credentialId ?? "",
      issueDate: body.issueDate ?? "",
      expiryDate: body.expiryDate ?? "",
      plannedStart: body.plannedStart ?? "",
      plannedEnd: body.plannedEnd ?? "",
      estimatedHours: body.estimatedHours ?? 0,
      estimatedCost: body.estimatedCost ?? "",
      difficulty: body.difficulty ?? 0,
      skills: body.skills ?? [],
      whyPoints: body.whyPoints ?? [],
      accentColor: body.accentColor ?? "",
      sortOrder: body.sortOrder ?? 0,
    })
    .returning()

  return NextResponse.json(result[0], { status: 201 })
}
