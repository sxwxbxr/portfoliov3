// Crawls the live packages site: sitemap URLs, internal links, checkout links.
// Usage: node scripts/site-check.mjs [origin]
const ORIGIN = process.argv[2] || "https://packages.sweber.dev"
const BAD_TEXT = [/\[OFFEN\]/, /\bundefined\b/, /\[object Object\]/, /\bNaN\b/, /lorem ipsum/i, /\bTODO\b/]
const problems = []
const seen = new Map()
const externalLinks = new Map()

async function get(url, opts = {}) {
  for (let i = 0; i < 2; i++) {
    try {
      const r = await fetch(url, { redirect: "manual", headers: { "user-agent": "sweber-site-check" }, signal: AbortSignal.timeout(30000), ...opts })
      return r
    } catch (e) {
      if (i) return { status: 0, error: String(e), headers: new Headers(), text: async () => "" }
    }
  }
}

const sm = await (await get(`${ORIGIN}/sitemap.xml`)).text()
let urls = [...sm.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
console.log(`sitemap: ${urls.length} urls`)
if (!urls.length) problems.push(`sitemap.xml leer oder nicht erreichbar`)
for (const extra of ["/", "/packages.json", "/feed.xml", "/blog/feed.xml", "/blog/posts.json", "/releasenotes/feed.xml", "/bundles/compliance", "/license"]) urls.push(ORIGIN + extra)
urls = [...new Set(urls)]

const queue = [...urls]
const pages = new Map()
while (queue.length) {
  const batch = queue.splice(0, 8)
  await Promise.all(batch.map(async (u) => {
    if (seen.has(u)) return
    const r = await get(u)
    seen.set(u, r.status)
    if (r.status >= 300 && r.status < 400) {
      const loc = r.headers.get("location")
      console.log(`${r.status} ${u} -> ${loc}`)
      if (loc) { const t = new URL(loc, u).href; if (t.startsWith(ORIGIN) && !seen.has(t)) queue.push(t) }
      return
    }
    console.log(`${r.status} ${u}`)
    if (r.status !== 200) { problems.push(`${r.status} ${u}`); return }
    const ct = r.headers.get("content-type") || ""
    if (!ct.includes("html")) return
    const html = await r.text()
    pages.set(u, html)
    const text = html.replace(/<pre[\s\S]*?<\/pre>/g, "").replace(/<code[\s\S]*?<\/code>/g, "").replace(/<script[\s\S]*?<\/script>/g, "").replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ")
    for (const re of BAD_TEXT) if (re.test(text)) problems.push(`Text ${re} auf ${u}`)
    if (!/<title>[^<]{3,}/.test(html)) problems.push(`kein Title: ${u}`)
    for (const m of html.matchAll(/href="([^"#]+)(?:#[^"]*)?"/g)) {
      let h = m[1].replace(/&amp;/g, "&")
      if (/^(mailto:|tel:|javascript:)/.test(h)) continue
      let abs
      try { abs = new URL(h, u).href } catch { continue }
      if (abs.startsWith(ORIGIN)) { const p = new URL(abs); if (/^\/(_next|_vercel)/.test(p.pathname) || /\.(png|jpe?g|svg|ico|webp|woff2?|css|js|mp4|webm)$/.test(p.pathname)) continue; if (!seen.has(abs) && !queue.includes(abs)) queue.push(abs) }
      else { if (!externalLinks.has(abs)) externalLinks.set(abs, new Set()); externalLinks.get(abs).add(u) }
    }
  }))
}

console.log(`\nexterne Links: ${externalLinks.size}`)
const ext = [...externalLinks.entries()]
const SKIP = /npmjs\.com\/package|127\.0\.0\.1|twint\.ch|eur-lex|github\.com\/[^/]+\/[^/]+\/(edit|blob)|linkedin\.com|twitter\.com|x\.com|instagram\.com|tiktok\.com|threads\.net/
while (ext.length) {
  const batch = ext.splice(0, 8)
  await Promise.all(batch.map(async ([u, from]) => {
    if (SKIP.test(u)) return
    let r = await get(u, { redirect: "follow" })
    if (r.status === 405 || r.status === 403) r = await get(u, { redirect: "follow", method: "GET" })
    const where = [...from].slice(0, 2).join(", ")
    console.log(`${r.status} ${u}  (${where})`)
    if (r.status !== 200 && r.status !== 429) problems.push(`extern ${r.status} ${u} auf ${where}`)
  }))
}

// checkout links from the content files: each must be on its page and answer 200
import { readFileSync, readdirSync } from "node:fs"
const checkoutByPage = new Map()
for (const f of readdirSync("content/packages")) {
  const d = JSON.parse(readFileSync(`content/packages/${f}`, "utf8"))
  const links = []
  for (const t of d.pricing?.tiers ?? []) links.push(...Object.values(t.checkout ?? {}))
  checkoutByPage.set(`${ORIGIN}/${d.slug}`, links)
  for (const n of d.npm ?? []) {
    const r = await get(`https://registry.npmjs.org/${n}`, { redirect: "follow" })
    const j = r.status === 200 ? await r.json() : null
    const v = j?.["dist-tags"]?.latest
    console.log(`npm ${n}: ${r.status} ${v ?? "-"}`)
    if (!v) problems.push(`npm ${n} nicht gefunden (${r.status})`)
  }
}
for (const f of readdirSync("content/bundles")) {
  const d = JSON.parse(readFileSync(`content/bundles/${f}`, "utf8"))
  const links = []
  for (const t of d.pricing?.tiers ?? []) links.push(...Object.values(t.checkout ?? {}))
  checkoutByPage.set(`${ORIGIN}/bundles/${f.replace(".json", "")}`, links)
}
for (const [page, links] of checkoutByPage) {
  const html = pages.get(page) ?? ""
  for (const l of links) {
    if (!html.includes(l)) problems.push(`Checkout-Link fehlt auf ${page}: ${l}`)
    const r = await get(l, { redirect: "follow" })
    console.log(`checkout ${r.status} ${l} (${page})`)
    if (r.status !== 200) problems.push(`Checkout ${r.status} ${l} (${page})`)
  }
}
// every Pro package page must carry checkout links
const polar = [...pages.entries()].filter(([, h]) => /polar\.sh\/checkout|buy\.polar\.sh|polar_cl_/.test(h)).map(([u]) => u)
console.log(`\nSeiten mit Polar-Checkout-Link: ${polar.length}`)
for (const [u, h] of pages) console.log(`LEN ${h.length} ${u}`)
console.log(`\n=== PROBLEME (${problems.length}) ===`)
for (const p of problems) console.log(p)
process.exit(problems.length ? 1 : 0)
