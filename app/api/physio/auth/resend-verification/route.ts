import { createUserToken, findUserById } from "@/lib/physio/auth"
import { accountCopy } from "@/lib/physio/copy/account"
import { crossSite, fail, ok, requireUser } from "@/lib/physio/http"
import { sendPhysioMail } from "@/lib/physio/mail"
import { physioLink } from "@/lib/physio/origin"
import { HOUR, LIMITS, clientIp, limited } from "@/lib/physio/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  if (crossSite(req)) return fail(403, "forbidden")
  const { user, res } = await requireUser()
  if (!user) return res
  if (
    limited(`resend-ip:${clientIp(req)}`, LIMITS.mail.max, LIMITS.mail.windowMs) ||
    limited(`mail:${user.email}`, 3, HOUR)
  ) {
    return fail(429, "rate_limited")
  }
  if (user.emailVerified) return ok({ alreadyVerified: true })

  const row = await findUserById(user.id)
  if (!row) return fail(401, "unauthorized")
  try {
    const token = await createUserToken(row.id, "verify")
    await sendPhysioMail(row.email, accountCopy.mails.verify(physioLink(req, `/email-bestaetigen?token=${token}`)))
  } catch (e) {
    console.error("physio resend verification failed", e)
    return fail(503, "unavailable")
  }
  return ok()
}
