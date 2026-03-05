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
      <div className="pt-32">
        <section className="max-w-[1200px] mx-auto px-6 pb-16 md:pb-20">
          <h1 className="text-4xl md:text-5xl font-display font-bold tracking-tight">
            {page.title}
          </h1>
        </section>
        <div className="border-t border-border" />
        <main className="py-24 md:py-32">
          <div className="max-w-[720px] mx-auto px-6 prose prose-lg dark:prose-invert prose-headings:font-display prose-headings:tracking-tight prose-p:leading-[1.75] whitespace-pre-wrap">
            {page.content}
          </div>
        </main>
      </div>
    </div>
  )
}
