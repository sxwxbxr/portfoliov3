import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import PageLayout from "@/components/PageLayout"
import { Block } from "@/components/site/Block"
import { CheckPlayground } from "@/components/packages/demo/inverse/CheckPlayground"
import { DeadlineCalc } from "@/components/packages/demo/inverse/DeadlineCalc"
import { PlainHtmlDemo } from "@/components/packages/demo/inverse/PlainHtmlDemo"
import { ShopDemo } from "@/components/packages/demo/inverse/ShopDemo"
import { inverseDemoCopy } from "@/lib/demo/inverse-copy"
import { pkgPath, pkgUrl } from "@/lib/packages/urls"

export const revalidate = 60

const t = inverseDemoCopy

export function generateMetadata(): Metadata {
  const url = pkgUrl("/inverse/demo")
  return {
    title: { absolute: t.seoTitle },
    description: t.description,
    alternates: { canonical: url },
    openGraph: { title: t.seoTitle, description: t.description, url, type: "website" },
  }
}

export default function InverseDemoPage() {
  const btn = "control inline-flex items-center gap-1 py-2.5 pr-4 pl-5 text-sm"

  return (
    <PageLayout>
      <header className="sheet pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="flex flex-col items-start gap-8">
          <Link
            href={pkgPath("/inverse")}
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
            <Link href={pkgPath("/inverse/docs")} className={btn + " control-primary"}>
              {t.docs}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
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

      <Block id="shop" label={t.shop.label} title={t.shop.title} sub={t.shop.sub} lede={<p>{t.shop.lede}</p>}>
        <ShopDemo />
      </Block>

      <Block id="plain" label={t.plain.label} title={t.plain.title} sub={t.plain.sub} lede={<p>{t.plain.lede}</p>}>
        <PlainHtmlDemo />
      </Block>

      <Block id="check" label={t.check.label} title={t.check.title} sub={t.check.sub} lede={<p>{t.check.lede}</p>}>
        <CheckPlayground />
      </Block>

      <Block
        id="deadlines"
        label={t.deadlines.label}
        title={t.deadlines.title}
        sub={t.deadlines.sub}
        lede={<p>{t.deadlines.lede}</p>}
      >
        <DeadlineCalc />
      </Block>

      <Block label={t.closing.label} title={t.closing.title} sub={t.closing.sub} lede={<p>{t.closing.lede}</p>}>
        <div className="flex flex-wrap gap-3">
          <Link href={pkgPath("/inverse/docs/getting-started")} className={btn + " control-primary"}>
            {t.closing.cta}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </Block>
    </PageLayout>
  )
}
