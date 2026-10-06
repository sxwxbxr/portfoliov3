import { eq, sql } from "drizzle-orm"
import { z } from "zod"
import { db } from "@/lib/db"
import { physioUsers } from "@/lib/schema"
import { PASSWORD_MAX, checkPassword, findUserById, hashPassword, passwordSchema, setSessionCookie } from "@/lib/physio/auth"
import { crossSite, fail, ok, parseBody, requireUser } from "@/lib/physio/http"
import { LIMITS, limited } from "@/lib/physio/rate-limit"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const schema = z.object({
  currentPassword: z.string().min(1).max(PASSWORD_MAX),
  newPassword: passwordSchema,
})

/** Changes the password; other sessions are signed out (sessionVersion + 1), this one gets a fresh cookie. */
export async function POST(req: Request) {
  if (crossSite(req)) return fail(403, "forbidden")
  const { user, res } = await requireUser()
  if (!user) return res
  if (limited(`password:${user.id}`, LIMITS.password.max, LIMITS.password.windowMs)) return fail(429, "rate_limited")

  const body = await parseBody(req, schema)
  if (!body) return fail(400, "invalid_input")

  const row = await findUserById(user.id)
  if (!row) return fail(401, "unauthorized")
  if (!(await checkPassword(body.currentPassword, row.passwordHash))) return fail(403, "wrong_password")

  const [updated] = await db
    .update(physioUsers)
    .set({
      passwordHash: await hashPassword(body.newPassword),
      sessionVersion: sql`${physioUsers.sessionVersion} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(physioUsers.id, row.id))
    .returning({ id: physioUsers.id, sessionVersion: physioUsers.sessionVersion })

  await setSessionCookie(updated.id, updated.sessionVersion)
  return ok()
}
