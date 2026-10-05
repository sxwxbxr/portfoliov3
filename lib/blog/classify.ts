import type { PostType } from "./types"

/**
 * Guesses whether a post is a release note or a normal article, for sources
 * that do not say (ingest without `type`, Schulz Media without `category`).
 * An explicit type always wins over this; it only fills the gap.
 *
 * Signals, strongest first: a version number in the title, a release phrase
 * in the title or a release tag, Keep-a-Changelog headings in the body (at least two
 * of Added / Changed / Fixed ...). Anything else is "news".
 */

// "v1.2" or a three-part "1.4.0". A bare "15.2" is left out on purpose:
// articles mention framework versions ("Next.js 15.2") without being releases.
const VERSION = /(?:^|[\s(])(?:v\d+\.\d+(?:\.\d+)?|\d+\.\d+\.\d+)(?:[-+][\w.]+)?(?=$|[\s):,!])/i

// Plain "release" is too common in article titles ("Why I release early"),
// so only the compound phrases count.
const KEYWORDS =
  /release ?notes?|patch ?notes|changelog|what'?s new in|was ist neu in|versionshinweise|update (?:auf|to) v?\d/i

const RELEASE_TAGS = new Set(["release", "releases", "release-notes", "changelog", "patch-notes"])

const CHANGELOG_HEADINGS = new Set([
  "added", "changed", "fixed", "removed", "deprecated", "security",
  "neu", "geändert", "behoben", "entfernt",
])

function changelogHeadings(body: string, format: "markdown" | "html"): number {
  const raw =
    format === "html"
      ? [...body.matchAll(/<h[23]\b[^>]*>([\s\S]*?)<\/h[23]>/gi)].map((m) => m[1].replace(/<[^>]*>/g, ""))
      : [...body.matchAll(/^#{2,3}\s+(.+?)\s*#*\s*$/gm)].map((m) => m[1])
  const found = new Set(raw.map((h) => h.trim().toLowerCase().replace(/[:\s]+$/, "")))
  return [...found].filter((h) => CHANGELOG_HEADINGS.has(h)).length
}

export function inferType(p: {
  title: string
  excerpt: string
  body: string
  bodyFormat?: "markdown" | "html"
  tags: string[]
}): PostType {
  if (VERSION.test(p.title)) return "release"
  if (KEYWORDS.test(p.title)) return "release"
  if (p.tags.some((t) => RELEASE_TAGS.has(t.trim().toLowerCase()) || KEYWORDS.test(t))) return "release"
  if (changelogHeadings(p.body, p.bodyFormat ?? "markdown") >= 2) return "release"
  return "news"
}
