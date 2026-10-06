import { and, eq, isNull, sql } from "drizzle-orm"
import { z } from "zod"
import { db } from "@/lib/db"
import { physioTokens, physioUsers } from "@/lib/schema"
import { consumeUserToken, hashPassword, passwordSchema, setSessionCookie } from "@/lib/physio/auth"
import { crossSite, fail, ok, parseBody } from "@/lib/physio/http"
import { LIMITS, clientIp, limited } from "@/lib/physio/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const schema = z.object({ token: z.string().min(1).max(200), password: passwordSchema })

/**
 * Sets a new password from a reset link. Bumps sessionVersion, which signs out
 * every other session, and starts a fresh one here. A student who could use the
 * mailbox link has proven the address, so it counts as verified.
 */
export async function POST(req: Request) {
  if (crossSite(req)) return fail(403, "forbidden")
  if (limited(`reset:${clientIp(req)}`, LIMITS.login.max, LIMITS.login.windowMs)) return fail(429, "rate_limited")

  // The password is validated before the token is consumed, so a too-short one does not burn the link.
  const body = await parseBody(req, schema)
  if (!body) return fail(400, "invalid_input")

  const userId = await consumeUserToken(body.token, "reset")
  if (userId === null) return fail(400, "invalid_token")

  const passwordHash = await hashPassword(body.password)
  const [row] = await db
    .update(physioUsers)
    .set({
      passwordHash,
      sessionVersion: sql`${physioUsers.sessionVersion} + 1`,
      emailVerifiedAt: sql`coalesce(${physioUsers.emailVerifiedAt}, now())`,
      updatedAt: new Date(),
    })
    .where(eq(physioUsers.id, userId))
    .returning({ id: physioUsers.id, sessionVersion: physioUsers.sessionVersion })
  if (!row) return fail(400, "invalid_token")

  // Other reset links issued earlier must not work any more.
  await db
    .update(physioTokens)
    .set({ usedAt: new Date() })
    .where(and(eq(physioTokens.userId, userId), eq(physioTokens.type, "reset"), isNull(physioTokens.usedAt)))

  await setSessionCookie(row.id, row.sessionVersion)
  return ok()
}
