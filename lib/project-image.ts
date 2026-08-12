import fs from "node:fs"
import path from "node:path"

// Memoised per process. These pages are statically generated, so in practice
// this resolves at build time and costs nothing per request.
const seen = new Map<string, boolean>()

/**
 * Server-only. Returns the public src when the asset is actually present,
 * otherwise null.
 *
 * Content is authored in the admin UI, so an image path can point at a file
 * that was never uploaded — five of the nine seeded projects do exactly that.
 * Resolving up front lets components render a deliberate alternative instead
 * of a broken frame, and replaces the inline existsSync that previously lived
 * in app/projects/[slug]/page.tsx.
 */
export function resolveImage(src: string | null | undefined): string | null {
  if (!src) return null

  // Uploaded images live in Vercel Blob and arrive as absolute URLs. There is
  // nothing on disk to stat, so they pass straight through — the alternative
  // would be an HTTP request per image on every render, and a slow blob store
  // would then blank the artwork rather than merely delay it.
  if (/^https?:\/\//i.test(src)) return src

  if (!src.startsWith("/")) return null
  let ok = seen.get(src)
  if (ok === undefined) {
    try {
      ok = fs.existsSync(path.join(process.cwd(), "public", src))
    } catch {
      ok = false
    }
    seen.set(src, ok)
  }
  return ok ? src : null
}
