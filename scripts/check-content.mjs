// Leichter PR-Check ohne npm install: JSON gültig, Markdown mit Frontmatter (title, date).
import { readdirSync, readFileSync, statSync } from "node:fs"
import { join, extname } from "node:path"

const errors = []

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p)
    else check(p)
  }
}

function check(p) {
  const ext = extname(p)
  if (ext === ".json") {
    try {
      JSON.parse(readFileSync(p, "utf8"))
    } catch (e) {
      errors.push(`${p}: ungültiges JSON (${e.message})`)
    }
  } else if (ext === ".md" && p.startsWith("content/blog")) {
    const m = readFileSync(p, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/)
    if (!m) errors.push(`${p}: Frontmatter fehlt`)
    else for (const key of ["title", "date"]) {
      if (!new RegExp(`^${key}:`, "m").test(m[1])) errors.push(`${p}: Frontmatter-Feld "${key}" fehlt`)
    }
  }
}

walk("content")
JSON.parse(readFileSync("vercel.json", "utf8"))
if (errors.length) {
  console.error(errors.join("\n"))
  process.exit(1)
}
console.log("Content-Check ok")
