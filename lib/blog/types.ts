/**
 * Blog contract for the package site.
 *
 * Pages and components only ever talk to a `BlogSource`. The first
 * implementation reads local Markdown from content/blog; a second one will
 * fetch from the Schulz Media blog system once it is known how that system
 * delivers posts (API, feed, webhook or commits). Swapping the source must not
 * touch a single page.
 */

export type PostType = "news" | "tutorial" | "release"

export interface Post {
  slug: string
  title: string
  excerpt: string
  /** Markdown. A remote source that delivers HTML converts or wraps it. */
  body: string
  /** ISO date, YYYY-MM-DD. */
  publishedAt: string
  updatedAt?: string
  author: string
  coverImage?: string
  tags: string[]
  /** Package slugs from content/packages this post is about. */
  packages: string[]
  type: PostType
  /** YouTube video IDs, rendered behind consent. */
  videos: string[]
  /** Set when the post first appeared elsewhere; the page points its canonical there. */
  canonicalUrl?: string
}

export interface PostQuery {
  package?: string
  type?: PostType
}

export interface BlogSource {
  /** All published posts, newest first. */
  getPosts(query?: PostQuery): Promise<Post[]>
  getPost(slug: string): Promise<Post | null>
}
