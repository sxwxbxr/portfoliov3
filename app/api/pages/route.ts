import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"
import { randomUUID } from "crypto"

const pagesFile = path.join(process.cwd(), "data", "pages.json")

export async function GET() {
  const data = await fs.readFile(pagesFile, "utf8").catch(() => "[]")
  const pages = JSON.parse(data)
  return NextResponse.json(pages)
}

export async function POST(req: Request) {
  const { title, slug, content } = await req.json()
  const data = await fs.readFile(pagesFile, "utf8").catch(() => "[]")
  const pages = JSON.parse(data)
  const newPage = { id: randomUUID(), title, slug, content }
  pages.push(newPage)
  await fs.writeFile(pagesFile, JSON.stringify(pages, null, 2))
  return NextResponse.json(newPage, { status: 201 })
}
