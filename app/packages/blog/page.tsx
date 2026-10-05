import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { Rss } from "lucide-react"
import PageLayout, { Section } from "@/components/PageLayout"
import { blog } from "@/lib/blog"
import type { PostType } from "@/lib/blog/types"
import { getPackages } from "@/lib/packages"
import { pkgPath, pkgUrl } from "@/lib/packages/urls"
import { copy } from "@/lib/copy"
import { PostCard } from "./PostCard"

export const revalidate = 60

const PAGE_SIZE = 10
/** Release notes have their own page (/releasenotes). */
const TYPES: PostType[] = ["news", "tutorial"]

export const metadata: Metadata = {
  title: copy.pkgBlog.title,
  description: copy.pkgBlog.subtitle,
  alternates: {
    canonical: pkgUrl("/blog"),
    types: { "application/rss+xml": pkgUrl("/blog/feed.xml") },
  },
  openGraph: { title: copy.pkgBlog.title, description: copy.pkgBlog.subtitle, url: pkgUrl("/blog") },
}

type Search = { package?: string; type?: string; page?: string }

/** Link to the list with the given filters; page resets whenever a filter changes. */
function listHref(f: { package?: string; type?: string; page?: number }) {
  const q = new URLSearchParams()
  if (f.package) q.set("package", f.package)
  if (f.type) q.set("type", f.type)
  if (f.page && f.page > 1) q.set("page", String(f.page))
  const s = q.toString()
  return pkgPath("/blog") + (s ? `?${s}` : "")
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

export default async function BlogIndex({
  searchParams,
}: {
  searchParams: Promise<Search>
}) {
  const sp = await searchParams
  const packages = getPackages()
  const pkg = packages.some((p) => p.slug === sp.package) ? sp.package : undefined
  if (sp.type === "release") {
    redirect(pkgPath("/releasenotes") + (pkg ? `?package=${pkg}` : ""))
  }
  const type = TYPES.find((t) => t === sp.type)

  const all = type
    ? await blog.getPosts({ package: pkg, type })
    : (await blog.getPosts({ package: pkg })).filter((p) => p.type !== "release")
  const pages = Math.max(1, Math.ceil(all.length / PAGE_SIZE))
  const page = Math.min(Math.max(1, parseInt(sp.page ?? "1", 10) || 1), pages)
  const posts = all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <PageLayout title={copy.pkgBlog.title} subtitle={copy.pkgBlog.subtitle} label={copy.pkgBlog.label}>
      <div className="sheet flex flex-col gap-10 pb-24 md:pb-32">
        <Section className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="annotate mr-1">{copy.pkgBlog.filterType}</span>
            <Chip href={listHref({ package: pkg })} active={!type}>{copy.pkgBlog.allArticles}</Chip>
            {TYPES.map((t) => (
              <Chip key={t} href={listHref({ package: pkg, type: t })} active={type === t}>
                {copy.pkgBlog.types[t]}
              </Chip>
            ))}
            <Link
              href={pkgPath("/releasenotes") + (pkg ? `?package=${pkg}` : "")}
              className="annotate ml-1 transition-colors duration-150 hover:text-fg"
            >
              {copy.pkgBlog.releaseNotesLink} →
            </Link>
          </div>
          {packages.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="annotate mr-1">{copy.pkgBlog.filterPackage}</span>
              <Chip href={listHref({ type })} active={!pkg}>{copy.pkgBlog.all}</Chip>
              {packages.map((p) => (
                <Chip key={p.slug} href={listHref({ package: p.slug, type })} active={pkg === p.slug}>
                  {p.name}
                </Chip>
              ))}
            </div>
          )}
          <a
            href={pkgPath("/blog/feed.xml")}
            className="annotate inline-flex items-center gap-1.5 self-start transition-colors duration-150 hover:text-fg"
          >
            <Rss className="h-3.5 w-3.5" aria-hidden="true" />
            {copy.pkgBlog.rss}
          </a>
        </Section>

        {posts.length === 0 ? (
          <p className="text-fg-muted">{copy.pkgBlog.empty}</p>
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
              <Link className="control px-4 py-2.5 text-sm" href={listHref({ package: pkg, type, page: page - 1 })}>
                {copy.pkgBlog.previous}
              </Link>
            ) : (
              <span />
            )}
            <span className="annotate">{copy.pkgBlog.pageOf(page, pages)}</span>
            {page < pages ? (
              <Link className="control px-4 py-2.5 text-sm" href={listHref({ package: pkg, type, page: page + 1 })}>
                {copy.pkgBlog.next}
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
