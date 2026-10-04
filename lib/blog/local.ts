import fs from "fs"
import path from "path"
import { cache } from "react"
import matter from "gray-matter"
import { z } from "zod"
import type { BlogSource, Post, PostQuery } from "./types"

const DIR = path.join(process.cwd(), "content", "blog")

// js-yaml turns an unquoted `2026-10-04` into a Date. Normalise to the string
// the rest of the site expects, so authors need not quote dates.
const isoDate = z.preprocess(
  (v) => (v instanceof Date ? v.toISOString().slice(0, 10) : v),
  z.string().date()
)

const frontmatter = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/).optional(),
  title: z.string(),
  excerpt: z.string(),
  date: isoDate,
  updated: isoDate.optional(),
  author: z.string().default("Seya Weber"),
  coverImage: z.string().optional(),
  tags: z.array(z.string()).default([]),
  packages: z.array(z.string()).default([]),
  type: z.enum(["news", "tutorial", "release"]).default("news"),
  videos: z.array(z.string()).default([]),
  canonicalUrl: z.string().url().optional(),
})

const readAll = cache((): Post[] => {
  if (!fs.existsSync(DIR)) return []
  const today = new Date().toISOString().slice(0, 10)

  const posts = fs
    .readdirSync(DIR)
    .filter((f) => f.endsWith(".md"))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(DIR, file), "utf8"))
      const parsed = frontmatter.safeParse(data)
      if (!parsed.success) {
        throw new Error(`content/blog/${file}: ${parsed.error.message}`)
      }
      const f = parsed.data
      const post: Post = {
        slug: f.slug ?? file.replace(/\.md$/, ""),
        title: f.title,
        excerpt: f.excerpt,
        body: content.trim(),
        publishedAt: f.date,
        updatedAt: f.updated,
        author: f.author,
        coverImage: f.coverImage,
        tags: f.tags,
        packages: f.packages,
        type: f.type,
        videos: f.videos,
        canonicalUrl: f.canonicalUrl,
      }
      return post
    })
    // A future date is how a post is scheduled: it ships with the build but
    // stays invisible until the day (ISR picks it up within the revalidate window).
    .filter((p) => p.publishedAt <= today)

  return posts.sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
})

export function createLocalSource(): BlogSource {
  return {
    async getPosts(query?: PostQuery) {
      return readAll().filter(
        (p) =>
          (!query?.package || p.packages.includes(query.package)) &&
          (!query?.type || p.type === query.type)
      )
    },
    async getPost(slug) {
      return readAll().find((p) => p.slug === slug) ?? null
    },
  }
}
