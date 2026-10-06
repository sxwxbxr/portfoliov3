import type { Metadata } from "next"
import { ToolsHub } from "@/components/physio/ToolsHub"
import { siteCopy } from "@/lib/physio/copy/site"
import { PHYSIO_TOOLS, isNewTool } from "@/lib/physio/tools"
import { physioUrl } from "@/lib/physio/urls"

/** Static; revalidated hourly so a "Neu" badge runs out without a deploy. */
export const revalidate = 3600

const c = siteCopy.tools

export const metadata: Metadata = {
  title: c.meta.title,
  description: c.meta.description,
  alternates: { canonical: physioUrl("/tools") },
  openGraph: {
    title: `${c.meta.title} | Physio Tools`,
    description: c.meta.description,
    url: physioUrl("/tools"),
    siteName: "Physio Tools",
    locale: "de_CH",
    type: "website",
  },
}

export default function ToolsPage() {
  const now = new Date()
  const newSlugs = PHYSIO_TOOLS.filter((t) => isNewTool(t, now)).map((t) => t.slug)

  return (
    <>
      <header className="sheet pt-10 pb-10 md:pt-16 md:pb-14">
        <div className="flex flex-col items-start gap-5">
          <h1 className="display text-balance">
            {c.hero.title}
            <span className="headline-sub">{c.hero.sub}</span>
          </h1>
          <p className="lede">{c.hero.lede}</p>
        </div>
      </header>

      <div className="sheet pb-20 md:pb-28">
        <ToolsHub tools={PHYSIO_TOOLS} newSlugs={newSlugs} />
      </div>
    </>
  )
}
