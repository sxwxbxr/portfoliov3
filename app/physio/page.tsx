import type { Metadata } from "next"
import Link from "next/link"
import { siteCopy } from "@/lib/physio/copy/site"
import { PHYSIO_TOOLS } from "@/lib/physio/tools"
import { physioPath, physioUrl } from "@/lib/physio/urls"

export const revalidate = 60

const c = siteCopy.landing

export const metadata: Metadata = {
  title: { absolute: c.metaTitle },
  description: c.metaDescription,
  alternates: { canonical: physioUrl("/") },
  openGraph: {
    title: c.metaTitle,
    description: c.metaDescription,
    url: physioUrl("/"),
    siteName: "Physio Tools",
    locale: "de_CH",
    type: "website",
  },
}

const btn = "control inline-flex min-h-11 items-center px-5 py-2.5 text-sm"

export default function PhysioLanding() {
  const firstDemo = PHYSIO_TOOLS.find((t) => t.status === "live" && t.demoPath)

  return (
    <>
      <section className="sheet pt-14 pb-20 md:pt-24 md:pb-32">
        <div className="flex flex-col items-start gap-6">
          <h1 className="display text-balance">
            {c.title}
            <span className="headline-sub">{c.titleSub}</span>
          </h1>
          <p className="lede">{c.lede}</p>
          <div className="flex flex-wrap gap-3">
            {firstDemo?.demoPath && (
              <Link href={physioPath(firstDemo.demoPath)} className={`${btn} control-primary`}>
                {c.ctaDemo}
              </Link>
            )}
            <Link href={physioPath("/abo")} className={btn}>
              {c.ctaPlans}
            </Link>
          </div>
        </div>
      </section>

      <section id="tools" className="sheet pb-20 md:pb-28" style={{ scrollMarginTop: "2rem" }}>
        <div className="mb-8 flex flex-col gap-1">
          <h2 className="text-2xl tracking-tight">{c.tools.heading}</h2>
          <p className="text-fg-muted">{c.tools.sub}</p>
        </div>
        <ul className="border-b border-edge-soft">
          {PHYSIO_TOOLS.map((tool) => (
            <li key={tool.slug} className="flex flex-col gap-4 border-t border-edge-soft py-7 md:flex-row md:items-start md:justify-between md:gap-10">
              <div className="flex min-w-0 flex-col gap-2">
                <h3 className="flex flex-wrap items-center gap-3 text-xl tracking-tight">
                  {tool.name}
                  {tool.status === "soon" && <span className="tab text-xs text-fg-muted">{c.tools.soon}</span>}
                </h3>
                <p className="measure leading-relaxed text-fg-muted">{tool.summary}</p>
              </div>
              {tool.status === "live" && (
                <div className="flex shrink-0 flex-wrap gap-3">
                  {tool.demoPath && (
                    <Link href={physioPath(tool.demoPath)} className={btn}>
                      {c.tools.demo}
                    </Link>
                  )}
                  <Link href={physioPath(tool.path)} className={`${btn} control-primary`}>
                    {c.tools.open}
                  </Link>
                </div>
              )}
            </li>
          ))}
          <li className="flex flex-col gap-2 border-t border-edge-soft py-7">
            <h3 className="text-xl tracking-tight text-fg-muted">{c.tools.moreTitle}</h3>
            <p className="measure leading-relaxed text-fg-muted">{c.tools.moreText}</p>
          </li>
        </ul>
      </section>

      <section className="sheet grid gap-8 pb-20 md:grid-cols-[14rem_1fr] md:gap-10 md:pb-28">
        <h2 className="text-2xl tracking-tight">{c.how.heading}</h2>
        <dl className="flex flex-col gap-6">
          {c.how.items.map((item) => (
            <div key={item.title} className="flex flex-col gap-1 md:grid md:grid-cols-[12rem_1fr] md:gap-8">
              <dt className="text-fg">{item.title}</dt>
              <dd className="measure leading-relaxed text-fg-muted">{item.text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="sheet grid gap-6 pb-24 md:grid-cols-2 md:gap-8 md:pb-32">
        <div className="flex flex-col items-start gap-4 border-t border-edge-soft pt-8">
          <h2 className="text-2xl tracking-tight">{c.pricing.heading}</h2>
          <p className="measure leading-relaxed text-fg-muted">{c.pricing.text}</p>
          <Link href={physioPath("/abo")} className={btn}>
            {c.pricing.cta}
          </Link>
        </div>
        <div className="cast flex flex-col items-start gap-4 p-7 md:p-9">
          <h2 className="text-2xl tracking-tight">{c.suggest.heading}</h2>
          <p className="measure leading-relaxed text-fg-muted">{c.suggest.text}</p>
          <Link href={physioPath("/vorschlaege")} className={`${btn} control-primary`}>
            {c.suggest.cta}
          </Link>
        </div>
      </section>
    </>
  )
}
