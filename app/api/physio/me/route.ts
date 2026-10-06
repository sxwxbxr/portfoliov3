import { NextResponse } from "next/server"
import { getPhysioAccess } from "@/lib/physio/session"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Login state for the header, so the pages themselves can stay static. */
export async function GET() {
  let body: { user: { email: string } | null; hasAccess: boolean }
  try {
    const { user, hasAccess } = await getPhysioAccess()
    body = { user: user ? { email: user.email } : null, hasAccess }
  } catch (e) {
    console.error("physio /me failed", e)
    body = { user: null, hasAccess: process.env.PHYSIO_PAYWALL === "off" }
  }
  return NextResponse.json(body, { headers: { "cache-control": "no-store" } })
}
