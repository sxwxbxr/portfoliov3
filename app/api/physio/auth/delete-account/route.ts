import { eq } from "drizzle-orm"
import { z } from "zod"
import { db } from "@/lib/db"
import { physioUsers } from "@/lib/schema"
import { PASSWORD_MAX, checkPassword, clearSessionCookie, findUserById } from "@/lib/physio/auth"
import { crossSite, fail, ok, parseBody, requireUser } from "@/lib/physio/http"
import { LIMITS, limited } from "@/lib/physio/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const schema = z.object({ password: z.string().min(1).max(PASSWORD_MAX) })

/** Subscription states that would keep billing the customer if the account vanished. */
const BILLING = new Set(["active", "trialing", "past_due"])

/**
 * Deletes the account after the password check. Blocked while a subscription is
 * running and not yet canceled: the customer has to cancel in the Polar portal
 * first, so deleting here can never leave a card being charged. Tokens go with
 * the user (cascade), suggestions keep their text but lose the user link.
 */
export async function POST(req: Request) {
  if (crossSite(req)) return fail(403, "forbidden")
  const { user, res } = await requireUser()
  if (!user) return res
  if (limited(`password:${user.id}`, LIMITS.password.max, LIMITS.password.windowMs)) return fail(429, "rate_limited")

  const body = await parseBody(req, schema)
  if (!body) return fail(400, "invalid_input")

  const row = await findUserById(user.id)
  if (!row) return fail(401, "unauthorized")
  if (!(await checkPassword(body.password, row.passwordHash))) return fail(403, "wrong_password")
  if (BILLING.has(row.subscriptionStatus) && !row.cancelAtPeriodEnd) return fail(409, "subscription_active")

  await db.delete(physioUsers).where(eq(physioUsers.id, row.id))
  await clearSessionCookie()
  return ok()
}
