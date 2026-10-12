import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import PageLayout from "@/components/PageLayout"
import { Block } from "@/components/site/Block"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import { AppPreview } from "@/components/packages/demo/derivative/AppPreview"
import { Playground } from "@/components/packages/demo/derivative/Playground"
import { getDerivativeDemo } from "@/lib/demo/derivative-server"
import { DERIVATIVE_BUILD_COMMAND, DERIVATIVE_EMBED } from "@/lib/demo/derivative-snippets"
import { pkgPath, pkgUrl } from "@/lib/packages/urls"
import { derivativeDemoCopy } from "@/lib/demo/derivative-copy"

export const revalidate = 60

const t = derivativeDemoCopy

export function generateMetadata(): Metadata {
  const url = pkgUrl("/derivative/demo")
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

export default function DerivativeDemoPage() {
  const demo = getDerivativeDemo()
  const btn = "control inline-flex items-center gap-1 py-2.5 pr-4 pl-5 text-sm"

  return (
    <PageLayout>
      <header className="sheet pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="flex flex-col items-start gap-8">
          <Link
            href={pkgPath("/derivative")}
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
            <Link href={pkgPath("/derivative/docs")} className={btn + " control-primary"}>
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

      <Block id="widget" label={t.widget.label} title={t.widget.title} sub={t.widget.sub} lede={<p>{t.widget.lede}</p>}>
        {demo.feed ? <AppPreview feed={demo.feed} /> : <Missing />}
      </Block>

      <Block id="build" label={t.build.label} title={t.build.title} sub={t.build.sub} lede={<p>{t.build.lede}</p>}>
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="flex min-w-0 flex-col gap-10">
            {demo.changelog ? <CodeBlock title="CHANGELOG.md" code={demo.changelog} /> : <Missing />}
            {demo.config && <CodeBlock title="derivative.config.json" code={demo.config} />}
          </div>
          <div className="flex min-w-0 flex-col gap-10">
            <CodeBlock title={t.build.command} code={DERIVATIVE_BUILD_COMMAND} />
            {demo.feed ? (
              <CodeBlock title="public/changelog.json" code={JSON.stringify(demo.feed, null, 2)} />
            ) : (
              <Missing />
            )}
            <CodeBlock title={t.build.embed} code={DERIVATIVE_EMBED} />
          </div>
        </div>
      </Block>

      <Block
        id="playground"
        label={t.playground.label}
        title={t.playground.title}
        sub={t.playground.sub}
        lede={<p>{t.playground.lede}</p>}
      >
        <Playground />
      </Block>

      <Block label={t.closing.label} title={t.closing.title} sub={t.closing.sub} lede={<p>{t.closing.lede}</p>}>
        <div className="flex flex-wrap gap-3">
          <Link href={pkgPath("/derivative/docs/getting-started")} className={btn + " control-primary"}>
            {t.closing.cta}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </Block>
    </PageLayout>
  )
}
