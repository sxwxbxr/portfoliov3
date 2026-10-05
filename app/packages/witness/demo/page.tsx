import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import PageLayout from "@/components/PageLayout"
import { Block } from "@/components/site/Block"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import { OutputFrame } from "@/components/packages/demo/surjection/OutputFrame"
import { ImageDemo } from "@/components/packages/demo/witness/ImageDemo"
import { LabelDemo } from "@/components/packages/demo/witness/LabelDemo"
import { NoticeDemo } from "@/components/packages/demo/witness/NoticeDemo"
import { WatermarkDemo } from "@/components/packages/demo/witness/WatermarkDemo"
import { witnessDemoCopy as t } from "@/lib/demo/witness-copy"
import { getWitnessDemo } from "@/lib/demo/witness-server"
import { WITNESS_PRO_COMMANDS } from "@/lib/demo/witness-snippets"
import { pkgPath, pkgUrl } from "@/lib/packages/urls"

export const revalidate = 60

export function generateMetadata(): Metadata {
  const url = pkgUrl("/witness/demo")
  return {
    title: { absolute: t.seoTitle },
    description: t.description,
    alternates: { canonical: url },
    openGraph: { title: t.seoTitle, description: t.description, url, type: "website" },
  }
}

function Missing() {
  return (
    <div className="well px-5 py-4" role="alert">
      <p className="text-sm text-fg">This part of the demo is not available right now.</p>
    </div>
  )
}

export default function WitnessDemoPage() {
  const demo = getWitnessDemo()
  const btn = "control inline-flex items-center gap-1 py-2.5 pr-4 pl-5 text-sm"

  return (
    <PageLayout>
      <header className="sheet pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="flex flex-col items-start gap-8">
          <Link
            href={pkgPath("/witness")}
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
            <p className="text-sm leading-relaxed text-fg-muted">{t.legal}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href={pkgPath("/witness/docs/getting-started")} className={btn + " control-primary"}>
              {t.docs}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <Link href={pkgPath("/witness/docs/legal/article-50")} className={btn}>
              {t.article}
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

      <Block id="notice" label={t.notice.label} title={t.notice.title} sub={t.notice.sub} lede={<p>{t.notice.lede}</p>}>
        <NoticeDemo />
      </Block>

      <Block id="labels" label={t.labels.label} title={t.labels.title} sub={t.labels.sub} lede={<p>{t.labels.lede}</p>}>
        <LabelDemo />
      </Block>

      <Block id="text" label={t.text.label} title={t.text.title} sub={t.text.sub} lede={<p>{t.text.lede}</p>}>
        <WatermarkDemo />
      </Block>

      <Block id="images" label={t.images.label} title={t.images.title} sub={t.images.sub} lede={<p>{t.images.lede}</p>}>
        <ImageDemo />
      </Block>

      <Block id="pro" label={t.pro.label} title={t.pro.title} sub={t.pro.sub} lede={<p>{t.pro.lede}</p>}>
        <div className="flex flex-col gap-10">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="flex min-w-0 flex-col gap-6">
              {demo.scanConfig ? <CodeBlock title={t.pro.config} code={demo.scanConfig} /> : <Missing />}
              {demo.register && (
                <details className="group">
                  <summary className="annotate cursor-pointer underline underline-offset-2 hover:text-fg">
                    {t.pro.register}
                  </summary>
                  <div className="mt-3">
                    <CodeBlock code={demo.register} label={t.pro.register} />
                  </div>
                </details>
              )}
            </div>
            <div className="flex min-w-0 flex-col gap-6">
              {demo.scan ? <CodeBlock title={t.pro.scan} code={demo.scan.trimEnd()} /> : <Missing />}
              <p className="text-sm leading-relaxed text-fg-muted">{t.pro.scanNote}</p>
              <CodeBlock title={t.pro.commands} code={WITNESS_PRO_COMMANDS} />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="annotate">{t.pro.report}</p>
            {demo.report ? <OutputFrame html={demo.report} title={t.pro.reportTitle} height={900} /> : <Missing />}
          </div>
          <div className="flex flex-col gap-2">
            <p className="annotate">{t.pro.page}</p>
            {demo.page ? <OutputFrame html={demo.page} title={t.pro.pageTitle} height={620} /> : <Missing />}
          </div>
          <p className="max-w-2xl text-sm leading-relaxed text-fg-muted">{t.pro.locales}</p>
          <Link href={pkgPath("/witness")} className={btn + " self-start"}>
            {t.pro.cta}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </Block>

      <Block
        label={t.closing.label}
        title={t.closing.title}
        sub={t.closing.sub}
        lede={<p>{t.closing.lede}</p>}
        aside={
          <Link href={pkgPath("/witness/docs/getting-started")} className={btn + " control-primary"}>
            {t.closing.cta}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        }
      />
    </PageLayout>
  )
}
