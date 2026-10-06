import { NextResponse } from "next/server"
import crypto from "crypto"
import nodemailer from "nodemailer"
import { z } from "zod"
import { POLAR_PORTAL_URL } from "@/lib/packages/polar"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Polar webhook (order.paid). Sends the buyer our own purchase confirmation
 * with the customer portal link and the access steps, and a blind copy to
 * CONTACT_RECIPIENT. Renewals (subscription_cycle) get no mail.
 *
 * Env: POLAR_WEBHOOK_SECRET (from the Polar webhook settings) and the SMTP_*
 * variables of the contact form. ORDER_MAIL_FROM overrides SMTP_FROM.
 */

const TOLERANCE_S = 5 * 60

const orderSchema = z.object({
  id: z.string(),
  billing_reason: z.string().optional(),
  total_amount: z.number().optional(),
  currency: z.string().optional(),
  customer: z.object({ email: z.string().email(), name: z.string().nullish() }),
  product: z.object({ name: z.string() }).nullish(),
})

/** Standard Webhooks keys; Polar secrets made before 2026-09-08 use the raw string. */
function signingKeys(secret: string): Buffer[] {
  const keys = [Buffer.from(secret, "utf8")]
  if (secret.startsWith("whsec_")) keys.unshift(Buffer.from(secret.slice(6), "base64"))
  return keys
}

function verify(body: string, headers: Headers, secret: string): boolean {
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

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

function formatAmount(amount?: number, currency?: string) {
  if (amount === undefined || !currency) return undefined
  return `${currency.toUpperCase()} ${(amount / 100).toFixed(2)}`
}

function confirmationMail(order: z.infer<typeof orderSchema>) {
  const product = order.product?.name ?? "Pro"
  const amount = formatAmount(order.total_amount, order.currency)
  const greeting = order.customer.name ? `Hallo ${order.customer.name}` : "Hallo"
  const de = [
    `${greeting},`,
    "",
    `vielen Dank für deinen Kauf von ${product}${amount ? ` (${amount})` : ""}.`,
    "",
    "So erhältst du Zugriff:",
    `1. Melde dich im Kundenportal an: ${POLAR_PORTAL_URL}`,
    "   Verwende die E-Mail-Adresse, mit der du gekauft hast. Polar schickt dir einen Anmeldecode.",
    "2. Agency und Lifetime: Weise im Portal jeder Person einen Platz zu, auch dir selbst.",
    "3. Verbinde im Portal deinen GitHub-Account und nimm die Einladung zum privaten Pro-Repository an.",
    "4. Installiere die Pro-Pakete aus GitHub Packages, wie in der Dokumentation beschrieben.",
    "",
    "Die Rechnung findest du ebenfalls im Kundenportal.",
    "Fragen? Antworte einfach auf diese E-Mail.",
    "",
    "sweber.dev",
  ]
  const en = [
    `Thank you for buying ${product}. To get access, sign in to ${POLAR_PORTAL_URL} with the e-mail address you used at checkout,`,
    "assign a seat to every person (Agency and Lifetime, yourself included), connect your GitHub account and accept the invitation",
    "to the private Pro repository. Your invoice is in the customer portal too. Questions? Just reply to this e-mail.",
  ]
  const text = [...de, "", "—", "", ...en].join("\n")
  const html = `<div style="font-family:system-ui,sans-serif;line-height:1.5">${text
    .split("\n")
    .map((l) => escapeHtml(l))
    .join("<br />")
    .replaceAll(POLAR_PORTAL_URL, `<a href="${POLAR_PORTAL_URL}">${POLAR_PORTAL_URL}</a>`)}</div>`
  return { subject: `Dein Kauf: ${product}`, text, html }
}

let transporter: ReturnType<typeof nodemailer.createTransport> | undefined
function getTransporter() {
  if (transporter) return transporter
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  })
  return transporter
}

export async function POST(req: Request) {
  const secret = process.env.POLAR_WEBHOOK_SECRET
  if (!secret) return NextResponse.json({ error: "not configured" }, { status: 503 })

  const body = await req.text()
  if (!verify(body, req.headers, secret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 })
  }

  const event = JSON.parse(body) as { type?: string; data?: unknown }
  if (event.type !== "order.paid") return NextResponse.json({ ignored: event.type })

  const parsed = orderSchema.safeParse(event.data)
  if (!parsed.success) return NextResponse.json({ error: "unexpected payload" }, { status: 422 })
  const order = parsed.data
  if (order.billing_reason === "subscription_cycle") return NextResponse.json({ ignored: "renewal" })

  const from = process.env.ORDER_MAIL_FROM || process.env.SMTP_FROM
  if (!from || !process.env.SMTP_HOST) {
    return NextResponse.json({ error: "mail not configured" }, { status: 503 })
  }

  const { subject, text, html } = confirmationMail(order)
  // A failed send returns 500, so Polar retries the delivery.
  await getTransporter().sendMail({
    from,
    to: order.customer.email,
    bcc: process.env.CONTACT_RECIPIENT || undefined,
    replyTo: process.env.CONTACT_RECIPIENT || undefined,
    subject,
    text,
    html,
  })
  return NextResponse.json({ sent: order.id })
}
