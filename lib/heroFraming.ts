/**
 * Framing for the hero object.
 *
 * ## Why this is its own module
 *
 * The laptop's geometry lives in the shader; the camera and the framing have to
 * be solved in JS, because the shader cannot know the stage's aspect ratio until
 * it is told. That split is a drift hazard — a literal tuned against one version
 * of the geometry is silently wrong against the next, which has already bitten
 * this component twice (the contact-shadow plane, and the vertical extent).
 *
 * So the corner list below is the ONE place the object's extremes are written
 * down, and both the component and the offline shader harness import from here.
 * If the shader's geometry constants change, these must change with them, and
 * the harness's clipping assertion is what catches it if they do not.
 *
 * ## Why the projection is solved rather than approximated
 *
 * The first attempt sized the object with the orthographic approximation
 * `uv ≈ world · fov / distance`, asked for 80% of the stage height, and got
 * 92.6% with the object clipped off the bottom edge. The base's near-front
 * corner sits roughly 1.8 units from the camera while the lid's top sits nearly
 * 4 — so perspective enlarges the near corner far beyond what the approximation
 * predicts. Worse, the object rotates, so which corner is nearest changes and
 * the projected size PULSES; a constant tuned at one angle clips at another.
 *
 * The exact solve is simple once seen. For a point P:
 *
 *     uv.y = fov · dot(P − ro, cv) / dot(P − ro, cw)
 *
 * and that second factor does not involve `fov` at all. So uv is exactly linear
 * in fov, and it is enough to find the extreme ratios over every corner at every
 * rotation once, at module load, and then divide.
 */

/** Forward tilt of the whole object, radians. Mirrors TILT in the shader. */
export const TILT = 0.6

/** Camera. Distance is generous on purpose — see PULSE below. */
const CAM_DIST = 4.2
/**
 * How far the camera sits above its target. Sets how much of the keyboard deck
 * and the screen you see; atan(CAM_LIFT / CAM_DIST) ≈ 9.9°.
 */
const CAM_LIFT = 0.73

/**
 * Largest share of the stage width the object may occupy on a wide stage.
 *
 * Both budgets are the size dial. They were 0.45 / 0.72, which made the laptop
 * smaller than the plate it replaced — pulling the camera back from 2.6 to 4.2
 * to tame the perspective pulsing shrank it, and lowering the height budget at
 * the same time compounded that. At 0.50 / 0.84 the object's left edge lands
 * around 64% of the stage width, so the 50% copy column still clears it with a
 * comfortable gutter. Raise these before touching anything else if it should
 * grow further; the harness reports the resulting left edge.
 */
const OBJECT_WIDTH = 0.5
/** Largest share of the stage height the object may occupy. */
const OBJECT_HEIGHT = 0.84
/** How far past the right edge the object runs, in half-height units. */
const BLEED = 0.1
/** Floor, so a tall-but-wide stage cannot shrink the object to a chip. */
const FOV_MIN = 1.4
/** Narrow stages centre the object instead, pulled back so it fits the width. */
const FOV_NARROW = 2.4
/**
 * Stage width, in CSS px, at which the type moves beside the object instead of
 * stacking above it. Deliberately a WIDTH and deliberately 900, because it has
 * to be the same signal as the `min-width: 900px` block in globals.css that
 * moves the poster to the right. An earlier aspect-ratio threshold disagreed
 * with the CSS around the breakpoint; two layers describing one layout must not
 * read two different signals.
 */
export const WIDE_STAGE_PX = 900

/* ── The object's corners, object space ───────────────────────────────────
   These mirror BASE / LID / LID_TILT / HINGE in milledBlockShader.ts. The
   base's top face sits at y = 0. Bevel radii are ignored: they only ever pull
   the silhouette inward, so using the sharp corners is the conservative
   choice. */
const BASE = { x: 0.88, y: 0.045, z: 0.62 }
const LID = { x: 0.86, y: 0.56, z: 0.02 }
const LID_TILT = 0.3
const HINGE_Z = -0.6

type Vec3 = [number, number, number]

function laptopCorners(): Vec3[] {
  const out: Vec3[] = []

  for (const x of [-BASE.x, BASE.x]) {
    for (const y of [-2 * BASE.y, 0]) {
      for (const z of [-BASE.z, BASE.z]) out.push([x, y, z])
    }
  }

  const lc = Math.cos(LID_TILT)
  const ls = Math.sin(LID_TILT)
  const up: Vec3 = [0, lc, -ls]
  const nrm: Vec3 = [0, ls, lc]
  const ctr: Vec3 = [0, up[1] * LID.y, HINGE_Z + up[2] * LID.y]

  for (const lx of [-LID.x, LID.x]) {
    for (const ly of [-LID.y, LID.y]) {
      for (const lz of [-LID.z, LID.z]) {
        out.push([
          ctr[0] + lx,
          ctr[1] + up[1] * ly + nrm[1] * lz,
          ctr[2] + up[2] * ly + nrm[2] * lz,
        ])
      }
    }
  }

  return out
}

const CORNERS = laptopCorners()

/** rotY(spin) · rotX(TILT), the same composition the shader builds. */
function rotate([x, y, z]: Vec3, spin: number): Vec3 {
  const tc = Math.cos(TILT)
  const ts = Math.sin(TILT)
  const y1 = y * tc - z * ts
  const z1 = y * ts + z * tc

  const sc = Math.cos(spin)
  const ss = Math.sin(spin)
  return [x * sc + z1 * ss, y1, -x * ss + z1 * sc]
}

/** World-space vertical centre of the object, used to place the camera. */
function verticalCentre(): number {
  let lo = Infinity
  let hi = -Infinity
  for (const c of CORNERS) {
    const y = rotate(c, 0)[1]
    if (y < lo) lo = y
    if (y > hi) hi = y
  }
  return (lo + hi) / 2
}

export const CENTER_Y = verticalCentre()

/**
 * Projected extremes, independent of fov. Sampled over a full turn because the
 * object spins: sizing for one angle is what makes it clip at another.
 */
function projectedExtremes() {
  const roY = CENTER_Y + CAM_LIFT
  const d: Vec3 = [0, CENTER_Y - roY, -CAM_DIST]
  const len = Math.hypot(d[1], d[2])
  const cw: Vec3 = [0, d[1] / len, d[2] / len]
  // The camera sits on the +z axis looking at the origin, so normalize(cross(cw,
  // worldUp)) is exactly +x and needs no general-case cross product.
  const cu: Vec3 = [1, 0, 0]
  // cv = cross(cu, cw), which for cu = (1,0,0) reduces to (0, -cw.z, cw.y).
  const cv: Vec3 = [0, -cw[2], cw[1]]

  let minX = Infinity
  let maxX = -Infinity
  let minY = Infinity
  let maxY = -Infinity

  const STEPS = 48
  for (let i = 0; i < STEPS; i++) {
    const spin = (i / STEPS) * Math.PI * 2
    for (const corner of CORNERS) {
      const p = rotate(corner, spin)
      const rx = p[0] - 0
      const ry = p[1] - roY
      const rz = p[2] - CAM_DIST
      const zc = rx * cw[0] + ry * cw[1] + rz * cw[2]
      if (zc <= 0.05) continue // behind or level with the camera
      const xc = rx * cu[0] + ry * cu[1] + rz * cu[2]
      const yc = rx * cv[0] + ry * cv[1] + rz * cv[2]
      const rX = xc / zc
      const rY = yc / zc
      if (rX < minX) minX = rX
      if (rX > maxX) maxX = rX
      if (rY < minY) minY = rY
      if (rY > maxY) maxY = rY
    }
  }

  return { minX, maxX, minY, maxY }
}

const E = projectedExtremes()

/** uv span per unit fov, horizontally and vertically. */
const SPAN_X = E.maxX - E.minX
const SPAN_Y = E.maxY - E.minY

/**
 * How much the projected size varies over a turn, as a fraction. Reported so
 * that a future change to CAM_DIST can be judged: too close and the object
 * visibly breathes as it spins, too far and it flattens into an elevation
 * drawing. At CAM_DIST 4.2 this sits around 0.2.
 */
export const PULSE = SPAN_Y > 0 ? (E.maxY + E.minY) / SPAN_Y : 0

export interface Framing {
  fov: number
  offsetX: number
  offsetY: number
  centerY: number
  camLift: number
  camDist: number
  planeY: number
  tilt: number
  /** Share of the stage the object actually ends up covering. */
  widthShare: number
  heightShare: number
}

/**
 * Contact-shadow plane: just below the object's lowest world point at any spin.
 * Derived, because a literal here was sliced straight through by the object the
 * first time the tilt changed.
 */
function planeY(): number {
  let lo = Infinity
  for (let i = 0; i < 48; i++) {
    const spin = (i / 48) * Math.PI * 2
    for (const c of CORNERS) {
      const y = rotate(c, spin)[1]
      if (y < lo) lo = y
    }
  }
  return lo - 0.015
}

const PLANE_Y = planeY()

/**
 * Solve the framing for a stage of `width` × `height` CSS pixels.
 *
 * Wide stages seat the object right of the type and let it bleed off the edge,
 * which is what stops it reading as a product shot. Narrow ones centre it
 * behind the type, where CSS drops its opacity instead.
 */
export function solveFraming(width: number, height: number): Framing {
  const aspect = width / Math.max(height, 1)

  let fov: number
  let offsetX: number

  if (width < WIDE_STAGE_PX) {
    fov = FOV_NARROW
    offsetX = 0
  } else {
    // Stage is 2·aspect wide and 2 tall in uv units; the object's spans are
    // fov·SPAN_X and fov·SPAN_Y. Whichever share binds first wins.
    const fromWidth = (2 * aspect * OBJECT_WIDTH) / SPAN_X
    const fromHeight = (2 * OBJECT_HEIGHT) / SPAN_Y
    fov = Math.max(Math.min(fromWidth, fromHeight), FOV_MIN)
    // Anchor the object's right extreme just past the right edge of the stage.
    offsetX = aspect + BLEED - fov * E.maxX
  }

  // Centre vertically on the PROJECTED extent rather than the world-space one,
  // so perspective cannot push the object off an edge.
  const offsetY = (fov * (E.maxY + E.minY)) / 2

  return {
    fov,
    offsetX,
    offsetY,
    centerY: CENTER_Y,
    camLift: CAM_LIFT,
    camDist: CAM_DIST,
    planeY: PLANE_Y,
    tilt: TILT,
    widthShare: (fov * SPAN_X) / (2 * aspect),
    heightShare: (fov * SPAN_Y) / 2,
  }
}
