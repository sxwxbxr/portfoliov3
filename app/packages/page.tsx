import type { Metadata } from "next"
import { Suspense } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import PageLayout, { Section } from "@/components/PageLayout"
import { PackageBrowser, PackageGrid, type PackageCardData } from "@/components/packages/PackageBrowser"
import { getPackages } from "@/lib/packages"
import { getBundles } from "@/lib/packages/bundles"
import { pkgPath, pkgUrl } from "@/lib/packages/urls"
import { copy } from "@/lib/copy"

export const revalidate = 60

export const metadata: Metadata = {
  title: "Packages",
  description: copy.packages.overviewDescription,
  alternates: { canonical: pkgUrl("/") },
  openGraph: {
    title: "Packages | Seya Weber",
    description: copy.packages.overviewDescription,
    url: pkgUrl("/"),
    type: "website",
  },
}

export default function PackagesOverview() {
  const packages = getPackages()
  const bundles = getBundles()
  const cards: PackageCardData[] = packages.map((p) => ({
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    tags: p.tags,
    npm: p.npm,
    status: p.status,
    license: p.license,
    hasDocs: !!p.docs,
    docsUrl: p.links.docs,
    githubUrl: p.links.github,
    hasPricing: !!p.pricing,
  }))

  return (
    <PageLayout>
      <header className="sheet pt-10 pb-16 md:pt-16 md:pb-24">
        <div className="flex flex-col items-start gap-6">
          <h1 className="display text-balance">
            Packages
            <span className="headline-sub">{copy.packages.overviewTitle}</span>
          </h1>
          <p className="lede measure">{copy.packages.overviewSubtitle}</p>
          <a href="#packages" className="control control-primary inline-flex items-center gap-1 py-2.5 pr-4 pl-5 text-sm">
            {copy.packages.browse}
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        </div>
      </header>

      <section id="packages" className="sheet pb-24 md:pb-32" style={{ scrollMarginTop: "6rem" }}>
        {/* Every card is in the server HTML (fallback); the browser adds search and filters. */}
        <Suspense fallback={<PackageGrid packages={cards} />}>
          <PackageBrowser packages={cards} />
        </Suspense>
      </section>

      {bundles.length > 0 && (
        <section id="bundles" className="sheet pb-24 md:pb-32" style={{ scrollMarginTop: "6rem" }}>
          <div className="mb-8 flex flex-col gap-1">
            <h2 className="text-2xl tracking-tight">{copy.packages.bundle.overviewHeading}</h2>
            <p className="text-fg-muted">{copy.packages.bundle.overviewSub}</p>
          </div>
          <Section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {bundles.map((b) => (
              <article key={b.slug} className="cast card-link relative flex flex-col gap-5 p-6 md:p-7">
                <span className="tab w-fit text-xs text-fg-muted">{copy.packages.bundle.badge}</span>
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-lg tracking-tight">
                    <Link
                      href={pkgPath(`/bundles/${b.slug}`)}
                      className="after:absolute after:inset-0 after:content-['']"
                    >
                      {b.name}
                    </Link>
                  </h3>
                  <p className="text-sm leading-relaxed text-fg-muted">{b.tagline}</p>
                </div>
                <ul className="flex flex-wrap gap-2">
                  {b.includes.map((slug) => (
                    <li key={slug} className="tab text-xs text-fg-muted">
                      {packages.find((p) => p.slug === slug)?.name ?? slug}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </Section>
        </section>
      )}
    </PageLayout>
  )
}
