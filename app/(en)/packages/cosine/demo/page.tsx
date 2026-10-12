import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import PageLayout from "@/components/PageLayout"
import { Block } from "@/components/site/Block"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import { CosineDemo } from "@/components/packages/demo/cosine/CosineDemo"
import { OutputFrame } from "@/components/packages/demo/surjection/OutputFrame"
import { cosineDemoCopy as t } from "@/lib/demo/cosine-copy"
import { getCosineDemo } from "@/lib/demo/cosine-server"
import { pkgPath, pkgUrl } from "@/lib/packages/urls"

export const revalidate = 60

export function generateMetadata(): Metadata {
  const url = pkgUrl("/cosine/demo")
  return {
    title: { absolute: t.seoTitle },
    description: t.description,
    alternates: { canonical: url },
    openGraph: { title: t.seoTitle, description: t.description, url, type: "website" },
  }
}

export default function CosineDemoPage() {
  const demo = getCosineDemo()
  const btn = "control inline-flex items-center gap-1 py-2.5 pr-4 pl-5 text-sm"

  return (
    <PageLayout>
      <header className="sheet pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="flex flex-col items-start gap-8">
          <Link
            href={pkgPath("/cosine")}
            className="annotate inline-flex items-center gap-1.5 transition-colors duration-150 hover:text-fg"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {t.overview}
          </Link>

          <h1 className="display text-balance">
            {t.title}
            <span className="headline-sub">{t.titleSub}</span>
          </h1>

          <div className="flex max-w-2xl flex-col gap-4">
            <p className="text-lg leading-relaxed text-fg-muted">{t.intro}</p>
            <p className="text-sm leading-relaxed text-fg-muted">{t.isolation}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={pkgPath("/cosine/docs/getting-started")} className={btn + " control-primary"}>
              {t.docs}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <Link href={pkgPath("/cosine")} className={btn}>
              {t.pricing}
            </Link>
          </div>

          <nav aria-label={t.jump} className="annotate flex flex-wrap gap-x-5 gap-y-2">
            <span>{t.jump}:</span>
            {t.jumpLinks.map((l) => (
              <a key={l.href} href={l.href} className="underline underline-offset-2 hover:text-fg">
                {l.label}
              </a>
            ))}
          </nav>
        </div>
      </header>

      <Block id="search" label={t.search.label} title={t.search.title} sub={t.search.sub} lede={<p>{t.search.lede}</p>}>
        <CosineDemo />
      </Block>

      <Block
        id="insights"
        label={t.insights.label}
        title={t.insights.title}
        sub={t.insights.sub}
        lede={<p>{t.insights.lede}</p>}
      >
        <div className="flex flex-col gap-6">
          {demo.insights ? (
            <OutputFrame html={demo.insights} title={t.insights.frameTitle} height={900} />
          ) : (
            <div className="well px-5 py-4" role="alert">
              <p className="text-sm text-fg">This part of the demo is not available right now.</p>
            </div>
          )}
          <CodeBlock code={t.insights.command} label="Pro command" />
        </div>
      </Block>

      <Block
        label={t.closing.label}
        title={t.closing.title}
        sub={t.closing.sub}
        lede={<p>{t.closing.lede}</p>}
        aside={
          <Link href={pkgPath("/cosine/docs/getting-started")} className={btn + " control-primary"}>
            {t.closing.cta}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        }
      />
    </PageLayout>
  )
}
