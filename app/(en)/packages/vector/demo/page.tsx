import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import PageLayout from "@/components/PageLayout"
import { Block } from "@/components/site/Block"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import { DeliveryDemo } from "@/components/packages/demo/vector/DeliveryDemo"
import { SignDemo } from "@/components/packages/demo/vector/SignDemo"
import { SsrfDemo } from "@/components/packages/demo/vector/SsrfDemo"
import { vectorDemoCopy as t } from "@/lib/demo/vector-copy"
import { VECTOR_CATALOG, VECTOR_PORTAL_HANDLER, VECTOR_PORTAL_UI } from "@/lib/demo/vector-snippets"
import { getPackage } from "@/lib/packages"
import { pkgPath, pkgUrl } from "@/lib/packages/urls"

export const revalidate = 60

export function generateMetadata(): Metadata {
  const url = pkgUrl("/vector/demo")
  return {
    title: { absolute: t.seoTitle },
    description: t.description,
    alternates: { canonical: url },
    openGraph: { title: t.seoTitle, description: t.description, url, type: "website" },
  }
}

export default function VectorDemoPage() {
  const btn = "control inline-flex items-center gap-1 py-2.5 pr-4 pl-5 text-sm"
  const waitlist = getPackage("vector")?.pro?.waitlistUrl

  return (
    <PageLayout>
      <header className="sheet pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="flex flex-col items-start gap-8">
          <Link
            href={pkgPath("/vector")}
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
            <Link href={pkgPath("/vector/docs/getting-started")} className={btn + " control-primary"}>
              {t.docs}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <Link href={pkgPath("/vector/docs/guides/receiving")} className={btn}>
              {t.receiving}
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

      <Block id="signing" label={t.signing.label} title={t.signing.title} sub={t.signing.sub} lede={<p>{t.signing.lede}</p>}>
        <SignDemo />
      </Block>

      <Block id="delivery" label={t.delivery.label} title={t.delivery.title} sub={t.delivery.sub} lede={<p>{t.delivery.lede}</p>}>
        <DeliveryDemo />
      </Block>

      <Block id="ssrf" label={t.ssrf.label} title={t.ssrf.title} sub={t.ssrf.sub} lede={<p>{t.ssrf.lede}</p>}>
        <SsrfDemo />
      </Block>

      <Block id="pro" label={t.pro.label} title={t.pro.title} sub={t.pro.sub} lede={<p>{t.pro.lede}</p>}>
        <div className="flex flex-col gap-10">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="flex min-w-0 flex-col gap-6">
              <CodeBlock title={t.pro.portal} code={VECTOR_PORTAL_HANDLER} />
            </div>
            <div className="flex min-w-0 flex-col gap-6">
              <CodeBlock title={t.pro.portalUi} code={VECTOR_PORTAL_UI} />
              <p className="text-sm leading-relaxed text-fg-muted">{t.pro.portalNote}</p>
            </div>
          </div>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <CodeBlock title={t.pro.catalog} code={VECTOR_CATALOG} />
            <div className="flex min-w-0 flex-col gap-4">
              <p className="text-sm leading-relaxed text-fg-muted">{t.pro.catalogNote}</p>
              <p className="text-sm leading-relaxed text-fg-muted">{t.pro.ops}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href={pkgPath("/vector")} className={btn}>
              {t.pro.cta}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            {waitlist && (
              <a href={waitlist} className={btn}>
                {t.pro.waitlist}
              </a>
            )}
          </div>
        </div>
      </Block>

      <Block
        label={t.closing.label}
        title={t.closing.title}
        sub={t.closing.sub}
        lede={<p>{t.closing.lede}</p>}
        aside={
          <Link href={pkgPath("/vector/docs/getting-started")} className={btn + " control-primary"}>
            {t.closing.cta}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        }
      />
    </PageLayout>
  )
}
