/**
 * The lie of the land under the home page's flight, as plain numbers.
 *
 * The path runs straight down a valley whose floor rolls gently. To either
 * side the land climbs into hills and, further out, into ranges, so the
 * valley narrows and opens as the flight goes on. Every landmark stands in a
 * clearing where the hills step back; those that belong on a rise get a
 * knoll, behind the mountain the path climbs over a pass between high
 * walls, and the shrine stands on a plateau whose far edge falls away.
 *
 * Everything is in world units: x across (the path at 0), z along the
 * flight, heights upwards. Pure, so it can be tested and sampled freely.
 */

const smooth = (v: number) => {
  const t = Math.max(0, Math.min(1, v))
  return t * t * (3 - 2 * t)
}

/** Something on the route that shapes the ground around it. */
export interface Feature {
  z: number
  /** Where it stands across the valley. */
  x: number
  /** "knoll": a rise under it. "massif": a pass between high walls just behind it. "level": it stands on the valley floor. */
  shape: "knoll" | "massif" | "level"
}

export interface Land {
  features: Feature[]
  /** Where the shrine gate stands: the plateau ends just behind it. */
  shrine: number
}

/** How far behind a massif's landmark its pass lies. */
const PASS = 6.4
const bell = (v: number) => Math.exp(-v * v)

/** Height of the valley floor, and of the path on it, at `z`. */
export function floorAt(z: number, land: Land, cliff = true): number {
  let roll = 0.8 * Math.sin(z * 0.05 + 0.6) + 0.45 * Math.sin(z * 0.117 + 2.1)
  for (const feature of land.features) {
    if (feature.shape === "massif") roll += 1.4 * bell((z - feature.z - PASS) / 6)
  }
  const plateau = 1.8 * smooth((z - (land.shrine - 16)) / 11)
  const drop = cliff ? 7 * smooth((z - (land.shrine + 1.5)) / 5) : 0
  return roll + plateau - drop
}

/** Height the camera keeps to: over the path, and level where the plateau ends. */
export function cruiseAt(z: number, land: Land, clearance: number): number {
  return clearance + floorAt(z + 1.5, land, false)
}

/** What depends on `z` alone, worked out once per row of the picture. */
export interface Row {
  z: number
  floor: number
  /** Half-widths of the flat valley floor, left and right of the path. */
  left: number
  right: number
  /** How high the hills stand on either side. */
  hillLeft: number
  hillRight: number
  features: Feature[]
}

export function rowAt(z: number, land: Land): Row {
  let hillLeft = 3.2 + 2.2 * Math.sin(z * 0.027 + 0.4)
  let hillRight = 2.6 + 2 * Math.sin(z * 0.033 + 2.5)
  let left = 3.2 + 1.6 * Math.sin(z * 0.043 + 4)
  let right = 4 + 1.2 * Math.sin(z * 0.031 + 1)
  const near: Feature[] = []
  for (const feature of land.features) {
    const dz = z - feature.z
    // The hills step back to make room for what stands here.
    right = Math.max(right, (feature.x + 4.4) * bell(dz / 7))
    if (feature.shape === "massif") {
      // The walls of the pass close in and stand high on both sides.
      const pass = bell((dz - PASS) / 5)
      hillLeft += 8 * pass
      hillRight += 9 * pass
      left -= (left - 1.8) * pass
    } else if (feature.shape === "knoll" && Math.abs(dz) < 9) {
      near.push(feature)
    }
  }
  return {
    z,
    floor: floorAt(z, land),
    left,
    right,
    hillLeft,
    hillRight,
    features: near,
  }
}

/** Height of the ground at `x` across the row. */
export function heightAt(x: number, row: Row): number {
  const side = x < 0 ? -1 : 1
  const beyond = Math.abs(x) - (side < 0 ? row.left : row.right)
  let height = row.floor

  if (beyond > 0) {
    const z = row.z
    const bump = 0.5 + 0.5 * Math.sin(x * 0.31 + z * 0.07 + side * 1.7) * Math.sin(z * 0.16 + x * 0.05)
    const hill = (side < 0 ? row.hillLeft : row.hillRight) * smooth(beyond / 10) * (0.6 + 0.4 * bump)
    const range = 9 * smooth((beyond - 14) / 22) * (0.55 + 0.45 * Math.sin(x * 0.09 + z * 0.045 + side))
    height += hill + range
  }

  for (const feature of row.features) {
    // A knoll never reaches onto the path.
    const off = smooth((Math.abs(x) - 1.2) / 1.5)
    if (off === 0) continue
    const dx = x - feature.x
    const dz = row.z - feature.z
    height += 1.1 * off * Math.exp(-(dx * dx + dz * dz * 0.6) / 10)
  }
  return height
}
