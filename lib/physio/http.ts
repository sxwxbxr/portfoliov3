import "server-only"
import { NextResponse } from "next/server"
import type { z } from "zod"
import { getPhysioUser, type PhysioUser } from "@/lib/physio/session"

/** Helpers shared by the app/api/physio routes. Errors are codes; the wording lives in lib/physio/copy/account.ts. */

export type ApiError =
  | "invalid_input"
  | "rate_limited"
  | "invalid_credentials"
  | "unauthorized"
  | "email_not_verified"
  | "wrong_password"
  | "invalid_token"
  | "subscription_active"
  | "no_plan"
  | "unavailable"
  | "forbidden"

const NO_STORE = { "cache-control": "no-store" }

export function ok<T extends Record<string, unknown>>(data?: T) {
  return NextResponse.json({ ok: true, ...data }, { headers: NO_STORE })
}

export function fail(status: number, error: ApiError) {
  return NextResponse.json({ error }, { status, headers: NO_STORE })
}

/**
 * Rejects browser requests that come from another site. Cookies are SameSite=Lax
 * already; this is the second layer for state-changing routes. Requests without
 * Origin / Sec-Fetch-Site (curl, server to server) pass: they carry no ambient cookie.
 */
export function crossSite(req: Request): boolean {
  const site = req.headers.get("sec-fetch-site")
  if (site && site !== "same-origin" && site !== "none") return true
  const origin = req.headers.get("origin")
  if (!origin) return false
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host")
  try {
    return new URL(origin).host !== host
  } catch {
    return true
  }
}

export async function parseBody<S extends z.ZodTypeAny>(req: Request, schema: S): Promise<z.infer<S> | null> {
  let raw: unknown
  try {
    raw = await req.json()
  } catch {
    return null
  }
  const parsed = schema.safeParse(raw)
  return parsed.success ? parsed.data : null
}

/** Signed-in user or a ready 401. */
export async function requireUser(): Promise<{ user: PhysioUser; res?: undefined } | { user?: undefined; res: NextResponse }> {
  const user = await getPhysioUser()
  if (!user) return { res: fail(401, "unauthorized") }
  return { user }
}
