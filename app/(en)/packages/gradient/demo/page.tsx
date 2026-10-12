import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import PageLayout from "@/components/PageLayout"
import { Block } from "@/components/site/Block"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import { PaletteStudio } from "@/components/packages/demo/gradient/PaletteStudio"
import { gradientDemo as t } from "@/lib/demo/gradient-copy"
import { pkgPath, pkgUrl } from "@/lib/packages/urls"

export const revalidate = 60

const CLI = `npx @sweberdev/gradient "#e30613" accent=#0a84ff --format tailwind --out app/gradient.css`

export function generateMetadata(): Metadata {
  const url = pkgUrl("/gradient/demo")
  return {
    title: { absolute: t.seoTitle },
    description: t.description,
    alternates: { canonical: url },
    openGraph: { title: t.seoTitle, description: t.description, url, type: "website" },
  }
}

export default function GradientDemoPage() {
  const btn = "control inline-flex items-center gap-1 py-2.5 pr-4 pl-5 text-sm"

  return (
    <PageLayout>
      <header className="sheet pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="flex flex-col items-start gap-8">
          <Link
            href={pkgPath("/gradient")}
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
        </div>
      </header>

      <PaletteStudio />

      <Block
        label={t.closing.label}
        title={t.closing.title}
        sub={t.closing.sub}
        lede={<p>{t.closing.lede}</p>}
        aside={
          <div className="flex flex-col items-start gap-5">
            <Link href={pkgPath("/gradient/docs")} className={btn + " control-primary"}>
              {t.docs}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        }
      >
        <CodeBlock code={CLI} label="CLI" />
      </Block>
    </PageLayout>
  )
}
