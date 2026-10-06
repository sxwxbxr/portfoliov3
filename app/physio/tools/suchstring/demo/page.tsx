import type { Metadata } from "next"
import Link from "next/link"
import { SearchStringTool } from "@/components/physio/search-string/SearchStringTool"
import { ssCopy } from "@/lib/physio/copy/search-string"
import { physioPath, physioUrl } from "@/lib/physio/urls"

export const metadata: Metadata = {
  title: `${ssCopy.metaTitle}, Demo`,
  description: ssCopy.hero.demoLede,
  alternates: { canonical: physioUrl("/tools/suchstring/demo") },
  robots: { index: true, follow: true },
  openGraph: {
    title: `${ssCopy.metaTitle}, Demo | physio.sweber.dev`,
    description: ssCopy.hero.demoLede,
    url: physioUrl("/tools/suchstring/demo"),
    type: "website",
  },
}

export default function SuchstringDemoPage() {
  const t = ssCopy.demo
  return (
    <>
      <header className="sheet pt-10 pb-12 md:pt-16 md:pb-16">
        <div className="flex flex-col items-start gap-5">
          <p className="tab text-xs text-fg-muted">{ssCopy.hero.demoBadge}</p>
          <h1 className="display text-balance">
            {ssCopy.hero.title}
            <span className="headline-sub">{ssCopy.hero.sub}</span>
          </h1>
          <p className="lede">{ssCopy.hero.demoLede}</p>
        </div>
      </header>

      <SearchStringTool mode="demo" />

      <section aria-labelledby="demo-cta" className="sheet border-t border-edge-soft py-14 md:py-20">
        <div className="grid gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
          <h2 id="demo-cta" className="headline">
            {t.ctaHeading}
          </h2>
          <div className="flex flex-col items-start gap-6">
            <p className="lede">{t.ctaBody}</p>
            <div className="flex flex-wrap items-center gap-3">
              <Link href={physioPath("/abo")} className="control control-primary inline-flex min-h-11 items-center px-6 text-sm">
                {t.ctaPrimary}
              </Link>
              <Link
                href={physioPath("/anmelden?next=/tools/suchstring")}
                className="control inline-flex min-h-11 items-center px-6 text-sm"
              >
                {t.ctaSecondary}
              </Link>
            </div>
            <p className="annotate text-fg-muted">{t.footnote}</p>
          </div>
        </div>
      </section>
    </>
  )
}
