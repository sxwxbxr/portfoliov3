export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { revalidatePublic } from "@/lib/cache"
import { db } from "@/lib/db"
import { skills } from "@/lib/schema"
import { asc } from "drizzle-orm"

export async function GET() {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const data = await db.select().from(skills).orderBy(asc(skills.sortOrder))
  return NextResponse.json(data)
}

export async function POST(request: Request) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()
  if (!body.category || !body.name) {
    return NextResponse.json(
      { error: "category and name are required" },
      { status: 400 }
    )
  }

  const result = await db
    .insert(skills)
    .values({
      category: body.category,
      name: body.name,
      detail: body.detail ?? "",
      level: body.level ?? "",
      sortOrder: body.sortOrder ?? 0,
    })
    .returning()

  revalidatePublic()
  return NextResponse.json(result[0], { status: 201 })
}
