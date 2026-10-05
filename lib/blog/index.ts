import { createDbSource } from "./db"
import { createLocalSource } from "./local"
import { createSchulzMediaSource, getExternalArticles } from "./schulz-media"
import type { BlogSource, Post, PostQuery } from "./types"

export { getExternalArticles }
export type { BlogSource, Post, PostQuery, PostType } from "./types"

/**
 * Merges several sources into one. A slug that exists in more than one keeps
 * the entry from the earlier source, so a database post can replace a
 * Markdown file of the same name.
 */
function combine(...sources: BlogSource[]): BlogSource {
  return {
    async getPosts(query?: PostQuery) {
      const seen = new Set<string>()
      const all: Post[] = []
      for (const list of await Promise.all(sources.map((s) => s.getPosts(query)))) {
        for (const p of list) {
          if (seen.has(p.slug)) continue
          seen.add(p.slug)
          all.push(p)
        }
      }
      return all.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    },
    async getPost(slug) {
      for (const s of sources) {
        const p = await s.getPost(slug)
        if (p) return p
      }
      return null
    },
  }
}

/**
 * Where posts come from. Pages only ever import `blog` from here.
 *
 * - package_posts in the database: written in /admin/news, or pushed by an
 *   external system through /api/packages/posts.
 * - The Schulz Media content API, when SCHULZ_MEDIA_API_KEY is set.
 * - Markdown in content/blog, for posts that live in the repository.
 *
 * BLOG_SOURCE=local restricts it to Markdown, e.g. for a build without a
 * database or API key.
 */
function createSource(): BlogSource {
  const kind = process.env.BLOG_SOURCE ?? "all"
  switch (kind) {
    case "all":
      return combine(
        ...[createDbSource(), createSchulzMediaSource(), createLocalSource()].filter(
          (s): s is BlogSource => s !== null
        )
      )
    case "local":
      return createLocalSource()
    default:
      throw new Error(`Unknown BLOG_SOURCE "${kind}"`)
  }
}

export const blog: BlogSource = createSource()

/** Latest articles of a package; release notes come from getReleaseNotesForPackage. */
export async function getPostsForPackage(slug: string, limit = 3): Promise<Post[]> {
  return (await blog.getPosts({ package: slug })).filter((p) => p.type !== "release").slice(0, limit)
}

/** Articles (news and tutorials), no release notes. */
export async function getArticles(query: Omit<PostQuery, "type"> = {}): Promise<Post[]> {
  return (await blog.getPosts(query)).filter((p) => p.type !== "release")
}

export async function getReleaseNotes(query: Omit<PostQuery, "type"> = {}): Promise<Post[]> {
  return blog.getPosts({ ...query, type: "release" })
}

/** Latest release notes of a package. */
export async function getReleaseNotesForPackage(slug: string, limit = 3): Promise<Post[]> {
  return (await blog.getPosts({ package: slug, type: "release" })).slice(0, limit)
}

/** Posts sharing a package or tag with `post`, best overlap first, newest as tiebreak. Releases only relate to releases. */
export async function getRelatedPosts(post: Post, limit = 3): Promise<Post[]> {
  const score = (p: Post) =>
    p.packages.filter((x) => post.packages.includes(x)).length * 2 +
    p.tags.filter((x) => post.tags.includes(x)).length

  return (await blog.getPosts())
    .filter((p) => p.slug !== post.slug && (p.type === "release") === (post.type === "release"))
    .map((p) => ({ p, s: score(p) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s || b.p.publishedAt.localeCompare(a.p.publishedAt))
    .slice(0, limit)
    .map(({ p }) => p)
}

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " " }

/** Plain text of an HTML fragment: tags removed, common entities decoded. */
function htmlText(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (m, e: string) =>
      e[0] === "#"
        ? String.fromCodePoint(parseInt(e.slice(e[1].toLowerCase() === "x" ? 2 : 1), e[1].toLowerCase() === "x" ? 16 : 10))
        : (ENTITIES[e.toLowerCase()] ?? m)
    )
}

export function readingTime(body: string, format: Post["bodyFormat"] = "markdown"): number {
  const text = format === "html" ? htmlText(body) : body
  return Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 220))
}

/** One slug function for TOC links and rendered heading ids, so they always match. */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .trim()
    .replace(/\s+/g, "-")
}

export interface Heading {
  id: string
  text: string
  level: 2 | 3
}

export function extractHeadings(body: string): Heading[] {
  const headings: Heading[] = []
  let fenced = false
  for (const line of body.split("\n")) {
    if (/^\s*```/.test(line)) fenced = !fenced
    if (fenced) continue
    const m = /^(#{2,3})\s+(.+?)\s*#*\s*$/.exec(line)
    if (!m) continue
    // Strip inline markup so the id matches the text React renders.
    const text = m[2].replace(/[`*_]|\[([^\]]*)\]\([^)]*\)/g, "$1")
    headings.push({ id: slugify(text), text, level: m[1].length as 2 | 3 })
  }
  return headings
}

/** Headings of a post for its table of contents, in either body format. */
export function headingsOf(post: Pick<Post, "body" | "bodyFormat">): Heading[] {
  if (post.bodyFormat !== "html") return extractHeadings(post.body)
  return [...post.body.matchAll(/<h([23])\b[^>]*>([\s\S]*?)<\/h\1>/gi)].map((m) => {
    const text = htmlText(m[2]).trim()
    return { id: slugify(text), text, level: Number(m[1]) as 2 | 3 }
  })
}
