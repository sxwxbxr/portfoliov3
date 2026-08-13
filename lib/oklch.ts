/**
 * `oklch()` → linear sRGB, for handing CAST's palette to a shader.
 *
 * Every colour token in `app/globals.css` is authored in oklch, and every
 * lighting calculation in the hero shader has to happen in LINEAR light. That
 * makes this conversion the natural path rather than a detour: the inverse of
 * oklab lands in linear sRGB directly, so the sRGB transfer function is never
 * applied on the way in and only applied once on the way out.
 *
 * Reading the tokens back through `getComputedStyle().color` is not an
 * alternative. CSS Color 4 preserves the authored colour space in computed
 * values, so browsers hand back the `oklch(...)` string unchanged instead of
 * resolving it to `rgb()`.
 *
 * The matrices are Björn Ottosson's oklab ⇄ linear-sRGB pair, the same ones
 * `scripts/check-contrast.mjs` measures the palette with — so the block is lit
 * with exactly the values the contrast checker signs off on.
 */

export type Rgb = [number, number, number]

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n)

/**
 * Matches `oklch(L C H)` anywhere in the input, because
 * `getPropertyValue("--plate")` returns the declared value with its
 * surrounding whitespace intact. Alpha is accepted and ignored — no CAST
 * token carries one, and the shader has no use for it.
 */
const OKLCH = /oklch\(\s*([\d.]+%?)\s+([\d.]+%?)\s+(-?[\d.]+)(?:deg)?\s*(?:\/[^)]*)?\)/i

/** `50%` means 0.5 of L's range and 0.4 of C's. Bare numbers pass through. */
function component(token: string, percentBase: number): number {
  return token.endsWith("%") ? (parseFloat(token) / 100) * percentBase : parseFloat(token)
}

/**
 * Unclamped on purpose: an out-of-gamut token is a real signal that
 * `check:contrast` already flags, and silently clamping it here would hide the
 * fact that the colour being rendered is not the colour the token names.
 * Returns null when the input is not an `oklch()` value at all.
 */
export function oklchToLinearRgb(input: string): Rgb | null {
  const m = OKLCH.exec(input)
  if (!m) return null

  const L = component(m[1], 1)
  const C = component(m[2], 0.4)
  const h = (parseFloat(m[3]) * Math.PI) / 180

  const a = C * Math.cos(h)
  const b = C * Math.sin(h)

  // oklab → LMS'
  const lp = L + 0.3963377774 * a + 0.2158037573 * b
  const mp = L - 0.1055613458 * a - 0.0638541728 * b
  const sp = L - 0.0894841775 * a - 1.291485548 * b

  // LMS' → LMS
  const l = lp * lp * lp
  const m2 = mp * mp * mp
  const s = sp * sp * sp

  // LMS → linear sRGB
  return [
    4.0767416621 * l - 3.3077115913 * m2 + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m2 - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m2 + 1.707614701 * s,
  ]
}

/**
 * What the shader actually wants: in-gamut linear sRGB, with a caller-supplied
 * fallback so a renamed or missing token degrades to a plausible material
 * instead of to black.
 */
export function oklchToLinearRgbClamped(input: string, fallback: Rgb): Rgb {
  const rgb = oklchToLinearRgb(input)
  if (!rgb) return fallback
  return [clamp01(rgb[0]), clamp01(rgb[1]), clamp01(rgb[2])]
}
