import fs from "fs/promises"
import path from "path"
import { notFound } from "next/navigation"

export const dynamic = "force-dynamic"

export default async function CustomPage({ params }: { params: { slug: string } }) {
  const data = await fs
    .readFile(path.join(process.cwd(), "data", "pages.json"), "utf8")
    .catch(() => "[]")
  const pages = JSON.parse(data)
  const page = pages.find((p: any) => p.slug === params.slug)
  if (!page) notFound()

  return (
    <div className="max-w-3xl mx-auto py-20 px-4">
      <h1 className="text-3xl font-bold mb-4">{page.title}</h1>
      <div className="prose dark:prose-invert whitespace-pre-wrap">{page.content}</div>
    </div>
  )
}
