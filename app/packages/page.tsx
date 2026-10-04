import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import PageLayout, { Section } from "@/components/PageLayout"
import { PackageBadges } from "@/components/packages/Badges"
import { getPackages } from "@/lib/packages"
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
  const link = "relative z-10 text-sm text-fg-muted transition-colors duration-150 hover:text-fg"

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
        <Section className="grid gap-3 sm:grid-cols-2">
          {packages.map((pkg) => (
            <article key={pkg.slug} className="cast card-link relative flex flex-col gap-5 p-6 md:p-7">
              <PackageBadges pkg={pkg} />

              <div className="flex flex-col gap-1.5">
                <h2 className="text-lg tracking-tight">
                  {/* Stretched link: the whole card opens the detail page while
                      the Docs, GitHub and Pricing links stay separate anchors. */}
                  <Link
                    href={pkgPath(`/${pkg.slug}`)}
                    className="after:absolute after:inset-0 after:content-['']"
                  >
                    {pkg.name}
                  </Link>
                </h2>
                <p className="text-sm leading-relaxed text-fg-muted">{pkg.tagline}</p>
              </div>

              {pkg.tags.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {pkg.tags.map((tag) => (
                    <li key={tag} className="tab text-xs text-fg-muted">
                      {tag}
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-auto flex flex-wrap gap-x-5 gap-y-2 pt-2">
                {pkg.links.docs && (
                  <a href={pkg.links.docs} target="_blank" rel="noopener noreferrer" className={link}>
                    {copy.packages.docs}
                  </a>
                )}
                {pkg.links.github && (
                  <a href={pkg.links.github} target="_blank" rel="noopener noreferrer" className={link}>
                    {copy.packages.github}
                  </a>
                )}
                {pkg.pricing && (
                  <Link href={pkgPath(`/${pkg.slug}#pricing`)} className={link}>
                    {copy.packages.pricing}
                  </Link>
                )}
              </div>
            </article>
          ))}
        </Section>
      </section>
    </PageLayout>
  )
}
