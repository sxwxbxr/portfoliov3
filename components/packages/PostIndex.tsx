"use client"

import { Suspense, useEffect, type ReactNode } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { PostCardView } from "./PostCardView"
import { filterIndex, type IndexPost } from "./postIndexFilter"

type Option = { value: string; label: string }

type Labels = {
  filterPackage: string
  all: string
  empty: string
  previous: string
  next: string
  /** "Page {page} of {total}" */
  pageOf: string
  /** Blog only: the type row. */
  filterType?: string
  allArticles?: string
  /** Blog only: link to the release notes, which keeps the package filter. */
  extraLink?: { href: string; label: string }
}

type Props = {
  /** Every post of this list, newest first. Filtering and paging happen in the browser, so the page itself stays static. */
  posts: IndexPost[]
  packages: { slug: string; name: string }[]
  /** pkgPath("/blog") or pkgPath("/releasenotes") */
  base: string
  /** Blog only: the type chips. */
  types?: Option[]
  labels: Labels
  /** Blog only: old links used ?type=release; release notes have their own page. */
  releaseRedirect?: string
  /** Rendered after the filter rows (feed links). */
  children?: ReactNode
}

function href(base: string, f: { pkg?: string; type?: string; page?: number }) {
  const q = new URLSearchParams()
  if (f.pkg) q.set("package", f.pkg)
  if (f.type) q.set("type", f.type)
  if (f.page && f.page > 1) q.set("page", String(f.page))
  const s = q.toString()
  return base + (s ? `?${s}` : "")
}

function Chip({ href, active, children }: { href: string; active: boolean; children: ReactNode }) {
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

function View({
  props,
  pkg,
  type,
  pagePosts,
  pages,
  page,
}: {
  props: Props
  pkg?: string
  type?: string
  pagePosts: IndexPost[]
  pages: number
  page: number
}) {
  const { packages, base, types, labels, children } = props
  return (
    <>
      <div className="flex flex-col gap-4">
        {types && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="annotate mr-1">{labels.filterType}</span>
            <Chip href={href(base, { pkg })} active={!type}>{labels.allArticles}</Chip>
            {types.map((t) => (
              <Chip key={t.value} href={href(base, { pkg, type: t.value })} active={type === t.value}>
                {t.label}
              </Chip>
            ))}
            {labels.extraLink && (
              <Link
                href={labels.extraLink.href + (pkg ? `?package=${pkg}` : "")}
                className="annotate ml-1 transition-colors duration-150 hover:text-fg"
              >
                {labels.extraLink.label} →
              </Link>
            )}
          </div>
        )}
        {packages.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="annotate mr-1">{labels.filterPackage}</span>
            <Chip href={href(base, { type })} active={!pkg}>{labels.all}</Chip>
            {packages.map((p) => (
              <Chip key={p.slug} href={href(base, { pkg: p.slug, type })} active={pkg === p.slug}>
                {p.name}
              </Chip>
            ))}
          </div>
        )}
        {children}
      </div>

      {pagePosts.length === 0 ? (
        <p className="text-fg-muted">{labels.empty}</p>
      ) : (
        <div className="flex flex-col border-t border-edge-soft">
          {pagePosts.map((p) => (
            <PostCardView key={p.slug} {...p} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <nav className="flex items-center justify-between gap-4" aria-label="Pagination">
          {page > 1 ? (
            <Link className="control px-4 py-2.5 text-sm" href={href(base, { pkg, type, page: page - 1 })}>
              {labels.previous}
            </Link>
          ) : (
            <span />
          )}
          <span className="annotate">
            {labels.pageOf.replace("{page}", String(page)).replace("{total}", String(pages))}
          </span>
          {page < pages ? (
            <Link className="control px-4 py-2.5 text-sm" href={href(base, { pkg, type, page: page + 1 })}>
              {labels.next}
            </Link>
          ) : (
            <span />
          )}
        </nav>
      )}
    </>
  )
}

function Filtered(props: Props) {
  const sp = useSearchParams()
  const router = useRouter()
  const pkg = props.packages.find((p) => p.slug === sp.get("package"))?.slug
  const type = props.types?.find((t) => t.value === sp.get("type"))?.value
  const wantsRelease = props.releaseRedirect !== undefined && sp.get("type") === "release"

  useEffect(() => {
    if (wantsRelease) router.replace(props.releaseRedirect + (pkg ? `?package=${pkg}` : ""))
  }, [wantsRelease, pkg, props.releaseRedirect, router])

  const result = filterIndex(props.posts, { pkg, type, page: parseInt(sp.get("page") ?? "1", 10) })
  return <View props={props} pkg={pkg} type={type} {...result} />
}

/**
 * The filter chips, the posts and the pager. The static HTML holds the unfiltered first page (the
 * Suspense fallback); in the browser the query string narrows it. A server-side `searchParams`
 * would make the whole route dynamic, so every crawler hit on a filter URL ran a function.
 */
export function PostIndex(props: Props) {
  const first = filterIndex(props.posts, {})
  return (
    <Suspense fallback={<View props={props} {...first} />}>
      <Filtered {...props} />
    </Suspense>
  )
}
