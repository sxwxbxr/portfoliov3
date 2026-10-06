import { z } from "zod"
import { PASSWORD_MAX, checkPassword, emailSchema, findUserByEmail, setSessionCookie } from "@/lib/physio/auth"
import { crossSite, fail, ok, parseBody } from "@/lib/physio/http"
import { safeNextPath } from "@/lib/physio/origin"
import { LIMITS, clientIp, limited } from "@/lib/physio/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const schema = z.object({
  email: emailSchema,
  password: z.string().min(1).max(PASSWORD_MAX),
  next: z.string().max(300).optional(),
})

export async function POST(req: Request) {
  if (crossSite(req)) return fail(403, "forbidden")
  if (limited(`login:${clientIp(req)}`, LIMITS.login.max, LIMITS.login.windowMs)) return fail(429, "rate_limited")

  const body = await parseBody(req, schema)
  if (!body) return fail(400, "invalid_input")
  // Guards one account against guessing from many addresses.
  if (limited(`login-email:${body.email}`, LIMITS.login.max * 3, LIMITS.login.windowMs)) return fail(429, "rate_limited")

  const user = await findUserByEmail(body.email)
  // Compares against a dummy hash for unknown addresses, so timing does not reveal them.
  const valid = await checkPassword(body.password, user?.passwordHash ?? null)
  if (!user || !valid) return fail(401, "invalid_credentials")

  await setSessionCookie(user.id, user.sessionVersion)
  return ok({ next: safeNextPath(body.next) })
}
