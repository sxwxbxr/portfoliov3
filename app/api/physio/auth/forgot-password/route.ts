import { after } from "next/server"
import { z } from "zod"
import { createUserToken, emailSchema, findUserByEmail } from "@/lib/physio/auth"
import { accountCopy } from "@/lib/physio/copy/account"
import { crossSite, fail, ok, parseBody } from "@/lib/physio/http"
import { sendPhysioMailSafe } from "@/lib/physio/mail"
import { physioLink } from "@/lib/physio/origin"
import { HOUR, LIMITS, clientIp, limited } from "@/lib/physio/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const schema = z.object({ email: emailSchema })

/** Always answers the same, whether or not the address has an account. The work happens after the response. */
export async function POST(req: Request) {
  if (crossSite(req)) return fail(403, "forbidden")
  if (limited(`forgot:${clientIp(req)}`, LIMITS.mail.max, LIMITS.mail.windowMs)) return fail(429, "rate_limited")

  const body = await parseBody(req, schema)
  if (!body) return fail(400, "invalid_input")
  const { email } = body

  const user = await findUserByEmail(email)
  if (user && !limited(`mail:${email}`, 3, HOUR)) {
    after(async () => {
      try {
        const token = await createUserToken(user.id, "reset")
        await sendPhysioMailSafe(email, accountCopy.mails.reset(physioLink(req, `/passwort-zuruecksetzen?token=${token}`)))
      } catch (e) {
        console.error("physio reset token failed", e)
      }
    })
  }
  return ok()
}
