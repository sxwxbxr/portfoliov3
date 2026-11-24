import { getPackages } from "@/lib/packages"
import { PACKAGES_ORIGIN, pkgUrl } from "@/lib/packages/urls"
import { POSTS_TAG } from "./db"
import { inferType } from "./classify"
import type { BlogSource, Post, PostType } from "./types"

/**
 * Posts from the Schulz Media content API. Marco's system holds the posts;
 * this site pulls them on the server and renders them as its own pages.
 * The API key never reaches the browser.
 *
 * Contract (from Schulz Media):
 *   GET {base}/posts/?limit=&offset=   -> { posts, total, limit, offset }
 *   GET {base}/posts/<slug>/           -> { post } or 404
 * Paths need the trailing slash; without it the API answers with a redirect.
 * The host moved from www.schulz-media.ch to www.blogpilot.ch. The old host
 * answers 307, and fetch drops the Authorization header on a cross-origin
 * redirect, so a call to the old host ends in 401. Always call blogpilot.ch.
 * Only approved posts are returned, so no draft filtering happens here.
 */

// shortcut: SCHULZ_MEDIA_API_KEY is the old name of the key variable; drop it once Vercel only has BLOGPILOT_API_KEY.
// The old SCHULZ_MEDIA_API_URL is ignored on purpose: it may still point at the redirecting host.
const BASE = (process.env.BLOGPILOT_API_URL || "https://www.blogpilot.ch/api/content/v1").replace(/\/$/, "")
const KEY = process.env.BLOGPILOT_API_KEY || process.env.SCHULZ_MEDIA_API_KEY

/** Seconds a fetched response is reused. Approval in Schulz Media calls /api/revalidate to skip the wait. */
const REVALIDATE = 3600

interface RemotePost {
  id: string
  slug: string
  title: string
  excerpt: string | null
  content_html: string | null
  seo: { title?: string | null; meta_description?: string | null; focus_keyword?: string | null } | null
  image: { url: string; alt?: string | null; credit?: string | null } | null
  url: string | null
  /** Optional editorial category; decides the post type when present. */
  category?: string | null
  published_at: string
  updated_at: string | null
}

class SchulzMediaError extends Error {}

async function call<T>(path: string): Promise<T | null> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { Authorization: `Bearer ${KEY}` },
    next: { revalidate: REVALIDATE, tags: [POSTS_TAG] },
  })
  if (res.status === 404) return null
  if (!res.ok) throw new SchulzMediaError(`BlogPilot API ${path}: HTTP ${res.status}`)
  return (await res.json()) as T
}

/**
 * Our canonical URL wins when the post points at this site. Schulz Media
 * builds `url` from an address pattern; if that pattern differs from ours in
 * a trailing slash or `www`, the canonical would point at a redirect.
 */
const OWN_HOSTS = new Set(
  ["https://packages.sweber.dev", PACKAGES_ORIGIN ?? pkgUrl("/")].map((u) =>
    new URL(u).hostname.replace(/^www\./, "")
  )
)

function canonicalFor(p: RemotePost): string | undefined {
  if (!p.url) return undefined
  try {
    if (OWN_HOSTS.has(new URL(p.url).hostname.replace(/^www\./, ""))) return undefined
  } catch {
    return undefined
  }
  return p.url
}

/** Links a post to every package whose name appears in its title or excerpt. */
function packagesMentioned(p: RemotePost): string[] {
  const text = `${p.title} ${p.excerpt ?? ""}`.toLowerCase()
  return getPackages()
    .filter((pkg) => new RegExp(`\\b${pkg.name.toLowerCase()}\\b`).test(text))
    .map((pkg) => pkg.slug)
}

const CATEGORY_TYPES: Record<string, PostType> = {
  release: "release",
  "release-notes": "release",
  changelog: "release",
  "patch-notes": "release",
  tutorial: "tutorial",
}

/** The category when Schulz Media sends one, otherwise a guess from the content. */
function typeOf(p: RemotePost, post: Omit<Post, "type">): PostType {
  if (p.category) return CATEGORY_TYPES[p.category.trim().toLowerCase()] ?? "news"
  return inferType(post)
}

function toPost(p: RemotePost): Post {
  const post: Omit<Post, "type"> = {
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt ?? "",
    body: p.content_html ?? "",
    bodyFormat: "html",
    publishedAt: p.published_at.slice(0, 10),
    updatedAt: p.updated_at?.slice(0, 10),
    author: "Weber Development",
    coverImage: p.image?.url,
    coverAlt: p.image?.alt ?? undefined,
    seoTitle: p.seo?.title ?? undefined,
    metaDescription: p.seo?.meta_description ?? undefined,
    lang: "de-CH",
    tags: p.seo?.focus_keyword ? [p.seo.focus_keyword] : [],
    packages: packagesMentioned(p),
    videos: [],
    canonicalUrl: canonicalFor(p),
  }
  return { ...post, type: typeOf(p, post) }
}

/** A failing call throws. lib/blog decides what that means: the build fails, a running site serves the other sources. */
async function readAll(): Promise<Post[]> {
  const all: RemotePost[] = []
  for (let offset = 0; ; ) {
    const page = await call<{ posts: RemotePost[]; total: number }>(
      `/posts/?limit=100&offset=${offset}`
    )
    if (!page) break
    all.push(...page.posts)
    offset += page.posts.length
    if (page.posts.length === 0 || all.length >= page.total) break
  }
  return all.map(toPost)
}

/** Null when BLOGPILOT_API_KEY is not set, so local work needs no key. */
export function createSchulzMediaSource(): BlogSource | null {
  if (!KEY) return null
  return {
    async getPosts(query) {
      return (await readAll()).filter(
        (p) =>
          (!query?.package || p.packages.includes(query.package)) &&
          (!query?.type || p.type === query.type)
      )
    },
    async getPost(slug) {
      if (!/^[a-z0-9-]+$/.test(slug)) return null
      const res = await call<{ post: RemotePost }>(`/posts/${slug}/`)
      return res ? toPost(res.post) : null
    },
  }
}

/**
 * Marco's posts for the portfolio blog: Schulz Media posts that are articles,
 * not release notes. Empty when BLOGPILOT_API_KEY is not set.
 */
export async function getExternalArticles(): Promise<Post[]> {
  const posts = (await createSchulzMediaSource()?.getPosts()) ?? []
  return posts.filter((p) => p.type !== "release")
}
