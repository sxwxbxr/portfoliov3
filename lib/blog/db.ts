import { cache } from "react"
import { unstable_cache } from "next/cache"
import { desc } from "drizzle-orm"
import { db } from "@/lib/db"
import { packagePosts } from "@/lib/schema"
import type { BlogSource, Post, PostType } from "./types"

type Row = typeof packagePosts.$inferSelect

export function rowToPost(row: Row): Post {
  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    body: row.body,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt.toISOString().slice(0, 10),
    author: row.author,
    coverImage: row.coverImage || undefined,
    tags: row.tags ?? [],
    packages: row.packages ?? [],
    type: row.type as PostType,
    videos: row.videos ?? [],
    canonicalUrl: row.canonicalUrl || undefined,
  }
}

/** Cache tag on every read of package_posts; see revalidatePackagePosts. */
export const POSTS_TAG = "package-posts"

/**
 * Published posts from package_posts. Without DATABASE_URL (local markup
 * work) there are none. A missing table also yields none, with a warning:
 * the code can ship before `db:push` creates the table, and the package site
 * must not go down for that. Any other database error propagates.
 */
const queryPublished = async (): Promise<Post[]> => {
  if (!process.env.DATABASE_URL) return []
  const today = new Date().toISOString().slice(0, 10)
  try {
    const rows = await db.select().from(packagePosts).orderBy(desc(packagePosts.publishedAt))
    return rows
      .filter((r) => r.status === "published" && r.publishedAt <= today)
      .map(rowToPost)
  } catch (err) {
    // Drizzle wraps the driver error, so the Postgres message may sit in `cause`.
    const message = err instanceof Error ? `${err.message} ${String(err.cause ?? "")}` : ""
    if (/relation "package_posts" does not exist/.test(message)) {
      console.warn("package_posts table missing; run `npm run db:push`")
      return []
    }
    throw err
  }
}

// Tagged so a write can invalidate every page, feed and sitemap built from
// these rows at once; revalidatePath alone does not reach route handlers.
const readPublished = cache(
  unstable_cache(queryPublished, [POSTS_TAG], { tags: [POSTS_TAG], revalidate: 60 })
)

export function createDbSource(): BlogSource {
  return {
    async getPosts(query) {
      return (await readPublished()).filter(
        (p) =>
          (!query?.package || p.packages.includes(query.package)) &&
          (!query?.type || p.type === query.type)
      )
    },
    async getPost(slug) {
      return (await readPublished()).find((p) => p.slug === slug) ?? null
    },
  }
}
