import "server-only"
import { createHash, randomBytes } from "crypto"
import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"
import bcrypt from "bcryptjs"
import { and, eq, gt, isNull } from "drizzle-orm"
import { z } from "zod"
import { db } from "@/lib/db"
import { physioTokens, physioUsers } from "@/lib/schema"

/**
 * Account primitives of physio.sweber.dev.
 *
 * The session JWT is signed with PHYSIO_JWT_SECRET only. There is deliberately
 * no fallback to JWT_SECRET: the admin middleware accepts any `auth_token` that
 * verifies against JWT_SECRET, so a shared secret would let a student token
 * reach /admin. The cookie name, the `aud` claim and the secret all differ.
 */

export const SESSION_COOKIE = "physio_session"
export const SESSION_MAX_AGE_S = 60 * 60 * 24 * 30
const AUDIENCE = "physio"

export const PASSWORD_MIN = 10
export const PASSWORD_MAX = 200
const BCRYPT_COST = 12

const VERIFY_TTL_MS = 48 * 60 * 60 * 1000
const RESET_TTL_MS = 60 * 60 * 1000

export type PhysioTokenType = "verify" | "reset"
export type PhysioUserRow = typeof physioUsers.$inferSelect

// Validation

export const emailSchema = z.string().trim().toLowerCase().max(254).email()

export const passwordSchema = z.string().min(PASSWORD_MIN).max(PASSWORD_MAX)

// JWT and cookie

const SECRET_ERROR_PREFIX = "PHYSIO_JWT_SECRET"

function jwtSecret(): Uint8Array {
  const secret = process.env.PHYSIO_JWT_SECRET
  if (!secret || secret.length < 32) {
    throw new Error(
      `${SECRET_ERROR_PREFIX} is not set (or shorter than 32 characters). It signs physio sessions and must differ from JWT_SECRET.`,
    )
  }
  return new TextEncoder().encode(secret)
}

export async function signSessionToken(userId: number, sessionVersion: number): Promise<string> {
  return new SignJWT({ sv: sessionVersion })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(userId))
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_S}s`)
    .sign(jwtSecret())
}

export async function verifySessionToken(
  token: string,
): Promise<{ userId: number; sessionVersion: number } | null> {
  const key = jwtSecret()
  try {
    const { payload } = await jwtVerify(token, key, { audience: AUDIENCE, algorithms: ["HS256"] })
    const userId = Number(payload.sub)
    const sv = payload.sv
    if (!Number.isSafeInteger(userId) || userId <= 0 || typeof sv !== "number") return null
    return { userId, sessionVersion: sv }
  } catch {
    return null
  }
}

const cookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
})

/** Route handlers only: cookies can not be written from server components. */
export async function setSessionCookie(userId: number, sessionVersion: number) {
  const token = await signSessionToken(userId, sessionVersion)
  const jar = await cookies()
  jar.set(SESSION_COOKIE, token, { ...cookieOptions(), maxAge: SESSION_MAX_AGE_S })
}

export async function clearSessionCookie() {
  const jar = await cookies()
  jar.set(SESSION_COOKIE, "", { ...cookieOptions(), maxAge: 0 })
}

// Passwords

export const hashPassword = (password: string) => bcrypt.hash(password, BCRYPT_COST)

/** Valid bcrypt hash of a random string. Compared against when the account does not exist, so timing does not reveal it. */
// Built on first use: every page that reads the session imports this module,
// and a cost-12 hash at import time would slow each cold start.
let dummyHash: Promise<string> | undefined
const getDummyHash = () => (dummyHash ??= bcrypt.hash(randomBytes(16).toString("hex"), BCRYPT_COST))

export async function checkPassword(password: string, hash: string | null): Promise<boolean> {
  const ok = await bcrypt.compare(password, hash ?? (await getDummyHash()))
  return hash !== null && ok
}

// Users

export async function findUserByEmail(email: string): Promise<PhysioUserRow | null> {
  const [row] = await db.select().from(physioUsers).where(eq(physioUsers.email, email)).limit(1)
  return row ?? null
}

export async function findUserById(id: number): Promise<PhysioUserRow | null> {
  const [row] = await db.select().from(physioUsers).where(eq(physioUsers.id, id)).limit(1)
  return row ?? null
}

/** Postgres unique_violation, as surfaced by the Neon driver. */
export function isUniqueViolation(e: unknown): boolean {
  const err = e as { code?: string; cause?: { code?: string } } | null
  return err?.code === "23505" || err?.cause?.code === "23505"
}

// One-time tokens

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex")

/** Creates a token, stores only its SHA-256 and returns the raw value for the mail link. */
export async function createUserToken(userId: number, type: PhysioTokenType): Promise<string> {
  const raw = randomBytes(32).toString("base64url")
  await db.insert(physioTokens).values({
    userId,
    type,
    tokenHash: sha256(raw),
    expiresAt: new Date(Date.now() + (type === "verify" ? VERIFY_TTL_MS : RESET_TTL_MS)),
  })
  return raw
}

/**
 * Atomically marks a valid, unused, unexpired token as used and returns its
 * user id. A single UPDATE ... WHERE used_at IS NULL means two concurrent
 * requests can not both consume the same token.
 */
export async function consumeUserToken(raw: string, type: PhysioTokenType): Promise<number | null> {
  if (!/^[A-Za-z0-9_-]{20,100}$/.test(raw)) return null
  const [row] = await db
    .update(physioTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(physioTokens.tokenHash, sha256(raw)),
        eq(physioTokens.type, type),
        isNull(physioTokens.usedAt),
        gt(physioTokens.expiresAt, new Date()),
      ),
    )
    .returning({ userId: physioTokens.userId })
  return row?.userId ?? null
}
