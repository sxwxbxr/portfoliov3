import { and, eq, isNull } from "drizzle-orm"
import { z } from "zod"
import { db } from "@/lib/db"
import { physioUsers } from "@/lib/schema"
import { consumeUserToken } from "@/lib/physio/auth"
import { crossSite, fail, ok, parseBody } from "@/lib/physio/http"
import { LIMITS, clientIp, limited } from "@/lib/physio/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const schema = z.object({ token: z.string().min(1).max(200) })

/** Consumes a verification token. A POST, so mail scanners that only GET the link do not burn it. */
export async function POST(req: Request) {
  if (crossSite(req)) return fail(403, "forbidden")
  if (limited(`verify:${clientIp(req)}`, LIMITS.login.max, LIMITS.login.windowMs)) return fail(429, "rate_limited")

  const body = await parseBody(req, schema)
  if (!body) return fail(400, "invalid_input")

  const userId = await consumeUserToken(body.token, "verify")
  if (userId === null) return fail(400, "invalid_token")

  await db
    .update(physioUsers)
    .set({ emailVerifiedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(physioUsers.id, userId), isNull(physioUsers.emailVerifiedAt)))
  return ok()
}
