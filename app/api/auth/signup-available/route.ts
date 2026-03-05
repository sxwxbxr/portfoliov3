import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users } from "@/lib/schema"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const existingUsers = await db.select().from(users).limit(1)
    return NextResponse.json({ available: existingUsers.length === 0 })
  } catch (error) {
    console.error("Signup availability check error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
