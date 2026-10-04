import fs from "fs"
import path from "path"
import { cache } from "react"
import { packageSchema, type Package } from "./schema"

export type { Package, PriceTier } from "./schema"

const DIR = path.join(process.cwd(), "content", "packages")

/**
 * Every package in content/packages, validated and sorted.
 *
 * A file that fails the schema throws with its name in the message. Failing
 * the build is the point: a half-valid package would otherwise publish with a
 * missing price or a dead checkout button.
 */
export const getPackages = cache((): Package[] => {
  const files = fs.existsSync(DIR)
    ? fs.readdirSync(DIR).filter((f) => f.endsWith(".json"))
    : []

  const packages = files.map((file) => {
    const raw = JSON.parse(fs.readFileSync(path.join(DIR, file), "utf8"))
    const parsed = packageSchema.safeParse(raw)
    if (!parsed.success) {
      throw new Error(`content/packages/${file}: ${parsed.error.message}`)
    }
    if (parsed.data.slug !== file.replace(/\.json$/, "")) {
      throw new Error(`content/packages/${file}: slug must match the file name`)
    }
    return parsed.data
  })

  return packages.sort(
    (a, b) => a.order - b.order || b.publishedAt.localeCompare(a.publishedAt)
  )
})

export function getPackage(slug: string): Package | null {
  return getPackages().find((p) => p.slug === slug) ?? null
}
