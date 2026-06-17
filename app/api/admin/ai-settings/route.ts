export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { requireAuth } from "@/lib/auth"
import { revalidatePublic } from "@/lib/cache"
import { db } from "@/lib/db"
import { aiSettings } from "@/lib/schema"
import { DEFAULT_AI_SETTINGS } from "@/lib/data"
import { eq } from "drizzle-orm"

const SETTINGS_ID = 1

export async function GET() {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const rows = await db.select().from(aiSettings).limit(1)
  const row = rows[0]
  if (row) return NextResponse.json(row)

  // No row yet — create the singleton with defaults so the admin form has data.
  const created = await db
    .insert(aiSettings)
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

  // A model field must never be empty (it would break OpenRouter routing), so
  // fall back to the seeded default when the form sends a blank value.
  const model = (value: unknown, fallback: string) => {
    const s = String(value ?? "").trim()
    return s || fallback
  }
  const rawLimit = Number(body.dailyLimit)

  const values = {
    chatPrimary: model(body.chatPrimary, DEFAULT_AI_SETTINGS.chatPrimary),
    chatFallback: model(body.chatFallback, DEFAULT_AI_SETTINGS.chatFallback),
    contactPrimary: model(body.contactPrimary, DEFAULT_AI_SETTINGS.contactPrimary),
    contactFallback: model(body.contactFallback, DEFAULT_AI_SETTINGS.contactFallback),
    deepdivePrimary: model(body.deepdivePrimary, DEFAULT_AI_SETTINGS.deepdivePrimary),
    deepdiveFallback: model(body.deepdiveFallback, DEFAULT_AI_SETTINGS.deepdiveFallback),
    pitchPrimary: model(body.pitchPrimary, DEFAULT_AI_SETTINGS.pitchPrimary),
    pitchFallback: model(body.pitchFallback, DEFAULT_AI_SETTINGS.pitchFallback),
    skillPrimary: model(body.skillPrimary, DEFAULT_AI_SETTINGS.skillPrimary),
    skillFallback: model(body.skillFallback, DEFAULT_AI_SETTINGS.skillFallback),
    dailyLimit:
      Number.isFinite(rawLimit) && rawLimit >= 0
        ? Math.floor(rawLimit)
        : DEFAULT_AI_SETTINGS.dailyLimit,
    updatedAt: new Date(),
  }

  const existing = await db.select().from(aiSettings).limit(1)
  if (existing[0]) {
    const result = await db
      .update(aiSettings)
      .set(values)
      .where(eq(aiSettings.id, existing[0].id))
      .returning()
    revalidatePublic()
    return NextResponse.json(result[0])
  }

  const created = await db
    .insert(aiSettings)
    .values({ id: SETTINGS_ID, ...values })
    .returning()
  revalidatePublic()
  return NextResponse.json(created[0])
}
