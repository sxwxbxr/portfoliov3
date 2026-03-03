import fs from "fs/promises"
import path from "path"
import { notFound } from "next/navigation"
import Navigation from "../../../components/Navigation"

export const dynamic = "force-dynamic"

export default async function CustomPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await fs
    .readFile(path.join(process.cwd(), "data", "pages.json"), "utf8")
    .catch(() => "[]")
  const pages = JSON.parse(data)
  const page = pages.find((p: any) => p.slug === slug)
  if (!page) notFound()

  return (
    <div className="min-h-screen bg-background grain-overlay">
      <Navigation />
      <div className="pt-16">
        <section className="py-20 md:py-28 px-6 mesh-gradient">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">{page.title}</h1>
          </div>
        </section>
        <main className="py-20 px-6">
          <div className="max-w-3xl mx-auto prose dark:prose-invert whitespace-pre-wrap">
            {page.content}
          </div>
        </main>
      </div>
    </div>
  )
}
