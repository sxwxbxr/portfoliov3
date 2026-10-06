import { NextResponse } from "next/server"
import { and, eq, lt, or, isNull } from "drizzle-orm"
import { z } from "zod"
import { db } from "@/lib/db"
import { physioUsers } from "@/lib/schema"
import { verifyPolarWebhook } from "@/lib/polar/webhook"
import { isPhysioProduct, userIdFromExternalId } from "@/lib/physio/polar"
import { hasActiveSubscription } from "@/lib/physio/session"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Polar webhook for the physio subscription (a separate Polar endpoint from
 * /api/polar/webhook, with its own secret PHYSIO_POLAR_WEBHOOK_SECRET).
 *
 * Every subscription.* event carries the full subscription, so all of them run
 * through the same mirror: the row in physio_users copies status, product,
 * period end and cancel-at-period-end. Polar stays the source of truth.
 *
 * Handled: subscription.created, .updated, .active, .canceled, .uncanceled,
 * .revoked, .past_due, .paused, .resumed, .cycled, .migrated. Everything else
 * (and other products) is answered 200 and ignored.
 *
 * Deliveries can arrive out of order, so a payload only applies if its
 * modified_at is newer than the stored subscriptionModifiedAt (checked in the
 * UPDATE itself, not just before it).
 */

const EVENTS = new Set([
  "subscription.created",
  "subscription.updated",
  "subscription.active",
  "subscription.canceled",
  "subscription.uncanceled",
  "subscription.revoked",
  "subscription.past_due",
  "subscription.paused",
  "subscription.resumed",
  "subscription.cycled",
  "subscription.migrated",
])

const subscriptionSchema = z.object({
  id: z.string(),
  status: z.string(),
  product_id: z.string().nullish(),
  product: z.object({ id: z.string().optional() }).nullish(),
  customer_id: z.string().nullish(),
  customer: z
    .object({ id: z.string().optional(), external_id: z.string().nullish() })
    .nullish(),
  metadata: z.record(z.unknown()).nullish(),
  current_period_end: z.string().nullish(),
  cancel_at_period_end: z.boolean().nullish(),
  modified_at: z.string().nullish(),
  created_at: z.string().nullish(),
})

const ignored = (reason: string) => NextResponse.json({ ignored: reason })

export async function POST(req: Request) {
  const secret = process.env.PHYSIO_POLAR_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: "not configured" }, { status: 503 })

  const body = await req.text()
  if (!verifyPolarWebhook(body, req.headers, secret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 })
  }

  let event: { type?: string; data?: unknown }
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 })
  }
  if (!event.type || !EVENTS.has(event.type)) return ignored(event.type ?? "no type")

  const parsed = subscriptionSchema.safeParse(event.data)
  if (!parsed.success) return NextResponse.json({ error: "unexpected payload" }, { status: 422 })
  const sub = parsed.data

  const productId = sub.product_id ?? sub.product?.id
  if (!isPhysioProduct(productId)) return ignored("other product")

  const customerId = sub.customer?.id ?? sub.customer_id ?? null
  const metaId = Number(sub.metadata?.physio_user_id)
  const userId =
    userIdFromExternalId(sub.customer?.external_id) ?? (Number.isSafeInteger(metaId) && metaId > 0 ? metaId : null)

  const [user] = await db
    .select()
    .from(physioUsers)
    .where(
      userId !== null
        ? eq(physioUsers.id, userId)
        : customerId
          ? eq(physioUsers.polarCustomerId, customerId)
          : eq(physioUsers.subscriptionId, sub.id),
    )
    .limit(1)
  if (!user) return ignored("unknown user")

  // A different, older subscription ending must not cancel the running one.
  if (user.subscriptionId && user.subscriptionId !== sub.id && hasActiveSubscription(user.subscriptionStatus) && !hasActiveSubscription(sub.status)) {
    return ignored("other subscription")
  }

  const stamp = new Date(sub.modified_at ?? sub.created_at ?? Date.now())
  if (Number.isNaN(stamp.getTime())) return NextResponse.json({ error: "unexpected payload" }, { status: 422 })

  const periodEnd = sub.current_period_end ? new Date(sub.current_period_end) : null
  const applied = await db
    .update(physioUsers)
    .set({
      polarCustomerId: customerId ?? user.polarCustomerId,
      subscriptionId: sub.id,
      subscriptionStatus: sub.status,
      subscriptionProductId: productId ?? null,
      currentPeriodEnd: periodEnd && !Number.isNaN(periodEnd.getTime()) ? periodEnd : null,
      cancelAtPeriodEnd: sub.cancel_at_period_end ?? false,
      subscriptionModifiedAt: stamp,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(physioUsers.id, user.id),
        or(isNull(physioUsers.subscriptionModifiedAt), lt(physioUsers.subscriptionModifiedAt, stamp)),
      ),
    )
    .returning({ id: physioUsers.id })

  return applied.length ? NextResponse.json({ updated: user.id, status: sub.status }) : ignored("stale")
}
