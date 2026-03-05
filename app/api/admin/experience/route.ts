export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { experienceEntries } from "@/lib/schema"
import { asc } from "drizzle-orm"

export async function GET() {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await db
    .select()
    .from(experienceEntries)
    .orderBy(asc(experienceEntries.sortOrder))
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  if (!body.company || !body.role || !body.period) {
    return NextResponse.json(
      { error: "company, role, and period are required" },
      { status: 400 }
    )
  }

  const result = await db
    .insert(experienceEntries)
    .values({
      company: body.company,
      role: body.role,
      period: body.period,
      current: body.current ?? false,
      description: body.description ?? "",
      responsibilities: body.responsibilities ?? [],
      sortOrder: body.sortOrder ?? 0,
    })
    .returning()

  return NextResponse.json(result[0], { status: 201 })
}
