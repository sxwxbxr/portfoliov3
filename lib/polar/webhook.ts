import crypto from "crypto"

const TOLERANCE_S = 5 * 60

/** Standard Webhooks keys; Polar secrets made before 2026-09-08 use the raw string. */
function signingKeys(secret: string): Buffer[] {
  const keys = [Buffer.from(secret, "utf8")]
  if (secret.startsWith("whsec_")) keys.unshift(Buffer.from(secret.slice(6), "base64"))
  return keys
}

/** Verifies the Standard Webhooks signature (webhook-id, webhook-timestamp, webhook-signature) of a Polar delivery. */
export function verifyPolarWebhook(body: string, headers: Headers, secret: string): boolean {
  const id = headers.get("webhook-id")
  const ts = headers.get("webhook-timestamp")
  const sigs = headers.get("webhook-signature")
  if (!id || !ts || !sigs) return false
  if (Math.abs(Date.now() / 1000 - Number(ts)) > TOLERANCE_S) return false
  const given = sigs
    .split(" ")
    .map((s) => s.split(",")[1])
    .filter(Boolean)
    .map((s) => Buffer.from(s, "base64"))
  return signingKeys(secret).some((key) => {
    const expected = crypto.createHmac("sha256", key).update(`${id}.${ts}.${body}`).digest()
    return given.some((g) => g.length === expected.length && crypto.timingSafeEqual(g, expected))
  })
}
