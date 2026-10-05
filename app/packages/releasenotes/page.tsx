import type { Metadata } from "next"
import Link from "next/link"
import { Rss } from "lucide-react"
import PageLayout, { Section } from "@/components/PageLayout"
import { getReleaseNotes } from "@/lib/blog"
import { getPackages } from "@/lib/packages"
import { pkgPath, pkgUrl } from "@/lib/packages/urls"
import { copy } from "@/lib/copy"
import { PostCard } from "../blog/PostCard"

export const revalidate = 60

const PAGE_SIZE = 10

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

type Search = { package?: string; page?: string }

/** Link to the list with the given filters; page resets whenever the package changes. */
function listHref(f: { package?: string; page?: number }) {
  const q = new URLSearchParams()
  if (f.package) q.set("package", f.package)
  if (f.page && f.page > 1) q.set("page", String(f.page))
  const s = q.toString()
  return pkgPath("/releasenotes") + (s ? `?${s}` : "")
}

function Chip({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`${active ? "control control-primary" : "control"} inline-flex items-center px-3 py-1.5 text-xs`}
    >
      {children}
    </Link>
  )
}

export default async function ReleaseNotesIndex({
  searchParams,
}: {
  searchParams: Promise<Search>
}) {
  const sp = await searchParams
  const packages = getPackages()
  const pkg = packages.some((p) => p.slug === sp.package) ? sp.package : undefined

  const all = await getReleaseNotes({ package: pkg })
  const pages = Math.max(1, Math.ceil(all.length / PAGE_SIZE))
  const page = Math.min(Math.max(1, parseInt(sp.page ?? "1", 10) || 1), pages)
  const posts = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <PageLayout
      title={copy.releaseNotes.title}
      subtitle={copy.releaseNotes.subtitle}
      label={copy.releaseNotes.label}
    >
      <div className="sheet flex flex-col gap-10 pb-24 md:pb-32">
        <Section className="flex flex-col gap-4">
          {packages.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="annotate mr-1">{copy.releaseNotes.filterPackage}</span>
              <Chip href={listHref({})} active={!pkg}>{copy.releaseNotes.all}</Chip>
              {packages.map((p) => (
                <Chip key={p.slug} href={listHref({ package: p.slug })} active={pkg === p.slug}>
                  {p.name}
                </Chip>
              ))}
            </div>
          )}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <a
              href={pkgPath("/releasenotes/feed.xml")}
              className="annotate inline-flex items-center gap-1.5 transition-colors duration-150 hover:text-fg"
            >
              <Rss className="h-3.5 w-3.5" aria-hidden="true" />
              {copy.releaseNotes.rss}
            </a>
            <Link
              href={pkgPath("/blog")}
              className="annotate transition-colors duration-150 hover:text-fg"
            >
              {copy.releaseNotes.articlesLink} →
            </Link>
          </div>
        </Section>

        {posts.length === 0 ? (
          <p className="text-fg-muted">{copy.releaseNotes.empty}</p>
        ) : (
          <div className="flex flex-col border-t border-edge-soft">
            {posts.map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        )}

        {pages > 1 && (
          <nav className="flex items-center justify-between gap-4" aria-label="Pagination">
            {page > 1 ? (
              <Link className="control px-4 py-2.5 text-sm" href={listHref({ package: pkg, page: page - 1 })}>
                {copy.releaseNotes.previous}
              </Link>
            ) : (
              <span />
            )}
            <span className="annotate">{copy.releaseNotes.pageOf(page, pages)}</span>
            {page < pages ? (
              <Link className="control px-4 py-2.5 text-sm" href={listHref({ package: pkg, page: page + 1 })}>
                {copy.releaseNotes.next}
              </Link>
            ) : (
              <span />
            )}
          </nav>
        )}
      </div>
    </PageLayout>
  )
}
