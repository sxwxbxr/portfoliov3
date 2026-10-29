import type { Metadata } from "next"
import Link from "next/link"
import PageLayout from "@/components/PageLayout"
import { SiteSearch } from "@/components/packages/SiteSearch"
import { pkgPath, pkgUrl } from "@/lib/packages/urls"

const title = "Search the packages, docs and blog"
const description =
  "Find answers in the documentation of all packages, the package pages and the release posts. Each result links to the page it comes from."

export const metadata: Metadata = {
  title: { absolute: `${title} | Weber Development` },
  description,
  alternates: { canonical: pkgUrl("/search") },
  robots: { index: false },
}

export default function SearchPage() {
  return (
    <PageLayout>
      <header className="sheet pt-10 pb-24 md:pt-16">
        <div className="flex flex-col items-start gap-8">
          <h1 className="display text-balance">
            Search<span className="headline-sub">packages, docs and blog.</span>
          </h1>
          <div className="flex max-w-2xl flex-col gap-4">
            <p className="text-lg leading-relaxed text-fg-muted">
              Ask in your own words, for example “how do I validate an XRechnung” or “withdrawal button”. Every result shows
              the passage it found and links to its page.
            </p>
            <p className="text-sm leading-relaxed text-fg-muted">
              This is <Link href={pkgPath("/cosine")} className="underline underline-offset-2 hover:text-fg">
                Cosine
              </Link>, our own
              search package, running in your browser. Your queries are not sent anywhere.
            </p>
          </div>
          <div className="w-full max-w-2xl">
            <SiteSearch />
          </div>
        </div>
      </header>
    </PageLayout>
  )
}
