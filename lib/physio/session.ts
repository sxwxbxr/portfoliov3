import "server-only"
import { cache } from "react"
import { cookies } from "next/headers"
import { SESSION_COOKIE, findUserById, verifySessionToken } from "@/lib/physio/auth"

/**
 * Contract shared by every physio page and route: the signed-in student and the
 * paywall decision. Signatures are fixed so tool pages can rely on them.
 */

export type PhysioUser = {
  id: number
  email: string
  emailVerified: boolean
  subscriptionStatus: string
  currentPeriodEnd: Date | null
  cancelAtPeriodEnd: boolean
}

export type PhysioAccess = {
  user: PhysioUser | null
  /** True when the paid tools may be used (active/trialing subscription, or paywall switched off). */
  hasAccess: boolean
  /** False when PHYSIO_PAYWALL=off: every tool is open, even without an account. */
  paywallEnabled: boolean
}

/** Polar keeps "active" until the period ends when a subscription is canceled at period end, and sends subscription.revoked when access ends. */
const ACCESS_STATUSES = new Set(["active", "trialing"])

export const hasActiveSubscription = (status: string) => ACCESS_STATUSES.has(status)

const loadUser = cache(async (): Promise<PhysioUser | null> => {
  const jar = await cookies()
  const token = jar.get(SESSION_COOKIE)?.value
  if (!token) return null
  const claims = await verifySessionToken(token)
  if (!claims) return null
  const row = await findUserById(claims.userId)
  if (!row || row.sessionVersion !== claims.sessionVersion) return null
  return {
    id: row.id,
    email: row.email,
    emailVerified: row.emailVerifiedAt !== null,
    subscriptionStatus: row.subscriptionStatus,
    currentPeriodEnd: row.currentPeriodEnd,
    cancelAtPeriodEnd: row.cancelAtPeriodEnd,
  }
})

/** The signed-in student from the `physio_session` cookie, or null. */
export async function getPhysioUser(): Promise<PhysioUser | null> {
  return loadUser()
}

/** Session plus the paywall decision for the paid tools. */
export async function getPhysioAccess(): Promise<PhysioAccess> {
  const user = await loadUser()
  const paywallEnabled = process.env.PHYSIO_PAYWALL !== "off"
  return {
    user,
    paywallEnabled,
    hasAccess: !paywallEnabled || (user !== null && hasActiveSubscription(user.subscriptionStatus)),
  }
}
