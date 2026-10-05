/**
 * The small client site checked on the Surjection demo page. Each fix removes
 * one of the barriers below. The same markup was checked with the real CLI to
 * produce the report, history and checklist files in public/demos/surjection.
 */

export const SHOP_FIXES = ["lang", "contrast", "alt", "label", "button", "link"] as const
export type ShopFix = (typeof SHOP_FIXES)[number]

const LOGO =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="320" height="160" viewBox="0 0 320 160"><rect width="320" height="160" fill="#e9dcc7"/><circle cx="110" cy="80" r="44" fill="#b9874f"/><circle cx="190" cy="80" r="44" fill="#c99b62"/></svg>'
  )

export function shopHtml(fixed: ReadonlySet<ShopFix>): string {
  const has = (f: ShopFix) => fixed.has(f)
  return `<!doctype html>
<html${has("lang") ? ' lang="de-CH"' : ""}>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Bäckerei Muster</title>
<style>
  body { margin: 0; font: 16px/1.5 system-ui, sans-serif; color: #222; background: #fffdf8; }
  header, main, footer { max-width: 40rem; margin: 0 auto; padding: 1rem 1.25rem; }
  header { display: flex; justify-content: space-between; align-items: center; }
  .brand { font-weight: 700; font-size: 1.25rem; }
  .hours { color: ${has("contrast") ? "#5c5c5c" : "#b5b5b5"}; }
  img { display: block; width: 100%; height: auto; border-radius: 8px; }
  form { display: flex; gap: .5rem; flex-wrap: wrap; align-items: end; }
  label, .field { display: flex; flex-direction: column; font-size: .875rem; }
  input { font: inherit; padding: .4rem .6rem; border: 1px solid #888; border-radius: 4px; }
  button { font: inherit; padding: .45rem .8rem; border: 0; border-radius: 4px; background: #7a4b1e; color: #fff; }
  .icon { width: 2.25rem; height: 2.25rem; padding: 0; display: inline-grid; place-items: center; }
  footer a { color: #7a4b1e; }
</style>
</head>
<body>
<header>
  <span class="brand">Bäckerei Muster</span>
  <button class="icon" type="button"${has("button") ? ' aria-label="Warenkorb"' : ""}><svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M7 18a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm10 0a2 2 0 1 0 0 4 2 2 0 0 0 0-4ZM5.2 4l.9 2H21l-3.4 7H8.1l-.9 2H19v2H4l2.4-4.6L3.3 4H1V2h3.4l.8 2Z"/></svg></button>
</header>
<main>
  <h1>Frisches Brot aus Bern</h1>
  <p class="hours">Montag bis Samstag, 6 bis 18 Uhr</p>
  <img src="${LOGO}"${has("alt") ? ' alt="Zwei Bürli auf dem Backblech"' : ""}>
  <h2>Newsletter</h2>
  <form onsubmit="return false">
    ${has("label") ? '<label>E-Mail<input type="email" autocomplete="email"></label>' : '<span class="field"><span>E-Mail</span><input type="email"></span>'}
    <button type="submit">Anmelden</button>
  </form>
</main>
<footer>
  <a href="#instagram">${has("link") ? "Instagram" : ""}<svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/></svg></a>
</footer>
</body>
</html>`
}
