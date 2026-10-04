import { createLocalSource } from "./local"
import type { BlogSource, Post } from "./types"

export type { BlogSource, Post, PostQuery, PostType } from "./types"

/**
 * Picks where posts come from. Pages only ever import `blog` from here.
 *
 * BLOG_SOURCE=local (default): Markdown in content/blog.
 *
 * FUTURE: BLOG_SOURCE=schulz-media, a remote adapter for the Schulz Media
 * blog system. Add `createSchulzMediaSource()` in ./schulz-media.ts, return it
 * from the switch below, and have its webhook call POST /api/revalidate.
 * Not implemented until it is known how that system delivers posts.
 */
function createSource(): BlogSource {
  const kind = process.env.BLOG_SOURCE ?? "local"
  switch (kind) {
    // case "schulz-media":
    //   return createSchulzMediaSource()
    case "local":
      return createLocalSource()
    default:
      throw new Error(`Unknown BLOG_SOURCE "${kind}"`)
  }
}

export const blog: BlogSource = createSource()

export async function getPostsForPackage(slug: string, limit = 3): Promise<Post[]> {
  return (await blog.getPosts({ package: slug })).slice(0, limit)
}

/** Posts sharing a package or tag with `post`, best overlap first, newest as tiebreak. */
export async function getRelatedPosts(post: Post, limit = 3): Promise<Post[]> {
  const score = (p: Post) =>
    p.packages.filter((x) => post.packages.includes(x)).length * 2 +
    p.tags.filter((x) => post.tags.includes(x)).length

  return (await blog.getPosts())
    .filter((p) => p.slug !== post.slug)
    .map((p) => ({ p, s: score(p) }))
    .filter(({ s }) => s > 0)
    .sort((a, b) => b.s - a.s || b.p.publishedAt.localeCompare(a.p.publishedAt))
    .slice(0, limit)
    .map(({ p }) => p)
}

export function readingTime(body: string): number {
  return Math.max(1, Math.round(body.split(/\s+/).filter(Boolean).length / 220))
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
