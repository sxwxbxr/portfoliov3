import fs from "fs"
import path from "path"
import { cache } from "react"
import { z } from "zod"
import { packageSchema } from "./schema"
import { getPackages, type Package } from "./index"

/**
 * Shape of one file in content/bundles/*.json: several Pro add-ons sold under
 * one licence. The bundle names its packages by slug, so their names, taglines
 * and Pro packages come from content/packages and never drift apart.
 */
export const bundleSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  name: z.string(),
  tagline: z.string(),
  seoTitle: z.string().optional(),
  /** One or more paragraphs, Markdown. */
  description: z.string(),
  /** Slugs in content/packages whose Pro add-on the bundle includes. */
  includes: z.array(z.string()).min(2),
  /** Packages announced for the bundle that are not released yet. */
  upcoming: z
    .array(z.object({ name: z.string(), description: z.string() }))
    .default([]),
  pro: packageSchema.shape.pro.unwrap(),
  pricing: packageSchema.shape.pricing.unwrap(),
  faq: packageSchema.shape.faq,
  publishedAt: z.string().date(),
})

export type Bundle = z.infer<typeof bundleSchema>

const DIR = path.join(process.cwd(), "content", "bundles")

/** Every bundle, validated against the schema and against content/packages. */
export const getBundles = cache((): Bundle[] => {
  const files = fs.existsSync(DIR)
    ? fs.readdirSync(DIR).filter((f) => f.endsWith(".json"))
    : []
  const known = new Set(getPackages().map((p) => p.slug))

  return files.map((file) => {
    const raw = JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8"))
    const parsed = bundleSchema.safeParse(raw)
    if (!parsed.success) {
      throw new Error(`content/bundles/${file}: ${parsed.error.message}`)
    }
    if (parsed.data.slug !== file.replace(/\.json$/, "")) {
      throw new Error(`content/bundles/${file}: slug must match the file name`)
    }
    const unknown = parsed.data.includes.filter((s) => !known.has(s))
    if (unknown.length > 0) {
      throw new Error(`content/bundles/${file}: unknown packages ${unknown.join(", ")}`)
    }
    return parsed.data
  })
})

export function getBundle(slug: string): Bundle | null {
  return getBundles().find((b) => b.slug === slug) ?? null
}

/** The packages a bundle includes, in the bundle's order. */
export function bundlePackages(bundle: Bundle): Package[] {
  const all = getPackages()
  return bundle.includes.map((s) => all.find((p) => p.slug === s)!)
}

/** Bundles that include the given package. */
export function bundlesWith(slug: string): Bundle[] {
  return getBundles().filter((b) => b.includes.includes(slug))
}
