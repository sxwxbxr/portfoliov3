import { NextResponse } from "next/server"
import { z } from "zod"
import { promises as fs } from "fs"
import path from "path"

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

const dataFile = path.join(process.cwd(), "data", "contact-messages.json")

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data = schema.parse(body)
    const file = await fs.readFile(dataFile, "utf-8").catch(() => "[]")
    const messages = JSON.parse(file)
    messages.push({ ...data, createdAt: new Date().toISOString() })
    await fs.writeFile(dataFile, JSON.stringify(messages, null, 2))
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error("contact error", err)
    const message = err instanceof Error ? err.message : "Invalid request"
    return NextResponse.json({ success: false, error: message }, { status: 400 })
  }
}
