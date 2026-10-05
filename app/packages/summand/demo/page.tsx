import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import PageLayout from "@/components/PageLayout"
import { Block } from "@/components/site/Block"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import { OutputFrame } from "@/components/packages/demo/surjection/OutputFrame"
import { LeitwegDemo } from "@/components/packages/demo/summand/LeitwegDemo"
import { ValidateDemo } from "@/components/packages/demo/summand/ValidateDemo"
import { summandDemoCopy as t } from "@/lib/demo/summand-copy"
import { getSummandDemo } from "@/lib/demo/summand-server"
import { SUMMAND_READ_SNIPPET } from "@/lib/demo/summand-snippets"
import { pkgPath, pkgUrl } from "@/lib/packages/urls"

export const revalidate = 60

export function generateMetadata(): Metadata {
  const url = pkgUrl("/summand/demo")
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

export default function SummandDemoPage() {
  const demo = getSummandDemo()
  const btn = "control inline-flex items-center gap-1 py-2.5 pr-4 pl-5 text-sm"

  return (
    <PageLayout>
      <header className="sheet pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="flex flex-col items-start gap-8">
          <Link
            href={pkgPath("/summand")}
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
            <Link href={pkgPath("/summand/docs/getting-started")} className={btn + " control-primary"}>
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

      <Block
        id="validate"
        label={t.validate.label}
        title={t.validate.title}
        sub={t.validate.sub}
        lede={<p>{t.validate.lede}</p>}
      >
        <ValidateDemo />
      </Block>

      <Block id="leitweg" label={t.leitweg.label} title={t.leitweg.title} sub={t.leitweg.sub} lede={<p>{t.leitweg.lede}</p>}>
        <LeitwegDemo />
      </Block>

      <Block id="pro" label={t.pro.label} title={t.pro.title} sub={t.pro.sub} lede={<p>{t.pro.lede}</p>}>
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-2">
            <p className="annotate">{t.pro.view}</p>
            {demo.view ? <OutputFrame html={demo.view} title={t.pro.viewTitle} height={1100} /> : <Missing />}
          </div>
          <details className="group">
            <summary className="annotate cursor-pointer underline underline-offset-2 hover:text-fg">{t.pro.viewDe}</summary>
            <div className="mt-3">
              {demo.viewDe ? <OutputFrame html={demo.viewDe} title={t.pro.viewDeTitle} height={1100} /> : <Missing />}
            </div>
          </details>
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="flex min-w-0 flex-col gap-6">
              {demo.cli ? <CodeBlock title={t.pro.cli} code={demo.cli.trimEnd()} /> : <Missing />}
              <CodeBlock title={t.pro.read} code={SUMMAND_READ_SNIPPET} />
            </div>
            <div className="flex min-w-0 flex-col gap-6">
              {demo.audit ? <CodeBlock title={t.pro.audit} code={demo.audit} /> : <Missing />}
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <p className="annotate">{t.pro.report}</p>
            {demo.report ? <OutputFrame html={demo.report} title={t.pro.reportTitle} height={640} /> : <Missing />}
          </div>
          <Link href={pkgPath("/summand")} className={btn + " self-start"}>
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
          <Link href={pkgPath("/summand/docs/getting-started")} className={btn + " control-primary"}>
            {t.closing.cta}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        }
      />
    </PageLayout>
  )
}
