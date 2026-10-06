// Opens every demo page in a real browser, reports JS errors and failed requests.
import { chromium } from "playwright"
import { mkdirSync } from "node:fs"
const ORIGIN = process.argv[2] || "https://packages.sweber.dev"
const slugs = ["permito", "surjection", "integral", "cosine", "derivative", "gradient", "sigmoid", "logarithm", "inverse", "witness", "summand", "vector", "lagrangian"]
const pages = [...slugs.map((s) => `/${s}/demo`), "/", "/bundles/compliance", "/blog", ...slugs.map((s) => `/${s}`)]
mkdirSync("shots", { recursive: true })
const browser = await chromium.launch()
const problems = []
for (const path of pages) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } })
  const page = await ctx.newPage()
  const errs = []
  page.on("pageerror", (e) => errs.push(`pageerror: ${e.message}`))
  page.on("console", (m) => { if (m.type() === "error") errs.push(`console: ${m.text().slice(0, 200)}`) })
  page.on("requestfailed", (r) => errs.push(`requestfailed: ${r.url().slice(0, 150)}`))
  page.on("response", (r) => { if (r.status() >= 400) errs.push(`http ${r.status()}: ${r.url().slice(0, 150)}`) })
  try {
    await page.goto(ORIGIN + path, { waitUntil: "networkidle", timeout: 45000 })
    await page.waitForTimeout(1500)
    // click through the demo's visible buttons once (no navigation, no checkout)
    if (path.endsWith("/demo")) {
      const btns = page.locator("main button:visible")
      const n = Math.min(await btns.count(), 8)
      for (let i = 0; i < n; i++) { try { await btns.nth(i).click({ timeout: 2000, trial: false }) } catch {} }
      await page.waitForTimeout(500)
    }
    await page.screenshot({ path: `shots/${path.replace(/\W+/g, "_") || "home"}.png` })
  } catch (e) { errs.push(`goto: ${String(e).slice(0, 200)}`) }
  console.log(`${errs.length ? "FAIL" : "ok  "} ${path}${errs.length ? "\n   " + [...new Set(errs)].join("\n   ") : ""}`)
  if (errs.length) problems.push(path)
  await ctx.close()
}
await browser.close()
console.log(`\n=== ${problems.length} Seiten mit Fehlern ===`)
process.exit(problems.length ? 1 : 0)
