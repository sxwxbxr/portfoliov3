import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, ChevronRight } from "lucide-react"
import PageLayout from "@/components/PageLayout"
import { Block } from "@/components/site/Block"
import { ProseMarkdown } from "@/components/ProseMarkdown"
import { JsonLd } from "@/components/JsonLd"
import { PricingBlock } from "@/components/packages/PricingBlock"
import { bundlePackages, getBundle, getBundles, type Bundle } from "@/lib/packages/bundles"
import { pkgPath, pkgUrl } from "@/lib/packages/urls"
import { copy } from "@/lib/copy"

export const revalidate = 60

export function generateStaticParams() {
  return getBundles().map((b) => ({ slug: b.slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const bundle = getBundle(slug)
  if (!bundle) return {}
  const title = bundle.seoTitle ?? bundle.name
  const url = pkgUrl(`/bundles/${bundle.slug}`)
  return {
    title: { absolute: title },
    description: bundle.tagline,
    alternates: { canonical: url },
    openGraph: { title, description: bundle.tagline, url, type: "website" },
  }
}

function structuredData(bundle: Bundle) {
  const base = {
    "@type": "Offer",
    priceCurrency: bundle.pricing.currency,
    url: pkgUrl(`/bundles/${bundle.slug}#pricing`),
    availability:
      bundle.pro.availability === "available"
        ? "https://schema.org/InStock"
        : "https://schema.org/PreOrder",
  }
  const offers = bundle.pricing.tiers.flatMap((tier) => [
    ...(tier.monthly !== undefined ? [{ ...base, name: `${tier.name} (monthly)`, price: tier.monthly }] : []),
    ...(tier.yearly !== undefined ? [{ ...base, name: `${tier.name} (yearly)`, price: tier.yearly }] : []),
    ...(tier.oneTime !== undefined ? [{ ...base, name: `${tier.name} (one-time)`, price: tier.oneTime }] : []),
  ])
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: bundle.name,
    description: bundle.tagline,
    url: pkgUrl(`/bundles/${bundle.slug}`),
    brand: { "@type": "Person", name: "Seya Weber", url: "https://sweber.dev" },
    offers,
  }
}

export default async function BundlePage({ params }: Props) {
  const { slug } = await params
  const bundle = getBundle(slug)
  if (!bundle) notFound()

  const packages = bundlePackages(bundle)
  const s = copy.packages.bundle

  return (
    <PageLayout>
      <JsonLd data={structuredData(bundle)} />

      <header className="sheet pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="flex flex-col items-start gap-8">
          <Link
            href={pkgPath("/")}
            className="annotate inline-flex items-center gap-1.5 transition-colors duration-150 hover:text-fg"
          >
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.packages.backToOverview}
          </Link>
          <div className="flex flex-col items-start gap-5">
            <span className="tab text-xs text-fg-muted">{s.badge}</span>
            <h1 className="display text-balance">
              {bundle.name}
              <span className="headline-sub">{bundle.tagline}</span>
            </h1>
          </div>
          <a
            href="#pricing"
            className="control control-primary inline-flex items-center gap-1 py-2.5 pr-4 pl-5 text-sm"
          >
            {s.seePricing}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </header>

      <section className="sheet pb-16 md:pb-24">
        <ProseMarkdown>{bundle.description}</ProseMarkdown>
      </section>

      <Block label={s.included.label} title={s.included.title} sub={s.included.sub}>
        <ul className="grid gap-3 md:grid-cols-3">
          {packages.map((pkg) => (
            <li key={pkg.slug} className="cast card-link relative flex flex-col gap-4 p-6 md:p-7">
              <div className="flex flex-col gap-1.5">
                <h3 className="text-lg tracking-tight">
                  <Link
                    href={pkgPath(`/${pkg.slug}`)}
                    className="after:absolute after:inset-0 after:content-['']"
                  >
                    {pkg.pro?.name ?? pkg.name}
                  </Link>
                </h3>
                <p className="text-sm leading-relaxed text-fg-muted">{pkg.tagline}</p>
              </div>
              {pkg.pro && pkg.pro.packages.length > 0 && (
                <ul className="mt-auto flex flex-col gap-1.5">
                  {pkg.pro.packages.map((p) => (
                    <li key={p.name}>
                      <code className="break-all font-mono text-xs text-fg-muted">{p.name}</code>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </Block>

      {bundle.upcoming.length > 0 && (
        <Block label={s.upcoming.label} title={s.upcoming.title} sub={s.upcoming.sub}>
          <ul className="grid gap-3 md:grid-cols-2">
            {bundle.upcoming.map((u) => (
              <li key={u.name} className="well flex flex-col gap-2 p-6">
                <h3 className="text-base tracking-tight text-fg">{u.name}</h3>
                <p className="text-sm leading-relaxed text-fg-muted">{u.description}</p>
              </li>
            ))}
          </ul>
        </Block>
      )}

      <Block id="pricing" label={s.pricing.label} title={s.pricing.title} sub={s.pricing.sub}>
        <PricingBlock pkg={bundle} />
      </Block>

      {bundle.faq.length > 0 && (
        <Block label={copy.packages.sections.faq.label} title={copy.packages.sections.faq.title} sub={copy.packages.sections.faq.sub}>
          <div className="border-t border-edge-soft">
            {bundle.faq.map((item) => (
              <details key={item.q} className="group border-b border-edge-soft py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-fg [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <span
                    aria-hidden="true"
                    className="text-fg-subtle transition-transform duration-150 group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <p className="measure mt-3 leading-relaxed text-fg-muted">{item.a}</p>
              </details>
            ))}
          </div>
        </Block>
      )}
    </PageLayout>
  )
}
