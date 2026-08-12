#!/usr/bin/env node
/**
 * Verifies the CAST palette against its contrast targets.
 *
 *   node scripts/check-contrast.mjs        # check, exit 1 on failure
 *   node scripts/check-contrast.mjs --all  # also print informational pairs
 *
 * The whole design direction rests on the claim that a soft, tactile surface
 * can still clear WCAG on the parts that carry meaning. This script is what
 * makes that claim checkable rather than asserted, so run it after touching
 * any token in app/globals.css.
 *
 * It PARSES app/globals.css rather than holding its own copy of the palette —
 * a duplicated table would silently drift from the stylesheet and start
 * certifying colours nobody ships.
 *
 * Two things it encodes that are easy to get wrong:
 *
 * 1. Contrast is checked against the WORST surface a token can land on, and
 *    that differs per mode. In light mode the sunken well is darkest, so dark
 *    text has least room there. In dark mode the raised plate is lightest, so
 *    light text has least room there. Checking against the ground alone passes
 *    tokens that fail in a real well or on a real plate.
 *
 * 2. Out-of-gamut oklch is a silent failure. The browser clamps, so a colour
 *    with too much chroma for its lightness renders as something other than
 *    what the token says — and its measured contrast is not the computed one.
 */

import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { dirname, resolve } from "node:path"

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..")
const css = readFileSync(resolve(root, "app/globals.css"), "utf8")

// ── colour maths ────────────────────────────────────────────────────
function linearRgb(L, C, hDeg) {
  const h = (hDeg * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3, m = m_ ** 3, s = s_ ** 3
  return [
     4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701  * s,
  ]
}
const clamp01 = (v) => Math.min(1, Math.max(0, v))
const inGamut = ([L, C, h]) =>
  linearRgb(L, C, h).every((v) => v >= -0.0005 && v <= 1.0005)

function luminance([L, C, h]) {
  const [r, g, b] = linearRgb(L, C, h).map(clamp01)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
function contrast(a, b) {
  const x = luminance(a), y = luminance(b)
  return x > y ? (x + 0.05) / (y + 0.05) : (y + 0.05) / (x + 0.05)
}
function hex([L, C, h]) {
  const enc = (v) => {
    v = clamp01(v)
    const s = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055
    return Math.round(s * 255).toString(16).padStart(2, "0")
  }
  const [r, g, b] = linearRgb(L, C, h)
  return "#" + enc(r) + enc(g) + enc(b)
}

// ── parse the token blocks out of globals.css ───────────────────────
function tokensFrom(selector) {
  // Non-greedy up to the first closing brace at the start of a line, which is
  // how the blocks in globals.css are formatted.
  const block = new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\n\\}`, "m").exec(css)
  if (!block) throw new Error(`could not find the ${selector} block in app/globals.css`)

  const out = {}
  const decl = /--([\w-]+):\s*oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/g
  let m
  while ((m = decl.exec(block[1])) !== null) {
    out[m[1]] = [parseFloat(m[2]), parseFloat(m[3]), parseFloat(m[4])]
  }
  return out
}

const light = tokensFrom(":root")
const dark = { ...light, ...tokensFrom("\\.dark") }

// ── what has to hold ────────────────────────────────────────────────
// `min: 0` means informational: reported, never failed. Those pairs are the
// decorative separations of the material itself — a cast highlight against its
// own ground is meant to be low contrast, that is what makes it look soft.
const PAIRS = [
  ["body text",              "fg",            4.5],
  ["muted text",             "fg-muted",      4.5],
  ["annotation text",        "fg-subtle",     3.0],
  ["control edge",           "edge",          3.0],
  ["accent as text",         "signal",        4.5],
  ["accent graphics",        "signal-bright", 3.0],
  ["focus ring",             "signal",        3.0],
]
const SURFACES = ["ground", "plate", "well"]
const INFO = [
  ["cast highlight vs ground", "cast-hi", "ground"],
  ["cast shadow vs ground",    "cast-lo", "ground"],
  ["plate vs ground",          "plate",   "ground"],
  ["well vs ground",           "well",    "ground"],
]

const showAll = process.argv.includes("--all")
let failures = 0

for (const [mode, tokens] of [["light", light], ["dark", dark]]) {
  console.log(`\n${"=".repeat(70)}`)
  console.log(`  ${mode.toUpperCase()}   ` +
    SURFACES.map((s) => `${s} ${hex(tokens[s])}`).join(" · "))
  console.log("=".repeat(70))

  for (const [label, token, min] of PAIRS) {
    const c = tokens[token]
    if (!c) {
      console.log(`  MISSING  --${token} is not defined in ${mode}`)
      failures++
      continue
    }
    const ratios = SURFACES.map((s) => [s, contrast(c, tokens[s])])
    const [worstName, worst] = ratios.reduce((a, b) => (a[1] < b[1] ? a : b))
    const ok = worst >= min
    if (!ok) failures++
    console.log(
      `  ${ok ? " ok " : "FAIL"}  ${label.padEnd(18)} ${worst.toFixed(2).padStart(6)}:1` +
      `  (min ${min}, worst on ${worstName})  ${hex(c)}`
    )
  }

  for (const [name, C] of Object.entries(tokens)) {
    if (!inGamut(C)) {
      console.log(`  FAIL  --${name} is OUTSIDE the sRGB gamut — the browser will clamp it`)
      failures++
    }
  }

  if (showAll) {
    for (const [label, a, b] of INFO) {
      if (!tokens[a] || !tokens[b]) continue
      console.log(`        ${label.padEnd(26)} ${contrast(tokens[a], tokens[b]).toFixed(2)}:1`)
    }
  }
}

console.log(
  failures === 0
    ? "\nAll contrast targets met.\n"
    : `\n${failures} failure(s). Fix the token, or move the target and say why.\n`
)
process.exit(failures === 0 ? 0 : 1)
