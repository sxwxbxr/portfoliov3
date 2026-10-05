import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ChevronRight, Download } from "lucide-react"
import PageLayout from "@/components/PageLayout"
import { Block } from "@/components/site/Block"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import { CookieTableTabs } from "@/components/packages/demo/CookieTableTabs"
import { LiveCheck } from "@/components/packages/demo/surjection/LiveCheck"
import { OutputFrame } from "@/components/packages/demo/surjection/OutputFrame"
import { getSurjectionDemo } from "@/lib/demo/surjection-server"
import { SURJECTION_CHECK_COMMAND, SURJECTION_PRO_COMMANDS } from "@/lib/demo/snippets"
import { pkgPath, pkgUrl } from "@/lib/packages/urls"
import { copy } from "@/lib/copy"

export const revalidate = 60

const t = copy.packages.surjectionDemo

export function generateMetadata(): Metadata {
  const url = pkgUrl("/surjection/demo")
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

export default function SurjectionDemoPage() {
  const demo = getSurjectionDemo()
  const btn = "control inline-flex items-center gap-1 py-2.5 pr-4 pl-5 text-sm"
  const pricingHref = `${pkgPath("/surjection")}#pricing`

  return (
    <PageLayout>
      <header className="sheet pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="flex flex-col items-start gap-8">
          <Link
            href={pkgPath("/surjection")}
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
            <Link href={pricingHref} className={btn + " control-primary"}>
              {t.pricing}
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

      <Block id="check" label={t.check.label} title={t.check.title} sub={t.check.sub} lede={<p>{t.check.lede}</p>}>
        <div className="flex flex-col gap-12">
          <LiveCheck />
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <CodeBlock title={t.check.cliHeading} code={SURJECTION_CHECK_COMMAND} />
            {demo.markdown ? (
              <CodeBlock title={t.check.markdownHeading} code={demo.markdown} label="a11y.md" />
            ) : (
              <Missing />
            )}
          </div>
        </div>
      </Block>

      <Block
        id="statement"
        label={t.statement.label}
        title={t.statement.title}
        sub={t.statement.sub}
        lede={<p>{t.statement.lede}</p>}
      >
        {demo.statement ? (
          <div lang="de-CH">
            <CodeBlock title={t.statement.fileLabel} code={demo.statement} />
          </div>
        ) : (
          <Missing />
        )}
      </Block>

      <Block id="report" label={t.report.label} title={t.report.title} sub={t.report.sub} lede={<p>{t.report.lede}</p>}>
        <div className="flex flex-col gap-6">
          {demo.reportEn && demo.reportDe ? (
            <CookieTableTabs
              label={t.report.tabsLabel}
              tabs={[
                {
                  id: "en",
                  label: "English",
                  content: <OutputFrame html={demo.reportEn} title={t.report.frameTitle("English")} height={760} />,
                },
                {
                  id: "de",
                  label: "Deutsch",
                  lang: "de",
                  content: <OutputFrame html={demo.reportDe} title={t.report.frameTitle("Deutsch")} height={760} />,
                },
              ]}
            />
          ) : (
            <Missing />
          )}
          <div className="flex flex-wrap items-start gap-6">
            <a href="/demos/surjection/surjection-report-example.pdf" download className={btn}>
              <Download className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
              {t.report.pdf}
            </a>
          </div>
          <CodeBlock code={SURJECTION_PRO_COMMANDS} label="Pro commands" />
        </div>
      </Block>

      <Block id="history" label={t.history.label} title={t.history.title} sub={t.history.sub} lede={<p>{t.history.lede}</p>}>
        {demo.dashboard ? <OutputFrame html={demo.dashboard} title={t.history.frameTitle} height={480} /> : <Missing />}
      </Block>

      <Block
        id="checklist"
        label={t.checklist.label}
        title={t.checklist.title}
        sub={t.checklist.sub}
        lede={<p>{t.checklist.lede}</p>}
      >
        {demo.editor ? (
          <OutputFrame html={demo.editor} title={t.checklist.frameTitle} height={720} scripts />
        ) : (
          <Missing />
        )}
      </Block>

      <Block
        label={t.closing.label}
        title={t.closing.title}
        sub={t.closing.sub}
        lede={<p>{t.closing.lede}</p>}
        aside={
          <div className="flex flex-col items-start gap-5">
            <Link href={pricingHref} className={btn + " control-primary"}>
              {t.closing.cta}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <p className="annotate">{t.closing.disclaimer}</p>
          </div>
        }
      />
    </PageLayout>
  )
}
