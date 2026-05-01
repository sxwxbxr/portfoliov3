export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { revalidatePublic } from "@/lib/cache"
import { db } from "@/lib/db"
import { siteSettings } from "@/lib/schema"

const SETTINGS_ID = 1

export async function GET() {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rows = await db.select().from(siteSettings).limit(1)
  const row = rows[0]
  if (row) return NextResponse.json(row)

  // No row yet — create the singleton with defaults so the admin form has data.
  const created = await db
    .insert(siteSettings)
    .values({ id: SETTINGS_ID })
    .returning()
  return NextResponse.json(created[0])
}

export async function PUT(request: Request) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json()

  const values = {
    heroAvailable: Boolean(body.heroAvailable),
    heroAvailabilityLabel: String(body.heroAvailabilityLabel ?? ""),
    heroMetrics: Array.isArray(body.heroMetrics) ? body.heroMetrics : [],
    contactEmail: String(body.contactEmail ?? ""),
    contactPhone: String(body.contactPhone ?? ""),
    contactLocation: String(body.contactLocation ?? ""),
    linkedinUrl: String(body.linkedinUrl ?? ""),
    githubUrl: String(body.githubUrl ?? ""),
    twitterUrl: String(body.twitterUrl ?? ""),
    currentEmployer: String(body.currentEmployer ?? ""),
    currentRole: String(body.currentRole ?? ""),
    alumniOf: String(body.alumniOf ?? ""),
    knowsAbout: Array.isArray(body.knowsAbout) ? body.knowsAbout : [],
    privacyContent: String(body.privacyContent ?? ""),
    updatedAt: new Date(),
  }

  // Upsert the singleton row.
  const existing = await db.select().from(siteSettings).limit(1)
  if (existing[0]) {
    const result = await db
      .update(siteSettings)
      .set(values)
      .returning()
    revalidatePublic()
    return NextResponse.json(result[0])
  }

  const created = await db
    .insert(siteSettings)
    .values({ id: SETTINGS_ID, ...values })
    .returning()
  revalidatePublic()
  return NextResponse.json(created[0])
}
