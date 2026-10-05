import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import PageLayout from "@/components/PageLayout"
import { Block } from "@/components/site/Block"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import { LicenseLab } from "@/components/packages/demo/integral/LicenseLab"
import { integralDemo as t } from "@/lib/demo/integral-copy"
import { pkgPath, pkgUrl } from "@/lib/packages/urls"

export const revalidate = 60

const VERIFY = `import { createEntitlements, verifyLicense } from "@sweberdev/integral"

const result = await verifyLicense(license, { publicKey: INTEGRAL_PUBLIC_KEY, product: "my-app" })
const entitlements = createEntitlements({ plans, license: result.valid ? result.license : null })

entitlements.has("export")`

export function generateMetadata(): Metadata {
  const url = pkgUrl("/integral/demo")
  return {
    title: { absolute: t.seoTitle },
    description: t.description,
    alternates: { canonical: url },
    openGraph: { title: t.seoTitle, description: t.description, url, type: "website" },
  }
}

export default function IntegralDemoPage() {
  const btn = "control inline-flex items-center gap-1 py-2.5 pr-4 pl-5 text-sm"

  return (
    <PageLayout>
      <header className="sheet pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="flex flex-col items-start gap-8">
          <Link
            href={pkgPath("/integral")}
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

      <LicenseLab />

      <Block
        label="Code"
        title="Three lines in your app"
        sub="Offline, no server, no dependencies."
        aside={
          <div className="flex flex-wrap items-start gap-3">
            <Link href={pkgPath("/integral/docs")} className={btn + " control-primary"}>
              {t.docs}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <Link href={pkgPath("/integral/docs/pro/overview")} className={btn}>
              {t.pro.proLink}
              <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        }
      >
        <CodeBlock code={VERIFY} label="TypeScript" />
      </Block>
    </PageLayout>
  )
}
