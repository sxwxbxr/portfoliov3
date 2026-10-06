import { NextResponse } from "next/server"
import { z } from "zod"
import nodemailer from "nodemailer"
import { db } from "@/lib/db"
import { physioSuggestions } from "@/lib/schema"
import { getClientIp } from "@/lib/rate-limit"
import { getPhysioUser } from "@/lib/physio/session"
import { MAIN_ORIGIN } from "@/lib/packages/urls"
import {
  SUGGESTION_CATEGORY_VALUES,
  SUGGESTION_LIMITS as L,
  suggestionCategoryLabel,
  suggestionsCopy,
} from "@/lib/physio/copy/suggestions"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const e = suggestionsCopy.errors

const schema = z.object({
  title: z
    .string()
    .trim()
    .min(1, e.titleRequired)
    .min(L.titleMin, e.titleShort)
    .max(L.titleMax, e.titleLong),
  description: z
    .string()
    .trim()
    .min(1, e.descriptionRequired)
    .min(L.descriptionMin, e.descriptionShort)
    .max(L.descriptionMax, e.descriptionLong),
  category: z.enum(SUGGESTION_CATEGORY_VALUES, { message: e.categoryRequired }),
  email: z
    .string()
    .trim()
    .max(L.emailMax, e.emailInvalid)
    .refine((v) => v === "" || z.string().email().safeParse(v).success, e.emailInvalid)
    .optional()
    .default(""),
  // Honeypot: real visitors never see or fill this field.
  website: z.string().optional(),
})

const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000

type GlobalState = {
  physioSuggestionHits?: Map<string, number[]>
  physioSuggestionMailer?: ReturnType<typeof nodemailer.createTransport>
}

function globals() {
  return globalThis as typeof globalThis & GlobalState
}

/** Returns true when this IP is over the limit. Otherwise records the hit. */
function rateLimited(ip: string): boolean {
  const g = globals()
  const store: Map<string, number[]> = (g.physioSuggestionHits ??= new Map())
  const now = Date.now()
  const recent = (store.get(ip) ?? []).filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
  if (recent.length >= RATE_LIMIT_MAX) {
    store.set(ip, recent)
    return true
  }
  recent.push(now)
  store.set(ip, recent)

  if (store.size > 5000) {
    for (const [key, hits] of store) {
      const fresh = hits.filter((t) => now - t < RATE_LIMIT_WINDOW_MS)
      if (fresh.length === 0) store.delete(key)
      else store.set(key, fresh)
    }
  }
  return false
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")

function getMailer() {
  const g = globals()
  if (g.physioSuggestionMailer) return g.physioSuggestionMailer
  const host = process.env.SMTP_HOST
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!host || !user || !pass) return null
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587
  if (!Number.isFinite(port)) return null
  g.physioSuggestionMailer = nodemailer.createTransport({
    host,
    port,
    secure: process.env.SMTP_SECURE === "true" || port === 465,
    auth: { user, pass },
    connectionTimeout: 8000,
    socketTimeout: 8000,
  })
  return g.physioSuggestionMailer
}

async function notifyOwner(s: {
  title: string
  description: string
  category: string
  email: string
  signedIn: boolean
}) {
  const to = process.env.CONTACT_RECIPIENT
  const from = process.env.SMTP_FROM
  const mailer = getMailer()
  if (!to || !from || !mailer) return

  const category = suggestionCategoryLabel(s.category)
  const meta = [
    `Bereich: ${category}`,
    `E-Mail: ${s.email || "keine angegeben"}`,
    `Angemeldet: ${s.signedIn ? "ja" : "nein"}`,
  ]
  const text = `${meta.join("\n")}\n\n${s.title}\n\n${s.description}\n\nBearbeiten: ${MAIN_ORIGIN}/admin/physio-suggestions`
  const html =
    `<div>${meta.map((m) => `<p>${escapeHtml(m)}</p>`).join("")}` +
    `<p><strong>${escapeHtml(s.title)}</strong></p>` +
    `<p>${escapeHtml(s.description).replace(/\n/g, "<br />")}</p></div>`

  await mailer.sendMail({
    from,
    to,
    replyTo: s.email || undefined,
    subject: suggestionsCopy.mail.subject(s.title.replace(/[\r\n]+/g, " ")),
    text,
    html,
  })
}

export async function POST(req: Request) {
  const json = await req.json().catch(() => null)
  if (!json || typeof json !== "object") {
    return NextResponse.json({ error: e.invalid }, { status: 400 })
  }

  // Bots fill the hidden field: pretend it worked and store nothing.
  if (typeof (json as { website?: unknown }).website === "string" && (json as { website: string }).website.trim() !== "") {
    return NextResponse.json({ ok: true })
  }

  const parsed = schema.safeParse(json)
  if (!parsed.success) {
    const fields: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "")
      if (key && !fields[key]) fields[key] = issue.message
    }
    return NextResponse.json({ error: e.invalid, fields }, { status: 400 })
  }

  if (rateLimited(getClientIp(req))) {
    return NextResponse.json({ error: e.rateLimited }, { status: 429 })
  }

  const { title, description, category, email } = parsed.data

  let userId: number | null = null
  try {
    userId = (await getPhysioUser())?.id ?? null
  } catch {
    // Suggestions are open to everyone, a missing or broken session must not block them.
  }

  try {
    await db.insert(physioSuggestions).values({
      title,
      description,
      category,
      contactEmail: email,
      userId,
    })
  } catch (err) {
    console.error("physio suggestion insert failed", err)
    return NextResponse.json({ error: e.generic }, { status: 500 })
  }

  try {
    await notifyOwner({ title, description, category, email, signedIn: userId !== null })
  } catch (err) {
    console.error("physio suggestion mail failed", err)
  }

  return NextResponse.json({ ok: true }, { status: 201 })
}
