export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { revalidatePublic } from "@/lib/cache"
import { db } from "@/lib/db"
import { educationEntries } from "@/lib/schema"
import { derivePeriodRange } from "@/lib/period-range"
import { asc } from "drizzle-orm"

export async function GET() {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await db
    .select()
    .from(educationEntries)
    .orderBy(asc(educationEntries.sortOrder))
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  if (!body.title) {
    return NextResponse.json({ error: "title is required" }, { status: 400 })
  }

  const startDate = body.startDate ? String(body.startDate) : ""
  const endDate = body.endDate ? String(body.endDate) : ""
  const { period } = derivePeriodRange(startDate, endDate)

  const result = await db
    .insert(educationEntries)
    .values({
      title: body.title,
      institution: body.institution ?? "",
      startDate,
      endDate,
      period,
      description: body.description ?? "",
      sortOrder: body.sortOrder ?? 0,
    })
    .returning()

  revalidatePublic()
  return NextResponse.json(result[0], { status: 201 })
}
