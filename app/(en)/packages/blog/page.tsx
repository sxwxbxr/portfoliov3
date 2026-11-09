import type { Metadata } from "next"
import { Rss } from "lucide-react"
import PageLayout from "@/components/PageLayout"
import { PostIndex } from "@/components/packages/PostIndex"
import { blog } from "@/lib/blog"
import { getPackages } from "@/lib/packages"
import { pkgPath, pkgUrl } from "@/lib/packages/urls"
import { copy } from "@/lib/copy"
import { cardData } from "./PostCard"

export const revalidate = 86400

/** Release notes have their own page (/releasenotes). */
const TYPES = ["news", "tutorial"] as const

export const metadata: Metadata = {
  title: copy.pkgBlog.title,
  description: copy.pkgBlog.subtitle,
  alternates: {
    canonical: pkgUrl("/blog"),
    types: { "application/rss+xml": pkgUrl("/blog/feed.xml") },
  },
  openGraph: { title: copy.pkgBlog.title, description: copy.pkgBlog.subtitle, url: pkgUrl("/blog") },
}

export default async function BlogIndex() {
  // Static: the filters and the pager live in <PostIndex>, which reads the query string in the browser.
  const posts = (await blog.getPosts()).filter((p) => p.type !== "release")
  const t = copy.pkgBlog

  return (
    <PageLayout title={t.title} subtitle={t.subtitle} label={t.label}>
      <div className="sheet flex flex-col gap-10 pb-24 md:pb-32">
        <PostIndex
          posts={posts.map((p) => ({ ...cardData(p), slug: p.slug, type: p.type, packages: p.packages }))}
          packages={getPackages().map((p) => ({ slug: p.slug, name: p.name }))}
          base={pkgPath("/blog")}
          types={TYPES.map((value) => ({ value, label: t.types[value] }))}
          releaseRedirect={pkgPath("/releasenotes")}
          labels={{
            filterType: t.filterType,
            allArticles: t.allArticles,
            extraLink: { href: pkgPath("/releasenotes"), label: t.releaseNotesLink },
            filterPackage: t.filterPackage,
            all: t.all,
            empty: t.empty,
            previous: t.previous,
            next: t.next,
            pageOf: t.pageOf("{page}" as unknown as number, "{total}" as unknown as number),
          }}
        >
          <a
            href={pkgPath("/blog/feed.xml")}
            className="annotate inline-flex items-center gap-1.5 self-start transition-colors duration-150 hover:text-fg"
          >
            <Rss className="h-3.5 w-3.5" aria-hidden="true" />
            {t.rss}
          </a>
        </PostIndex>
      </div>
    </PageLayout>
  )
}
