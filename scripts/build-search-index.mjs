// Builds the site search index (public/search/cosine-index.json) with the free
// @sweberdev/cosine CLI from public texts only: package pages, blog posts and the
// docs fetched from the package repositories. Keyword search, no embeddings.
// Run after content or docs changed: node scripts/build-search-index.mjs
import { execFileSync } from "node:child_process"
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"

const COSINE = "@sweberdev/cosine@2.0.0"
const root = join(import.meta.dirname, "..")
const src = mkdtempSync(join(tmpdir(), "search-src-"))

const write = (file, text) => {
  mkdirSync(dirname(join(src, file)), { recursive: true })
  writeFileSync(join(src, file), text)
}
const list = (items) => (items ?? []).map((i) => `- ${i}`).join("\n")
const q = (s) => JSON.stringify(String(s))

// Package pages. The pricing block is left out on purpose: prices change and live on the page.
for (const file of readdirSync(join(root, "content/packages")).filter((f) => f.endsWith(".json"))) {
  const p = JSON.parse(readFileSync(join(root, "content/packages", file), "utf8"))
  const parts = [
    `---\ntitle: ${q(p.name)}\n---\n`,
    `${p.tagline}\n\n${p.description}`,
    p.features?.free?.length ? `## Free features\n\n${list(p.features.free)}` : "",
    p.features?.pro?.length ? `## Pro features\n\n${list(p.features.pro)}` : "",
    ...(p.pro?.packages ?? []).map((x) => `## ${x.name}\n\n${x.description}`),
    ...(p.faq ?? []).map((x) => `## ${x.q}\n\n${x.a}`),
  ]
  write(`${p.slug}.md`, parts.filter(Boolean).join("\n\n"))
}

for (const file of readdirSync(join(root, "content/blog")).filter((f) => f.endsWith(".md")))
  write(`blog/${file}`, readFileSync(join(root, "content/blog", file), "utf8"))

// Docs live in the package repositories, as on the docs pages (nav.json lists the pages).
const raw = async (repo, path, file) => {
  const res = await fetch(`https://raw.githubusercontent.com/${repo}/${path}/${file}`)
  return res.ok ? res.text() : null
}
for (const file of readdirSync(join(root, "content/packages")).filter((f) => f.endsWith(".json"))) {
  const p = JSON.parse(readFileSync(join(root, "content/packages", file), "utf8"))
  if (!p.docs) continue
  const base = `${p.docs.repo}/${p.docs.ref}/${p.docs.path}`
  const nav = JSON.parse((await raw(p.docs.repo, `${p.docs.ref}/${p.docs.path}`, "nav.json")) ?? "null")
  if (!nav) {
    console.warn(`${p.slug}: no docs/nav.json, skipped`)
    continue
  }
  for (const page of nav.sections.flatMap((s) => s.items)) {
    const text = await raw(p.docs.repo, `${p.docs.ref}/${p.docs.path}`, `${page}.md`)
    if (text) write(`${p.slug}/docs/${page}.md`, text)
    else console.warn(`${base}/${page}.md not found`)
  }
}

const synonyms = join(src, "synonyms.json")
writeFileSync(
  synonyms,
  JSON.stringify([
    ["price", "pricing", "cost", "licence", "license"],
    ["gdpr", "privacy", "fadp", "dsgvo"],
    ["invoice", "e-invoice", "xrechnung", "factur-x"],
    ["cookie", "consent"],
    ["a11y", "accessibility", "wcag"],
  ])
)

const out = join(root, "public/search")
execFileSync(
  "npx",
  ["--yes", COSINE, "build", src, "--out", out, "--lexical-only", "--synonyms", synonyms, "--boost", "/blog=0.7"],
  { stdio: "inherit" }
)
rmSync(src, { recursive: true, force: true })
