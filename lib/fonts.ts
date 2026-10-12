import localFont from "next/font/local"

/**
 * Self-hosted rather than fetched from Google at build time.
 *
 * next/font/google downloads the woff2 files from fonts.gstatic.com during
 * `next build`. A Vercel build failed when three Space Grotesk instances did
 * not come back, and next/font reports that as
 * `TypeError: Cannot read properties of null (reading '1')` rather than as a
 * network error — an opaque failure for something entirely outside our
 * control. Making the site's typography depend on a third party being
 * reachable at build time is not a trade worth keeping, especially right
 * after fixing the bug that stopped these faces rendering at all.
 *
 * These are the latin subsets of the same files Google serves, all
 * SIL OFL licensed (see app/fonts/OFL.md). They are VARIABLE fonts, so the
 * declared weight ranges cover every step the design uses — which also fixes
 * synthesised weights: the previous config loaded Inter 400 and 500 only,
 * while the UI asks for `font-semibold` (600) in several places and the
 * browser had to fake it.
 *
 * next/font/local resolves `src` relative to this file, so the paths below
 * are relative to lib/. Both root layouts (en, de) import from here, so the
 * fonts are declared exactly once.
 */
export const inter = localFont({
  src: "../app/fonts/Inter-Variable-latin.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-inter",
  preload: true,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
})

export const jetbrainsMono = localFont({
  src: "../app/fonts/JetBrainsMono-Variable-latin.woff2",
  weight: "100 800",
  style: "normal",
  display: "swap",
  variable: "--font-jetbrains-mono",
  preload: false,
  fallback: ["ui-monospace", "monospace"],
})
