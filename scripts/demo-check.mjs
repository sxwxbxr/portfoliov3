// Opens every demo page in a real browser, reports JS errors and failed requests.
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"
const ORIGIN = process.argv[2] || "https://packages.sweber.dev"
const slugs = ["permito", "surjection", "integral", "cosine", "derivative", "gradient", "sigmoid", "logarithm", "inverse", "witness", "summand", "vector", "lagrangian"]
const pages = ["/inverse", "/bundles/compliance", "/lagrangian", "/permito", "/gradient", ...slugs.map((s) => `/${s}/demo`)]
mkdirSync("shots", { recursive: true })
const browser = await chromium.launch()
const problems = []
for (const path of pages) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()
  const errs = []
  page.on("pageerror", (e) => errs.push(`pageerror: ${e.message}`))
  const noise = (t) => /Content Security Policy|Failed to fetch RSC payload/.test(t) && /www\.sweber\.dev|packages\.sweber\.dev/.test(t)
  page.on("console", (m) => { if (m.type() === "error" && !noise(m.text())) errs.push(`console: ${m.text().slice(0, 200)}`) })
  page.on("requestfailed", (r) => { if (!r.url().startsWith("https://www.sweber.dev/")) errs.push(`requestfailed: ${r.url().slice(0, 150)}`) })
  page.on("response", (r) => { if (r.status() >= 400) errs.push(`http ${r.status()}: ${r.url().slice(0, 150)}`) })
  try {
    await page.goto(ORIGIN + path, { waitUntil: "domcontentloaded", timeout: 30000 })
    await page.waitForTimeout(3000)
    // click through the demo's visible buttons once (no navigation, no checkout)
    if (path.endsWith("/demo")) {
      const btns = page.locator("main button:visible")
      const n = Math.min(await btns.count(), 8)
      for (let i = 0; i < n; i++) { try { await btns.nth(i).click({ timeout: 2000, trial: false }) } catch {} }
      await page.waitForTimeout(500)
    }
    await page.screenshot({ path: `shots/${path.replace(/\W+/g, "_") || "home"}.png` })
  } catch (e) { errs.push(`goto: ${String(e).slice(0, 200)}`) }
  if (errs.some((e) => e.includes("#418"))) {
    // hydration mismatch: diff the server-rendered text (JS off) against the hydrated text
    const textOf = async (js) => {
      const c = await browser.newContext({ javaScriptEnabled: js })
      const p = await c.newPage()
      await p.goto(ORIGIN + path, { waitUntil: "domcontentloaded" })
      await p.waitForTimeout(3000)
      const t = await p.evaluate(() => document.body.innerText)
      await c.close()
      return t.split("\n").map((l) => l.trim()).filter(Boolean)
    }
    const [ssr, csr] = [await textOf(false), await textOf(true)]
    const only = (a, b) => a.filter((l) => !b.includes(l)).slice(0, 8)
    console.log(`   SSR-only: ${JSON.stringify(only(ssr, csr))}\n   CSR-only: ${JSON.stringify(only(csr, ssr))}`)
  }
  console.log(`${new Date().toISOString().slice(11,19)} ${errs.length ? "FAIL" : "ok  "} ${path}${errs.length ? "\n   " + [...new Set(errs)].join("\n   ") : ""}`)
  if (errs.length) problems.push(path)
  await ctx.close()
}
await browser.close()
console.log(`\n=== ${problems.length} Seiten mit Fehlern ===`)
process.exit(problems.length ? 1 : 0)
