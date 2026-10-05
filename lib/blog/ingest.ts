import { timingSafeEqual } from "crypto"
import { NextResponse, type NextRequest } from "next/server"
import { z } from "zod"
import { inferType } from "./classify"
import { postInput } from "./input"
import type { PostType } from "./types"
import { pkgUrl } from "@/lib/packages/urls"

function matches(given: string, expected: string) {
  const a = Buffer.from(given)
  const b = Buffer.from(expected)
  return a.length === b.length && timingSafeEqual(a, b)
}

/**
 * Checks `Authorization: Bearer <token>` against an env variable.
 * "unconfigured" means the variable is empty, so the endpoint is switched
 * off rather than open.
 */
export function checkBearer(
  req: NextRequest,
  envName: string,
  { allowQuery = false } = {}
): "ok" | "unauthorized" | "unconfigured" {
  const expected = process.env[envName]
  if (!expected) return "unconfigured"
  const header = req.headers.get("authorization")
  const given =
    (header?.startsWith("Bearer ") ? header.slice(7) : null) ??
    (allowQuery ? req.nextUrl.searchParams.get("token") : null) ??
    ""
  return matches(given, expected) ? "ok" : "unauthorized"
}

/** Name stored in package_posts.source for everything pushed through the ingest API. */
export const INGEST_SOURCE = process.env.BLOG_INGEST_SOURCE || "schulz-media"

/** A pushed post: the normal post fields plus the sender's own ID. Published unless it says otherwise. */
export const ingestInput = postInput.extend({
  // Absent means "decide from the content" (see withInferredType); an explicit value wins.
  type: z.enum(["news", "tutorial", "release"]).optional(),
  externalId: z.string().trim().min(1).max(200),
  status: z.enum(["draft", "published"]).default("published"),
})

/** Rejects the request unless the ingest token matches and a database is configured. */
export function guardIngest(req: NextRequest): NextResponse | null {
  const auth = checkBearer(req, "BLOG_INGEST_TOKEN")
  if (auth === "unconfigured")
    return NextResponse.json({ error: "Ingest is not configured" }, { status: 503 })
  if (auth === "unauthorized")
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  if (!process.env.DATABASE_URL)
    return NextResponse.json({ error: "No database configured" }, { status: 503 })
  return null
}

/** Public URL of a post, or null while it is a draft. */
export function publicUrl(row: { slug: string; status: string }) {
  return row.status === "published" ? pkgUrl(`/blog/${row.slug}`) : null
}

/** Fills the post type from the content when the sender did not set one. */
export function withInferredType<
  T extends { type?: PostType; title: string; excerpt: string; body: string; tags: string[] },
>(fields: T): Omit<T, "type"> & { type: PostType } {
  return { ...fields, type: fields.type ?? inferType(fields) }
}
