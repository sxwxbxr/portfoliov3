import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import PageLayout from "@/components/PageLayout"
import { Block } from "@/components/site/Block"
import { CurveEditor } from "@/components/packages/demo/sigmoid/CurveEditor"
import { InstallCommand } from "@/components/packages/InstallCommand"
import { sigmoidCurves as t } from "@/lib/demo/sigmoid-copy"
import { pkgPath, pkgUrl } from "@/lib/packages/urls"

export const revalidate = 60

export function generateMetadata(): Metadata {
  const url = pkgUrl("/sigmoid/curves")
  return {
    title: { absolute: t.seoTitle },
    description: t.description,
    alternates: { canonical: url },
    openGraph: { title: t.seoTitle, description: t.description, url, type: "website" },
  }
}

export default function SigmoidCurvesPage() {
  const btn = "control inline-flex items-center gap-1 py-2.5 pr-4 pl-5 text-sm"
  return (
    <PageLayout>
      <header className="sheet pt-10 pb-12 md:pt-16 md:pb-16">
        <div className="flex flex-col items-start gap-8">
          <Link
            href={pkgPath("/sigmoid")}
            className="annotate inline-flex items-center gap-1.5 transition-colors duration-150 hover:text-fg"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {t.overview}
          </Link>
          <h1 className="display text-balance">
            {t.title}
            <span className="headline-sub">{t.titleSub}</span>
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-fg-muted">{t.intro}</p>
        </div>
      </header>

      <Block label={t.editor.label} title={t.editor.title} sub={t.editor.sub} lede={<p>{t.editor.lede}</p>}>
        <CurveEditor />
      </Block>

      <Block
        label={t.closing.label}
        title={t.closing.title}
        sub={t.closing.sub}
        lede={<p>{t.closing.lede}</p>}
        aside={
          <div className="flex flex-col items-start gap-5">
            <InstallCommand command="pnpm add @sweberdev/sigmoid" packageSlug="sigmoid" />
            <Link href={pkgPath("/sigmoid/demo")} className={btn + " control-primary"}>
              {t.demo}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        }
      />
    </PageLayout>
  )
}
