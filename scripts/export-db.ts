/**
 * Export every content table from the database referenced by DATABASE_URL
 * into a single JSON snapshot (scripts/db-snapshot.json).
 *
 * Usage:
 *   npm run db:export
 *
 * The snapshot preserves primary keys so the import side can restore exact
 * ids (and the site_settings singleton). Pair it with scripts/import-db.ts.
 */
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { writeFileSync } from "node:fs"
import { resolve } from "node:path"
import * as schema from "../lib/schema"
import dotenv from "dotenv"

// Load .env.local (project convention), then .env as fallback. An already-set
// process.env.DATABASE_URL (e.g. from the shell) still wins — dotenv never
// overrides existing vars — so you can point export/import at different DBs.
dotenv.config({ path: ".env.local" })
dotenv.config()

// Order is irrelevant on export, but kept stable for readable diffs.
const TABLES = {
  users: schema.users,
  projects: schema.projects,
  experienceEntries: schema.experienceEntries,
  blogPosts: schema.blogPosts,
  educationEntries: schema.educationEntries,
  certificates: schema.certificates,
  caseStudies: schema.caseStudies,
  skills: schema.skills,
  siteSettings: schema.siteSettings,
} as const

async function exportDb() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Point it at the SOURCE database.")
  }

  const sql = neon(process.env.DATABASE_URL)
  const db = drizzle(sql, { schema })

  const snapshot: Record<string, unknown[]> = {}

  for (const [key, table] of Object.entries(TABLES)) {
    const rows = await db.select().from(table as never)
    snapshot[key] = rows
    console.log(`Exported ${rows.length} rows from ${key}`)
  }

  const out = resolve(process.cwd(), "scripts/db-snapshot.json")
  // Dates serialize to ISO strings; the import side coerces them back.
  writeFileSync(out, JSON.stringify(snapshot, null, 2))
  console.log(`\nSnapshot written to ${out}`)
}

exportDb().catch((err) => {
  console.error(err)
  process.exit(1)
})
