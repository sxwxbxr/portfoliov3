import { NextResponse } from "next/server"
import fs from "fs/promises"
import path from "path"

const pagesFile = path.join(process.cwd(), "data", "pages.json")

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const { title, slug, content } = await req.json()
  const data = await fs.readFile(pagesFile, "utf8").catch(() => "[]")
  const pages = JSON.parse(data)
  const index = pages.findIndex((p: any) => p.id === id)
  if (index === -1) {
    return NextResponse.json({ message: "Not found" }, { status: 404 })
  }
  pages[index] = { ...pages[index], title, slug, content }
  await fs.writeFile(pagesFile, JSON.stringify(pages, null, 2))
  return NextResponse.json(pages[index])
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const data = await fs.readFile(pagesFile, "utf8").catch(() => "[]")
  const pages = JSON.parse(data)
  const filtered = pages.filter((p: any) => p.id !== id)
  await fs.writeFile(pagesFile, JSON.stringify(filtered, null, 2))
  return NextResponse.json({ ok: true })
}
