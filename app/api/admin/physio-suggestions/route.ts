export const dynamic = "force-dynamic"

import { NextResponse } from "next/server"
import { desc, eq } from "drizzle-orm"
import { requireAuth } from "@/lib/auth"
import { db } from "@/lib/db"
import { physioSuggestions, physioUsers } from "@/lib/schema"
import { SUGGESTION_STATUSES } from "@/lib/physio/copy/suggestions"

/** GET /api/admin/physio-suggestions?status=new|planned|in_progress|done|declined (newest first). */
export async function GET(request: Request) {
  try {
    await requireAuth()
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const status = new URL(request.url).searchParams.get("status")
  if (status && !(SUGGESTION_STATUSES as readonly string[]).includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const query = db
    .select({
      id: physioSuggestions.id,
      title: physioSuggestions.title,
      description: physioSuggestions.description,
      category: physioSuggestions.category,
      contactEmail: physioSuggestions.contactEmail,
      userId: physioSuggestions.userId,
      userEmail: physioUsers.email,
      status: physioSuggestions.status,
      adminNote: physioSuggestions.adminNote,
      createdAt: physioSuggestions.createdAt,
      updatedAt: physioSuggestions.updatedAt,
    })
    .from(physioSuggestions)
    .leftJoin(physioUsers, eq(physioSuggestions.userId, physioUsers.id))

  const data = await (status ? query.where(eq(physioSuggestions.status, status)) : query).orderBy(
    desc(physioSuggestions.createdAt),
    desc(physioSuggestions.id),
  )
  return NextResponse.json(data)
}
