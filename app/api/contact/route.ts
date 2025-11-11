import { NextResponse } from "next/server"
import { z } from "zod"
import crypto from "crypto"
import nodemailer from "nodemailer"
import { cookies } from "next/headers"

export const runtime = "nodejs"

const schema = z.object({
  name: z.string(),
  email: z.string().email(),
  company: z.string().optional(),
  projectType: z.string().optional(),
  budget: z.string().optional(),
  timeline: z.string().optional(),
  message: z.string(),
  newsletter: z.boolean().optional(),
})

type ContactFormData = z.infer<typeof schema>

const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 24 * 60 * 60 * 1000
const RATE_LIMIT_COOKIE = "contact_rl"

type RateLimitEntry = {
  count: number
  resetAt: number
}

type RateLimitStore = Map<string, RateLimitEntry>

type GlobalContactState = {
  contactTransporter?: ReturnType<typeof nodemailer.createTransport>
  contactRateLimit?: RateLimitStore
}

const getGlobalState = () => {
  const globalState = globalThis as typeof globalThis & GlobalContactState
  if (!globalState.contactRateLimit) {
    globalState.contactRateLimit = new Map()
  }
  return globalState
}

const getRequiredEnv = (name: string) => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

const getTransporter = () => {
  const globalState = getGlobalState()
  if (globalState.contactTransporter) {
    return globalState.contactTransporter
  }

  const host = getRequiredEnv("SMTP_HOST")
  const user = getRequiredEnv("SMTP_USER")
  const pass = getRequiredEnv("SMTP_PASS")
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587

  if (!Number.isFinite(port)) {
    throw new Error(`Invalid SMTP_PORT value: ${process.env.SMTP_PORT}`)
  }

  const secure = process.env.SMTP_SECURE === "true" || port === 465

  globalState.contactTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  })

  return globalState.contactTransporter
}

const formatEmailBody = (data: ContactFormData) => {
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")

  const details = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.company ? `Company: ${data.company}` : undefined,
    data.projectType ? `Project Type: ${data.projectType}` : undefined,
    data.budget ? `Budget: ${data.budget}` : undefined,
    data.timeline ? `Timeline: ${data.timeline}` : undefined,
    `Newsletter: ${data.newsletter ? "Yes" : "No"}`,
  ]
    .filter(Boolean)
    .join("\n")

  const htmlDetails = details
    .split("\n")
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("")

  return {
    text: `${details}\n\nMessage:\n${data.message}`,
    html: `<div>${htmlDetails}<p><strong>Message:</strong></p><p>${escapeHtml(
      data.message
    ).replace(/\n/g, "<br />")}</p></div>`,
  }
}

const sendContactEmail = async (data: ContactFormData) => {
  const transporter = getTransporter()
  const from = getRequiredEnv("SMTP_FROM")
  const to = getRequiredEnv("CONTACT_RECIPIENT")
  const subject = `New contact form submission from ${data.name}`
  const { text, html } = formatEmailBody(data)

  await transporter.sendMail({
    from,
    to,
    replyTo: data.email,
    subject,
    text,
    html,
  })
}

const getClientIp = (req: Request) => {
  const header =
    req.headers.get("x-forwarded-for") ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    undefined

  return header ? header.split(",")[0].trim() : undefined
}

const prepareRateLimit = (req: Request) => {
  const { contactRateLimit } = getGlobalState()
  const store = contactRateLimit!
  const now = Date.now()

  for (const [id, entry] of store) {
    if (!entry || Number.isNaN(entry.resetAt) || now >= entry.resetAt) {
      store.delete(id)
    }
  }

  const cookieStore = cookies()
  const existingCookie = cookieStore.get(RATE_LIMIT_COOKIE)
  const browserId = existingCookie?.value ?? crypto.randomUUID()
  const secureCookie = process.env.NODE_ENV === "production"

  const identifiers = new Set<string>([browserId])
  const ip = getClientIp(req)
  if (ip) {
    identifiers.add(`ip:${ip}`)
  }

  let limited = false
  let nextReset = now + RATE_LIMIT_WINDOW_MS
  const entries = new Map<string, RateLimitEntry>()

  for (const id of identifiers) {
    const entry = store.get(id)
    const resetAt = entry?.resetAt ?? 0
    if (!entry || Number.isNaN(resetAt) || now >= resetAt) {
      entries.set(id, {
        count: 0,
        resetAt: now + RATE_LIMIT_WINDOW_MS,
      })
      continue
    }

    entries.set(id, entry)
    nextReset = Math.min(nextReset, resetAt)

    if (entry.count >= RATE_LIMIT_MAX) {
      limited = true
    }
  }

  const applyCookie = (response: NextResponse) => {
    response.cookies.set(RATE_LIMIT_COOKIE, browserId, {
      httpOnly: true,
      sameSite: "lax",
      secure: secureCookie,
      path: "/",
      maxAge: RATE_LIMIT_WINDOW_MS / 1000,
    })
    return response
  }

  return {
    store,
    entries,
    limited,
    nextReset,
    browserId,
    applyCookie,
  }
}

let cachedTransporter: ReturnType<typeof nodemailer.createTransport> | null = null

const getRequiredEnv = (name: string) => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`)
  }
  return value
}

const getTransporter = () => {
  if (cachedTransporter) {
    return cachedTransporter
  }

  const host = getRequiredEnv("SMTP_HOST")
  const user = getRequiredEnv("SMTP_USER")
  const pass = getRequiredEnv("SMTP_PASS")
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587

  if (!Number.isFinite(port)) {
    throw new Error(`Invalid SMTP_PORT value: ${process.env.SMTP_PORT}`)
  }

  const secure = process.env.SMTP_SECURE === "true" || port === 465

  cachedTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  })

  return cachedTransporter
}

const formatEmailBody = (data: ContactFormData) => {
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")

  const details = [
    `Name: ${data.name}`,
    `Email: ${data.email}`,
    data.company ? `Company: ${data.company}` : undefined,
    data.projectType ? `Project Type: ${data.projectType}` : undefined,
    data.budget ? `Budget: ${data.budget}` : undefined,
    data.timeline ? `Timeline: ${data.timeline}` : undefined,
    `Newsletter: ${data.newsletter ? "Yes" : "No"}`,
  ]
    .filter(Boolean)
    .join("\n")

  const htmlDetails = details
    .split("\n")
    .map((line) => `<p>${escapeHtml(line)}</p>`)
    .join("")

  return {
    text: `${details}\n\nMessage:\n${data.message}`,
    html: `<div>${htmlDetails}<p><strong>Message:</strong></p><p>${escapeHtml(
      data.message
    ).replace(/\n/g, "<br />")}</p></div>`,
  }
}

const sendContactEmail = async (data: ContactFormData) => {
  const transporter = getTransporter()
  const from = getRequiredEnv("SMTP_FROM")
  const to = getRequiredEnv("CONTACT_RECIPIENT")
  const subject = `New contact form submission from ${data.name}`
  const { text, html } = formatEmailBody(data)

  await transporter.sendMail({
    from,
    to,
    replyTo: data.email,
    subject,
    text,
    html,
  })
}

const appendContactMessage = async (data: ContactFormData) => {
  const file = await fs.readFile(dataFile, "utf-8").catch(() => "[]")
  const messages = JSON.parse(file)
  messages.push({ ...data, createdAt: new Date().toISOString() })
  await fs.writeFile(dataFile, JSON.stringify(messages, null, 2))
}

export async function POST(req: Request) {
  let data: ContactFormData

  try {
    const body = await req.json()
    data = schema.parse(body)
  } catch (err: unknown) {
    console.error("contact validation error", err)
    const message = err instanceof Error ? err.message : "Invalid request"
    return NextResponse.json(
      { success: false, error: message },
      { status: 400 }
    )
  }

  const rateLimit = prepareRateLimit(req)

  if (rateLimit.limited) {
    const retryAfter = Math.max(
      0,
      Math.ceil((rateLimit.nextReset - Date.now()) / 1000)
    )
    const response = NextResponse.json(
      {
        success: false,
        error: "Daily message limit reached. Please try again tomorrow.",
        retryAfter,
      },
      { status: 429 }
    )
    response.headers.set("Retry-After", retryAfter.toString())
    return rateLimit.applyCookie(response)
  }

  try {
    await sendContactEmail(data)
  } catch (err: unknown) {
    console.error("contact email error", err)
    const misconfiguration =
      err instanceof Error &&
      err.message.toLowerCase().includes("environment variable")
    const message = misconfiguration
      ? "Email service is not configured."
      : "Failed to send contact message."
    return NextResponse.json(
      { success: false, error: message },
      { status: misconfiguration ? 500 : 502 }
    )
  }

  const now = Date.now()
  for (const [id, entry] of rateLimit.entries.entries()) {
    entry.count += 1
    if (!entry.resetAt) {
      entry.resetAt = now + RATE_LIMIT_WINDOW_MS
    }
    rateLimit.store.set(id, entry)
  }

  const response = NextResponse.json({ success: true })
  return rateLimit.applyCookie(response)
}
