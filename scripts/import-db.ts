/**
 * Import a JSON snapshot (scripts/db-snapshot.json) into the database
 * referenced by DATABASE_URL — typically the NEW account's database.
 *
 * Prerequisite: the target schema must already exist. Run `npm run db:push`
 * against the new database first.
 *
 * Usage:
 *   # 1. create the schema on the new DB
 *   DATABASE_URL=<new-db-url> npm run db:push
 *   # 2. load the data
 *   DATABASE_URL=<new-db-url> npm run db:import
 *
 * Behaviour:
 *   - Clears each target table before inserting (idempotent re-runs).
 *   - Preserves primary keys from the snapshot.
 *   - Resets each table's id sequence so future inserts don't collide.
 *
 * Safety: refuses to run unless CONFIRM_IMPORT=1 is set, to avoid wiping the
 * wrong database by accident.
 */
import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { sql as drizzleSql } from "drizzle-orm"
import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import * as schema from "../lib/schema"
import dotenv from "dotenv"

// Load .env.local (project convention), then .env as fallback. An already-set
// process.env.DATABASE_URL (e.g. from the shell) still wins — dotenv never
// overrides existing vars — so you can point this at the NEW database.
dotenv.config({ path: ".env.local" })
dotenv.config()

// Physical table name + Drizzle table object, in insertion order. No foreign
// keys exist between these tables, so order is not critical, but we keep
// site_settings last for readability.
const TABLES: { key: string; tableName: string; table: unknown }[] = [
  { key: "users", tableName: "users", table: schema.users },
  { key: "projects", tableName: "projects", table: schema.projects },
  { key: "experienceEntries", tableName: "experience", table: schema.experienceEntries },
  { key: "blogPosts", tableName: "blog_posts", table: schema.blogPosts },
  { key: "educationEntries", tableName: "education_entries", table: schema.educationEntries },
  { key: "certificates", tableName: "certificates", table: schema.certificates },
  { key: "caseStudies", tableName: "case_studies", table: schema.caseStudies },
  { key: "skills", tableName: "skills", table: schema.skills },
  { key: "siteSettings", tableName: "site_settings", table: schema.siteSettings },
]

// Columns that are timestamps in the schema and must be revived as Date objects.
const DATE_FIELDS = new Set(["createdAt", "updatedAt"])

function reviveDates(row: Record<string, unknown>) {
  for (const field of DATE_FIELDS) {
    if (typeof row[field] === "string") {
      row[field] = new Date(row[field] as string)
    }
  }
  return row
}

async function importDb() {
  if (process.env.CONFIRM_IMPORT !== "1") {
    throw new Error(
      "Refusing to run without CONFIRM_IMPORT=1. This clears the target tables.\n" +
        "Re-run with:  CONFIRM_IMPORT=1 DATABASE_URL=<new-db-url> npm run db:import"
    )
  }
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not set. Point it at the TARGET (new) database.")
  }

  const snapshotPath = resolve(process.cwd(), "scripts/db-snapshot.json")
  const snapshot = JSON.parse(readFileSync(snapshotPath, "utf8")) as Record<
    string,
    Record<string, unknown>[]
  >

  const sql = neon(process.env.DATABASE_URL)
  const db = drizzle(sql, { schema })

  // Clear in reverse order (harmless here since there are no FKs).
  for (let i = TABLES.length - 1; i >= 0; i--) {
    await db.delete(TABLES[i].table as never)
  }

  for (const { key, tableName, table } of TABLES) {
    const rows = (snapshot[key] ?? []).map((r) => reviveDates({ ...r }))
    if (rows.length === 0) {
      console.log(`Skipped ${key} (no rows in snapshot)`)
      continue
    }

    await db.insert(table as never).values(rows as never)

    // Re-align the serial sequence with the max id we just inserted so that
    // subsequent inserts (e.g. via the admin UI) get fresh ids.
    await db.execute(
      drizzleSql.raw(
        `SELECT setval(pg_get_serial_sequence('${tableName}', 'id'), ` +
          `(SELECT COALESCE(MAX(id), 1) FROM "${tableName}"))`
      )
    )

    console.log(`Imported ${rows.length} rows into ${key}`)
  }

  console.log("\nImport complete.")
}

importDb().catch((err) => {
  console.error(err)
  process.exit(1)
})
