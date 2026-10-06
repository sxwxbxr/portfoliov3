import { after } from "next/server"
import { z } from "zod"
import { db } from "@/lib/db"
import { physioUsers } from "@/lib/schema"
import {
  createUserToken,
  emailSchema,
  findUserByEmail,
  hashPassword,
  isUniqueViolation,
  passwordSchema,
} from "@/lib/physio/auth"
import { accountCopy } from "@/lib/physio/copy/account"
import { crossSite, fail, ok, parseBody } from "@/lib/physio/http"
import { sendPhysioMailSafe } from "@/lib/physio/mail"
import { physioLink } from "@/lib/physio/origin"
import { HOUR, LIMITS, clientIp, limited } from "@/lib/physio/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const schema = z.object({
  email: emailSchema,
  password: passwordSchema,
  acceptPrivacy: z.literal(true),
})

/**
 * Creates an account and mails the verification link. The answer is the same
 * whether the address is new or already registered (no account enumeration);
 * an existing address gets a "you already have an account" mail instead. No
 * session is started here for the same reason: it would differ between both cases.
 */
export async function POST(req: Request) {
  if (crossSite(req)) return fail(403, "forbidden")
  if (limited(`signup:${clientIp(req)}`, LIMITS.signup.max, LIMITS.signup.windowMs)) return fail(429, "rate_limited")

  const body = await parseBody(req, schema)
  if (!body) return fail(400, "invalid_input")
  const { email, password } = body

  const mailAllowed = () => !limited(`mail:${email}`, 3, HOUR)
  const notifyExisting = () =>
    after(async () => {
      if (!mailAllowed()) return
      await sendPhysioMailSafe(
        email,
        accountCopy.mails.existing(physioLink(req, "/anmelden"), physioLink(req, "/passwort-vergessen")),
      )
    })

  // Hashing on both paths keeps the response time alike.
  const passwordHash = await hashPassword(password)

  if (await findUserByEmail(email)) {
    notifyExisting()
    return ok()
  }

  let userId: number
  try {
    const [row] = await db.insert(physioUsers).values({ email, passwordHash }).returning({ id: physioUsers.id })
    userId = row.id
  } catch (e) {
    if (isUniqueViolation(e)) {
      notifyExisting()
      return ok()
    }
    throw e
  }

  after(async () => {
    if (!mailAllowed()) return
    try {
      const token = await createUserToken(userId, "verify")
      await sendPhysioMailSafe(email, accountCopy.mails.verify(physioLink(req, `/email-bestaetigen?token=${token}`)))
    } catch (e) {
      console.error("physio verification token failed", e)
    }
  })
  return ok()
}
