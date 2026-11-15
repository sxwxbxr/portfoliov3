/**
 * The light source of the home hero: a tube knot shaded with characters.
 *
 * Same idea as the classic terminal donut. Sample points on the tube surface,
 * rotate, project, keep the nearest point per cell, pick a character by how
 * much the surface faces the light. `morph` blends the centre curve from a
 * trefoil (three lobes) to a five-lobed knot; both terms are periodic in `u`,
 * so the curve stays closed at every value in between.
 */

const RAMP = ".,-~:;=!*#$@"
const TAU = Math.PI * 2

export interface KnotOptions {
  cols: number
  rows: number
  /** Steps along the curve. Fewer on small screens. */
  steps?: number
  /** Steps around the tube. */
  ring?: number
}

export function renderKnot(t: number, morph: number, { cols, rows, steps = 640, ring = 18 }: KnotOptions): string {
  const size = cols * rows
  const chars = new Array<string>(size).fill(" ")
  const depth = new Float32Array(size)

  const ca = Math.cos(t * 0.5)
  const sa = Math.sin(t * 0.5)
  const cb = Math.cos(t * 0.32)
  const sb = Math.sin(t * 0.32)
  const w3 = 1 - morph
  const w5 = morph
  // A character cell is taller than wide, so x gets the larger scale.
  const scaleY = rows
  const scaleX = rows * 1.65

  for (let i = 0; i < steps; i++) {
    const u = (i / steps) * TAU
    const c2 = Math.cos(2 * u)
    const s2 = Math.sin(2 * u)
    const c3 = Math.cos(3 * u)
    const s3 = Math.sin(3 * u)
    const c5 = Math.cos(5 * u)
    const s5 = Math.sin(5 * u)

    const r = 2 + w3 * c3 + w5 * c5
    const dr = -3 * w3 * s3 - 5 * w5 * s5
    const cx = r * c2
    const cy = r * s2
    const cz = -(w3 * s3 + w5 * s5)

    // Tangent, then a frame around it. The xy part is never zero (|2r| >= 2).
    let tx = dr * c2 - 2 * r * s2
    let ty = dr * s2 + 2 * r * c2
    let tz = -(3 * w3 * c3 + 5 * w5 * c5)
    const tl = Math.hypot(tx, ty, tz)
    tx /= tl
    ty /= tl
    tz /= tl
    const nl = Math.hypot(tx, ty)
    const nx = ty / nl
    const ny = -tx / nl
    const bx = -tz * ny
    const by = tz * nx
    const bz = tx * ny - ty * nx

    for (let j = 0; j < ring; j++) {
      const v = (j / ring) * TAU
      const cv = Math.cos(v)
      const sv = Math.sin(v)
      const ox = cv * nx + sv * bx
      const oy = cv * ny + sv * by
      const oz = sv * bz
      const px = cx + 0.5 * ox
      const py = cy + 0.5 * oy
      const pz = cz + 0.5 * oz

      const y1 = py * ca - pz * sa
      const z1 = py * sa + pz * ca
      const ny1 = oy * ca - oz * sa
      const nz1 = oy * sa + oz * ca
      const x2 = px * cb + z1 * sb
      const z2 = -px * sb + z1 * cb
      const nz2 = -ox * sb + nz1 * cb

      const inv = 1 / (z2 + 8.5)
      const col = Math.floor(cols / 2 + scaleX * inv * x2)
      const row = Math.floor(rows / 2 - scaleY * inv * y1)
      if (col < 0 || col >= cols || row < 0 || row >= rows) continue

      const cell = col + row * cols
      if (inv > depth[cell]) {
        depth[cell] = inv
        const lit = Math.floor((0.62 * ny1 - 0.78 * nz2 + 0.25) * 9.5)
        chars[cell] = RAMP[Math.max(0, Math.min(RAMP.length - 1, lit))]
      }
    }
  }

  let out = ""
  for (let row = 0; row < rows; row++) {
    out += chars.slice(row * cols, (row + 1) * cols).join("") + "\n"
  }
  return out
}
