import { z } from "zod"
import { availablePlans, createPhysioCheckout } from "@/lib/physio/polar"
import { crossSite, fail, ok, parseBody, requireUser } from "@/lib/physio/http"
import { LIMITS, limited } from "@/lib/physio/rate-limit"
import { hasActiveSubscription } from "@/lib/physio/session"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const schema = z.object({ plan: z.enum(["monthly", "yearly"]) })

/**
 * Starts a Polar checkout for the signed-in student and returns its URL. The
 * e-mail must be verified: it is passed to Polar, and the invoice has to match
 * the account.
 */
export async function POST(req: Request) {
  if (crossSite(req)) return fail(403, "forbidden")
  const { user, res } = await requireUser()
  if (!user) return res
  if (limited(`checkout:${user.id}`, LIMITS.checkout.max, LIMITS.checkout.windowMs)) return fail(429, "rate_limited")
  if (!user.emailVerified) return fail(403, "email_not_verified")

  const body = await parseBody(req, schema)
  if (!body) return fail(400, "invalid_input")
  if (!availablePlans().includes(body.plan)) return fail(400, "no_plan")
  // Already paying: a second subscription would be billed twice.
  if (hasActiveSubscription(user.subscriptionStatus) && !user.cancelAtPeriodEnd) return fail(409, "subscription_active")

  try {
    return ok({ url: await createPhysioCheckout(req, user, body.plan) })
  } catch (e) {
    console.error("physio checkout failed", e)
    return fail(503, "unavailable")
  }
}
