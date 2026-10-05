/**
 * Blog contract for the package site.
 *
 * Pages and components only ever talk to a `BlogSource`. Sources: Markdown in
 * content/blog, the package_posts table, and the Schulz Media content API
 * (lib/blog/schulz-media.ts). Adding or swapping a source must not touch a
 * single page.
 */

export type PostType = "news" | "tutorial" | "release"

export interface Post {
  slug: string
  title: string
  excerpt: string
  /** The post content, in `bodyFormat`. */
  body: string
  /** "markdown" (default) for local and admin posts, "html" for sources that deliver finished HTML. */
  bodyFormat?: "markdown" | "html"
  /** ISO date, YYYY-MM-DD. */
  publishedAt: string
  updatedAt?: string
  author: string
  coverImage?: string
  coverAlt?: string
  /** <title> override; falls back to `title`. */
  seoTitle?: string
  /** Meta description override; falls back to `excerpt`. */
  metaDescription?: string
  /** BCP 47 language of the content when it differs from the site (English), e.g. "de-CH". */
  lang?: string
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
