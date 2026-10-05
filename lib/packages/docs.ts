import { cache } from "react"
import matter from "gray-matter"
import { posix } from "path"
import type { Package } from "./schema"
import { pkgPath } from "./urls"

/**
 * Package documentation, fetched from the package's own repository.
 *
 * The pages are Markdown with title/description frontmatter, the order comes
 * from <path>/nav.json. Everything here is server-only and fails soft: an
 * unreachable repository, a missing docs folder or a malformed file yields
 * null, never an exception, so a build never depends on GitHub being up.
 */

export type DocsConfig = NonNullable<Package["docs"]>

export interface DocsPage {
  /** Path below the docs folder without .md, e.g. "guides/nextjs". */
  path: string
  title: string
  description: string
}

export interface DocsSection {
  label: string
  pages: DocsPage[]
}

export interface DocsNav {
  sections: DocsSection[]
  /** Flat reading order, for previous/next. */
  pages: DocsPage[]
}

export interface DocsContent extends DocsPage {
  body: string
}

const PAGE_PATH = /^[a-z0-9-]+(\/[a-z0-9-]+)*$/
const TIMEOUT_MS = 8000

export const isValidDocsPath = (p: string) => PAGE_PATH.test(p) && !p.includes("..")

function rawUrl(docs: DocsConfig, file: string) {
  return `https://raw.githubusercontent.com/${docs.repo}/${docs.ref}/${docs.path}/${file}`
}

async function fetchText(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    return res.ok ? await res.text() : null
  } catch {
    return null
  }
}

function parsePage(path: string, raw: string): DocsContent | null {
  try {
    const { data, content } = matter(raw)
    const title = typeof data.title === "string" ? data.title : null
    if (!title) return null
    return {
      path,
      title,
      description: typeof data.description === "string" ? data.description : "",
      body: content.trim(),
    }
  } catch {
    return null
  }
}

async function loadPage(docs: DocsConfig, path: string): Promise<DocsContent | null> {
  if (!isValidDocsPath(path)) return null
  const raw = await fetchText(rawUrl(docs, `${path}.md`))
  return raw === null ? null : parsePage(path, raw)
}

/** nav.json plus the title and description of every page it lists. Null when nav.json is unavailable. */
export const getDocsNav = cache(
  async (repo: string, path: string, ref: string): Promise<DocsNav | null> => {
    const docs: DocsConfig = { repo, path, ref }
    const rawNav = await fetchText(rawUrl(docs, "nav.json"))
    if (rawNav === null) return null

    let listed: { label: string; items: string[] }[]
    try {
      const json = JSON.parse(rawNav) as { sections?: unknown }
      if (!Array.isArray(json.sections)) return null
      listed = json.sections.flatMap((s: unknown) => {
        const sec = s as { label?: unknown; items?: unknown }
        if (typeof sec?.label !== "string" || !Array.isArray(sec.items)) return []
        const items = sec.items.filter(
          (i): i is string => typeof i === "string" && isValidDocsPath(i)
        )
        return items.length > 0 ? [{ label: sec.label, items }] : []
      })
    } catch {
      return null
    }
    if (listed.length === 0) return null

    const sections = await Promise.all(
      listed.map(async (s) => ({
        label: s.label,
        pages: await Promise.all(
          s.items.map(async (item): Promise<DocsPage> => {
            const page = await loadPage(docs, item)
            return page
              ? { path: item, title: page.title, description: page.description }
              : { path: item, title: item.split("/").pop()!.replace(/-/g, " "), description: "" }
          })
        ),
      }))
    )
    return { sections, pages: sections.flatMap((s) => s.pages) }
  }
)

export const getDocsNavFor = (docs: DocsConfig) => getDocsNav(docs.repo, docs.path, docs.ref)

/** One page. Only paths listed in nav.json are fetched. */
export async function getDocsPage(docs: DocsConfig, path: string): Promise<DocsContent | null> {
  if (!isValidDocsPath(path)) return null
  const nav = await getDocsNavFor(docs)
  if (!nav?.pages.some((p) => p.path === path)) return null
  return loadPage(docs, path)
}

export function docsEditUrl(docs: DocsConfig, page: string) {
  return `https://github.com/${docs.repo}/edit/${docs.ref}/${docs.path}/${page}.md`
}

/** Site path of the docs index or of one page. */
export function docsPath(slug: string, page?: string) {
  return pkgPath(`/${slug}/docs${page ? `/${page}` : ""}`)
}

/**
 * Rewrites a link found in a docs page. Relative .md links become site paths,
 * anchors and external links stay as written.
 */
export function resolveDocsHref(href: string | undefined, current: string, slug: string) {
  if (!href || href.startsWith("#") || href.startsWith("//") || /^[a-z][a-z0-9+.-]*:/i.test(href))
    return href
  const [target, hash = ""] = href.split("#")
  const [file] = target.split("?")
  if (!file.endsWith(".md")) return href
  const resolved = posix.normalize(posix.join(posix.dirname(current), file.slice(0, -3)))
  if (resolved.startsWith("..") || !isValidDocsPath(resolved)) return href
  return `${docsPath(slug, resolved)}${hash ? `#${hash}` : ""}`
}
