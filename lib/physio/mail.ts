import "server-only"
import nodemailer from "nodemailer"
import { accountCopy } from "@/lib/physio/copy/account"

/** Mail of the physio platform. SMTP_* as in the contact form; sender PHYSIO_MAIL_FROM, else SMTP_FROM. */

type Template = { subject: string; lines: string[] }

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

const escapeHtml = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")

function toHtml(text: string) {
  const body = text
    .split("\n")
    .map((l) => escapeHtml(l))
    .join("<br />")
    .replace(/https?:\/\/[^\s<]+/g, (url) => `<a href="${url}">${url}</a>`)
  return `<div style="font-family:system-ui,sans-serif;line-height:1.5">${body}</div>`
}

/** Throws when SMTP is not configured or sending fails; callers decide whether that is fatal. */
export async function sendPhysioMail(to: string, template: Template): Promise<void> {
  const from = process.env.PHYSIO_MAIL_FROM || process.env.SMTP_FROM
  if (!from || !process.env.SMTP_HOST) throw new Error("Physio mail is not configured (SMTP_HOST, SMTP_FROM)")
  const text = [...template.lines, "", accountCopy.mails.footer].join("\n")
  await getTransporter().sendMail({ from, to, subject: template.subject, text, html: toHtml(text) })
}

/** Fire-and-log: for mails whose failure must not change the HTTP response. */
export async function sendPhysioMailSafe(to: string, template: Template): Promise<void> {
  try {
    await sendPhysioMail(to, template)
  } catch (e) {
    console.error("physio mail failed", e)
  }
}
