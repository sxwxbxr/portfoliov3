import { NextResponse } from "next/server"
import { z } from "zod"
import { promises as fs } from "fs"
import path from "path"
import nodemailer from "nodemailer"

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

const dataFile = path.join(process.cwd(), "data", "contact-messages.json")

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

  try {
    await appendContactMessage(data)
  } catch (err: unknown) {
    console.error("contact storage error", err)
    const message = err instanceof Error ? err.message : "Unable to save message"
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
