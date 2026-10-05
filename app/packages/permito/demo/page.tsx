import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ChevronRight } from "lucide-react"
import PageLayout from "@/components/PageLayout"
import { Block } from "@/components/site/Block"
import { CoreDemo } from "@/components/packages/demo/CoreDemo"
import { ConsentLogSection } from "@/components/packages/demo/ConsentLogSection"
import { CookieTableSection } from "@/components/packages/demo/CookieTableSection"
import { ScannerSection } from "@/components/packages/demo/ScannerSection"
import { ServiceCatalog } from "@/components/packages/demo/ServiceCatalog"
import { ThemeDemo } from "@/components/packages/demo/ThemeDemo"
import { getCatalogView } from "@/lib/demo/permito-server"
import { pkgPath, pkgUrl } from "@/lib/packages/urls"
import { copy } from "@/lib/copy"

export const revalidate = 60

const t = copy.packages.demo

export function generateMetadata(): Metadata {
  const url = pkgUrl("/permito/demo")
  return {
    title: { absolute: t.seoTitle },
    description: t.description,
    alternates: { canonical: url },
    openGraph: { title: t.seoTitle, description: t.description, url, type: "website" },
  }
}

export default function PermitoDemoPage() {
  const { total, featured } = getCatalogView()
  const btn = "control inline-flex items-center gap-1 py-2.5 pr-4 pl-5 text-sm"
  const pricingHref = `${pkgPath("/permito")}#pricing`

  return (
    <PageLayout>
      <header className="sheet pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="flex flex-col items-start gap-8">
          <Link
            href={pkgPath("/permito")}
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

      <Block id="core" label={t.core.label} title={t.core.title} sub={t.core.sub} lede={<p>{t.core.lede}</p>}>
        <CoreDemo />
      </Block>

      <Block id="themes" label={t.themes.label} title={t.themes.title} sub={t.themes.sub} lede={<p>{t.themes.lede}</p>}>
        <ThemeDemo />
      </Block>

      <Block
        id="catalog"
        label={t.catalog.label}
        title={t.catalog.title}
        sub={t.catalog.sub}
        lede={<p>{t.catalog.lede(total, featured.length)}</p>}
      >
        <ServiceCatalog />
      </Block>

      <Block
        id="cookie-table"
        label={t.table.label}
        title={t.table.title}
        sub={t.table.sub}
        lede={<p>{t.table.lede}</p>}
      >
        <CookieTableSection />
      </Block>

      <Block
        id="scanner"
        label={t.scanner.label}
        title={t.scanner.title}
        sub={t.scanner.sub}
        lede={<p>{t.scanner.lede}</p>}
      >
        <ScannerSection />
      </Block>

      <Block id="log" label={t.log.label} title={t.log.title} sub={t.log.sub} lede={<p>{t.log.lede}</p>}>
        <ConsentLogSection />
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
