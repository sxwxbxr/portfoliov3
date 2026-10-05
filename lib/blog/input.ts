import { z } from "zod"

/**
 * What a writer may send to create or update a package post, from the admin
 * form and from the ingest API alike. One schema, so both paths store the
 * same shape.
 */

const isoDate = z.string().date()
const youtubeId = z.string().regex(/^[A-Za-z0-9_-]{6,20}$/, "YouTube video ID")

export const postInput = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "lowercase letters, digits and dashes"),
  title: z.string().trim().min(1).max(200),
  excerpt: z.string().trim().max(500).default(""),
  body: z.string().default(""),
  type: z.enum(["news", "tutorial", "release"]).default("news"),
  status: z.enum(["draft", "published"]).default("draft"),
  publishedAt: isoDate,
  author: z.string().trim().min(1).default("Seya Weber"),
  coverImage: z.union([z.string().url(), z.string().startsWith("/"), z.literal("")]).default(""),
  tags: z.array(z.string().trim().min(1)).default([]),
  packages: z.array(z.string().regex(/^[a-z0-9-]+$/)).default([]),
  videos: z.array(youtubeId).default([]),
  canonicalUrl: z.union([z.string().url(), z.literal("")]).default(""),
})

export type PostInput = z.infer<typeof postInput>

/** Partial update: every field optional, nothing defaulted. */
export const postPatch = postInput
  .extend({
    excerpt: z.string().trim().max(500),
    body: z.string(),
    type: z.enum(["news", "tutorial", "release"]),
    status: z.enum(["draft", "published"]),
    author: z.string().trim().min(1),
    coverImage: z.union([z.string().url(), z.string().startsWith("/"), z.literal("")]),
    tags: z.array(z.string().trim().min(1)),
    packages: z.array(z.string().regex(/^[a-z0-9-]+$/)),
    videos: z.array(youtubeId),
    canonicalUrl: z.union([z.string().url(), z.literal("")]),
  })
  .partial()

export type PostPatch = z.infer<typeof postPatch>

/** Turns a Zod error into one readable line for an API response. */
export function describeIssues(error: z.ZodError): string {
  return error.issues.map((i) => `${i.path.join(".") || "body"}: ${i.message}`).join("; ")
}
