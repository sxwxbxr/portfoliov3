import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users } from "@/lib/schema"
import bcrypt from "bcryptjs"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    // Check if any user exists — if so, signup is disabled
    const existingUsers = await db.select().from(users).limit(1)
    if (existingUsers.length > 0) {
      return NextResponse.json(
        { error: "Signup is disabled. An account already exists." },
        { status: 403 }
      )
    }

    // Validate
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      )
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      )
    }

    // Hash & insert
    const passwordHash = await bcrypt.hash(password, 12)
    await db.insert(users).values({ email, passwordHash, name })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
