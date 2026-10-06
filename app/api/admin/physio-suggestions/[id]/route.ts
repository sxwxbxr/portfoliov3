export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { eq } from "drizzle-orm"
import { z } from "zod"
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { physioSuggestions } from "@/lib/schema"
import { SUGGESTION_STATUSES } from "@/lib/physio/copy/suggestions"

type Ctx = { params: Promise<{ id: string }> }

const patch = z
  .object({
    status: z.enum(SUGGESTION_STATUSES).optional(),
    adminNote: z.string().max(4000).optional(),
  })
  .refine((v) => v.status !== undefined || v.adminNote !== undefined, "Nothing to update")

async function parseId(ctx: Ctx): Promise<number | null> {
  const { id } = await ctx.params
  const n = Number(id)
  return Number.isInteger(n) ? n : null
}

async function authed(): Promise<boolean> {
  try {
    await requireAuth()
    return true
  } catch {
    return false
  }
}

/** PATCH { status?, adminNote? } returns the updated row. */
async function update(request: Request, ctx: Ctx) {
  if (!(await authed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const id = await parseId(ctx)
  if (id === null) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const json = await request.json().catch(() => null)
  const parsed = patch.safeParse(json)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 },
    )
  }

  const result = await db
    .update(physioSuggestions)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(physioSuggestions.id, id))
    .returning()
  if (!result[0]) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json(result[0])
}

export const PATCH = update
export const PUT = update

export async function DELETE(_request: Request, ctx: Ctx) {
  if (!(await authed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const id = await parseId(ctx)
  if (id === null) return NextResponse.json({ error: "Not found" }, { status: 404 })

  const result = await db.delete(physioSuggestions).where(eq(physioSuggestions.id, id)).returning()
  if (!result[0]) return NextResponse.json({ error: "Not found" }, { status: 404 })
  return NextResponse.json({ success: true })
}
