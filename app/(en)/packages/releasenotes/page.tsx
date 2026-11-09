import type { Metadata } from "next"
import Link from "next/link"
import { Rss } from "lucide-react"
import PageLayout from "@/components/PageLayout"
import { PostIndex } from "@/components/packages/PostIndex"
import { getReleaseNotes } from "@/lib/blog"
import { getPackages } from "@/lib/packages"
import { pkgPath, pkgUrl } from "@/lib/packages/urls"
import { copy } from "@/lib/copy"
import { cardData } from "../blog/PostCard"

export const revalidate = 86400

export const metadata: Metadata = {
  title: copy.releaseNotes.title,
  description: copy.releaseNotes.subtitle,
  alternates: {
    canonical: pkgUrl("/releasenotes"),
    types: { "application/rss+xml": pkgUrl("/releasenotes/feed.xml") },
  },
  openGraph: {
    title: copy.releaseNotes.title,
    description: copy.releaseNotes.subtitle,
    url: pkgUrl("/releasenotes"),
  },
}

export default async function ReleaseNotesIndex() {
  // Static: the filter and the pager live in <PostIndex>, which reads the query string in the browser.
  const posts = await getReleaseNotes()
  const t = copy.releaseNotes

  return (
    <PageLayout title={t.title} subtitle={t.subtitle} label={t.label}>
      <div className="sheet flex flex-col gap-10 pb-24 md:pb-32">
        <PostIndex
          posts={posts.map((p) => ({ ...cardData(p), slug: p.slug, type: p.type, packages: p.packages }))}
          packages={getPackages().map((p) => ({ slug: p.slug, name: p.name }))}
          base={pkgPath("/releasenotes")}
          labels={{
            filterPackage: t.filterPackage,
            all: t.all,
            empty: t.empty,
            previous: t.previous,
            next: t.next,
            pageOf: t.pageOf("{page}" as unknown as number, "{total}" as unknown as number),
          }}
        >
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href={pkgPath("/releasenotes/feed.xml")}
              className="annotate inline-flex items-center gap-1.5 transition-colors duration-150 hover:text-fg"
            >
              <Rss className="h-3.5 w-3.5" aria-hidden="true" />
              {t.rss}
            </a>
            <Link href={pkgPath("/blog")} className="annotate transition-colors duration-150 hover:text-fg">
              {t.articlesLink} →
            </Link>
          </div>
        </PostIndex>
      </div>
    </PageLayout>
  )
}
