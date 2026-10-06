import "server-only"
import { physioLink } from "@/lib/physio/origin"

/**
 * Polar.sh integration of the physio subscription. Plain fetch, no SDK.
 * Docs: https://polar.sh/docs/api-reference (checkouts, customer-sessions).
 *
 * Env: POLAR_ACCESS_TOKEN (scopes checkouts:write + customer_sessions:write),
 * POLAR_SERVER ("sandbox" for sandbox-api.polar.sh), PHYSIO_POLAR_PRODUCT_MONTHLY,
 * PHYSIO_POLAR_PRODUCT_YEARLY.
 */

export type PhysioPlan = "monthly" | "yearly"

const baseUrl = () =>
  process.env.POLAR_SERVER === "sandbox" ? "https://sandbox-api.polar.sh/v1" : "https://api.polar.sh/v1"

export function physioProductIds(): { monthly: string; yearly: string } {
  return {
    monthly: process.env.PHYSIO_POLAR_PRODUCT_MONTHLY?.trim() ?? "",
    yearly: process.env.PHYSIO_POLAR_PRODUCT_YEARLY?.trim() ?? "",
  }
}

/** Plans that can be bought right now (product configured and access token present). */
export function availablePlans(): PhysioPlan[] {
  if (!process.env.POLAR_ACCESS_TOKEN) return []
  const ids = physioProductIds()
  return (["monthly", "yearly"] as const).filter((p) => ids[p])
}

export function isPhysioProduct(productId: string | null | undefined): boolean {
  if (!productId) return false
  const ids = physioProductIds()
  return productId === ids.monthly || productId === ids.yearly
}

export const externalCustomerId = (userId: number) => `physio-${userId}`

/** Inverse of externalCustomerId; null for anything that is not `physio-<number>`. */
export function userIdFromExternalId(externalId: string | null | undefined): number | null {
  const m = /^physio-(\d{1,12})$/.exec(externalId ?? "")
  return m ? Number(m[1]) : null
}

async function polar<T>(path: string, body: unknown): Promise<T> {
  const token = process.env.POLAR_ACCESS_TOKEN
  if (!token) throw new Error("POLAR_ACCESS_TOKEN is not set")
  const res = await fetch(`${baseUrl()}${path}`, {
    method: "POST",
    headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  })
  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    throw new Error(`Polar ${path} ${res.status} ${detail.slice(0, 300)}`)
  }
  return (await res.json()) as T
}

/** Creates a hosted checkout for one plan and returns its URL. */
export async function createPhysioCheckout(
  req: Request,
  user: { id: number; email: string },
  plan: PhysioPlan,
): Promise<string> {
  const productId = physioProductIds()[plan]
  if (!productId) throw new Error(`No Polar product configured for plan ${plan}`)
  const session = await polar<{ url: string }>("/checkouts/", {
    products: [productId],
    customer_email: user.email,
    external_customer_id: externalCustomerId(user.id),
    metadata: { physio_user_id: String(user.id) },
    success_url: physioLink(req, "/konto?checkout=success"),
    return_url: physioLink(req, "/abo"),
  })
  return session.url
}

/** Customer portal link (manage payment method, cancel, invoices) for the user's Polar customer. */
export async function createPhysioPortalSession(
  req: Request,
  user: { id: number; polarCustomerId: string | null },
): Promise<string> {
  const session = await polar<{ customer_portal_url: string }>("/customer-sessions/", {
    ...(user.polarCustomerId
      ? { customer_id: user.polarCustomerId }
      : { external_customer_id: externalCustomerId(user.id) }),
    return_url: physioLink(req, "/konto"),
  })
  return session.customer_portal_url
}
