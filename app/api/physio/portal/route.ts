import { createPhysioPortalSession } from "@/lib/physio/polar"
import { findUserById } from "@/lib/physio/auth"
import { crossSite, fail, ok, requireUser } from "@/lib/physio/http"
import { LIMITS, limited } from "@/lib/physio/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/** Returns a short-lived Polar customer portal link (cancel, payment method, invoices). */
export async function POST(req: Request) {
  if (crossSite(req)) return fail(403, "forbidden")
  const { user, res } = await requireUser()
  if (!user) return res
  if (limited(`checkout:${user.id}`, LIMITS.checkout.max, LIMITS.checkout.windowMs)) return fail(429, "rate_limited")

  const row = await findUserById(user.id)
  if (!row) return fail(401, "unauthorized")
  try {
    return ok({ url: await createPhysioPortalSession(req, { id: row.id, polarCustomerId: row.polarCustomerId }) })
  } catch (e) {
    console.error("physio portal failed", e)
    return fail(503, "unavailable")
  }
}
