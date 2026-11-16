/**
 * The things that stand in the landscape of the home page's flight, drawn
 * as backlit silhouettes: near black against the red sky, a red rim where
 * the light catches an edge, and small warm lights.
 *
 * Every drawing is made in world units with its foot at the origin and up
 * as negative y; `drawLandmark` places and scales it. Original drawings,
 * built from simple shapes.
 */

export type LandmarkKind =
  | "windmill"
  | "mast"
  | "observatory"
  | "airship"
  | "mountain"
  | "tree"
  | "pagoda"
  | "lanterns"
  | "torii"

const K = "#0b0304"
const D = "#1c0607"
const M = "#2b0608"
const R1 = "#5d0a0f"
const R2 = "#8f1016"
const R3 = "#c81e17"
const HOT = "#ff6a3d"
const GLOW = "#ffc29a"
const PAPER = "#f4f4f1"

type Ctx = CanvasRenderingContext2D
type Point = [number, number]

function poly(ctx: Ctx, points: Point[], fill: string) {
  ctx.fillStyle = fill
  ctx.beginPath()
  points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
  ctx.closePath()
  ctx.fill()
}

function line(ctx: Ctx, points: Point[], stroke: string, width: number) {
  ctx.strokeStyle = stroke
  ctx.lineWidth = width
  ctx.lineJoin = "round"
  ctx.lineCap = "round"
  ctx.beginPath()
  points.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)))
  ctx.stroke()
}

function disc(ctx: Ctx, x: number, y: number, r: number, fill: string) {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
}

/** A light with a soft halo. `on` 0..1 dims it. */
function lamp(ctx: Ctx, x: number, y: number, r: number, on = 1) {
  ctx.globalAlpha = 0.16 * on
  disc(ctx, x, y, r * 4, HOT)
  ctx.globalAlpha = 0.35 + 0.65 * on
  disc(ctx, x, y, r, on > 0.5 ? GLOW : HOT)
  ctx.globalAlpha = 1
}

/** A low hill for something to stand on. */
function mound(ctx: Ctx, rx: number, ry: number) {
  ctx.fillStyle = R1
  ctx.beginPath()
  ctx.ellipse(0, 0, rx, ry, 0, Math.PI, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = D
  ctx.beginPath()
  ctx.ellipse(0, 0.05, rx, ry, 0, Math.PI, Math.PI * 2)
  ctx.fill()
}

/** A lump of foliage: lit disc, body pushed away from the light. */
function leaf(ctx: Ctx, x: number, y: number, r: number, light: Point, rim = R2, body = K) {
  const dx = x - light[0]
  const dy = y - light[1]
  const far = Math.hypot(dx, dy) || 1
  disc(ctx, x, y, r, rim)
  disc(ctx, x + (dx / far) * r * 0.14, y + (dy / far) * r * 0.14, r * 0.95, body)
}

/** A roof with upturned eaves, `wide` across, sitting on y. */
function roof(ctx: Ctx, y: number, wide: number, next: number, high: number) {
  ctx.fillStyle = K
  ctx.beginPath()
  ctx.moveTo(-wide / 2, y - high * 0.42)
  ctx.quadraticCurveTo(-wide / 3.2, y, -next / 2 - 0.1, y)
  ctx.lineTo(next / 2 + 0.1, y)
  ctx.quadraticCurveTo(wide / 3.2, y, wide / 2, y - high * 0.42)
  ctx.quadraticCurveTo(wide / 3.4, y - high * 0.5, next / 2, y - high)
  ctx.lineTo(-next / 2, y - high)
  ctx.quadraticCurveTo(-wide / 3.4, y - high * 0.5, -wide / 2, y - high * 0.42)
  ctx.fill()
  // The eave catches the light.
  ctx.strokeStyle = R2
  ctx.lineWidth = 0.035
  ctx.beginPath()
  ctx.moveTo(-wide / 2, y - high * 0.42)
  ctx.quadraticCurveTo(-wide / 3.2, y, -next / 2 - 0.1, y)
  ctx.lineTo(next / 2 + 0.1, y)
  ctx.quadraticCurveTo(wide / 3.2, y, wide / 2, y - high * 0.42)
  ctx.stroke()
}

// ── Services: a windmill, turning. ────────────────────────────────────
function windmill(ctx: Ctx, time: number) {
  mound(ctx, 1.6, 0.45)
  poly(ctx, [[-0.62, -0.3], [-0.36, -3], [0.36, -3], [0.62, -0.3]], K)
  line(ctx, [[-0.62, -0.3], [-0.36, -3]], R2, 0.04)
  // Cap and gallery.
  ctx.fillStyle = K
  ctx.beginPath()
  ctx.ellipse(0, -3, 0.46, 0.5, 0, Math.PI, Math.PI * 2)
  ctx.fill()
  poly(ctx, [[-0.8, -1.5], [0.8, -1.5], [0.72, -1.38], [-0.72, -1.38]], K)
  line(ctx, [[-0.8, -1.5], [0.8, -1.5]], R2, 0.03)
  // Door and windows.
  poly(ctx, [[-0.14, -0.3], [-0.14, -0.72], [0.14, -0.72], [0.14, -0.3]], HOT)
  lamp(ctx, 0, -2.05, 0.07)
  lamp(ctx, 0, -1.1, 0.06, 0.6)
  // Sails.
  ctx.save()
  ctx.translate(0, -3.05)
  ctx.rotate(time * 0.45)
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2)
    line(ctx, [[0, 0], [0, -2.3]], K, 0.07)
    poly(ctx, [[0.06, -0.5], [0.5, -0.56], [0.5, -2.24], [0.06, -2.3]], M)
    ctx.strokeStyle = R2
    ctx.lineWidth = 0.025
    ctx.beginPath()
    for (let k = 0; k < 6; k++) {
      const y = -0.56 - k * 0.3
      ctx.moveTo(0.06, y)
      ctx.lineTo(0.5, y - 0.04)
    }
    ctx.moveTo(0.5, -0.56)
    ctx.lineTo(0.5, -2.24)
    ctx.stroke()
  }
  ctx.restore()
  disc(ctx, 0, -3.05, 0.12, R2)
}

// ── A signal mast: waves leave the top and messages rise from it. ─────
function mast(ctx: Ctx, time: number) {
  const top = -5.2
  line(ctx, [[-0.6, 0], [-0.07, top], [0.07, top], [0.6, 0]], K, 0.08)
  // Bracing.
  ctx.strokeStyle = K
  ctx.lineWidth = 0.045
  ctx.beginPath()
  for (let i = 0; i < 8; i++) {
    const a = i / 8
    const b = (i + 1) / 8
    const wa = 0.6 - a * 0.53
    const wb = 0.6 - b * 0.53
    ctx.moveTo(-wa, top * a)
    ctx.lineTo(wb, top * b)
    ctx.moveTo(wa, top * a)
    ctx.lineTo(-wb, top * b)
  }
  ctx.stroke()
  line(ctx, [[-0.6, 0], [-0.07, top]], R2, 0.03)
  // Platform and dishes.
  poly(ctx, [[-0.55, -3.3], [0.55, -3.3], [0.5, -3.16], [-0.5, -3.16]], K)
  disc(ctx, -0.52, -3.75, 0.26, K)
  disc(ctx, -0.56, -3.75, 0.2, R1)
  disc(ctx, 0.5, -4.2, 0.2, K)
  disc(ctx, 0.54, -4.2, 0.15, R1)
  line(ctx, [[0, top], [0, top - 0.7]], K, 0.05)
  lamp(ctx, 0, top - 0.7, 0.08, 0.5 + 0.5 * Math.sin(time * 3))

  // Waves.
  ctx.strokeStyle = GLOW
  ctx.lineWidth = 0.045
  for (let i = 0; i < 3; i++) {
    const t = (time * 0.4 + i / 3) % 1
    ctx.globalAlpha = (1 - t) * 0.8
    const r = 0.35 + t * 1.5
    for (const side of [0, Math.PI]) {
      ctx.beginPath()
      ctx.arc(0, top - 0.7, r, side - 0.7, side + 0.7)
      ctx.stroke()
    }
  }
  // Messages.
  for (let i = 0; i < 4; i++) {
    const t = (time * 0.16 + i / 4) % 1
    const side = i % 2 ? 1 : -1
    const x = side * (1 + i * 0.22 + Math.sin(time + i) * 0.08)
    const y = top - 0.2 - t * 2
    const wide = 0.62 - (i % 3) * 0.1
    ctx.globalAlpha = Math.sin(t * Math.PI) * 0.92
    ctx.fillStyle = i % 2 ? PAPER : GLOW
    ctx.beginPath()
    ctx.roundRect(x - wide / 2, y - 0.17, wide, 0.34, 0.1)
    ctx.fill()
    poly(ctx, [[x - side * 0.12, y + 0.15], [x - side * 0.3, y + 0.32], [x - side * 0.02, y + 0.17]], ctx.fillStyle as string)
    line(ctx, [[x - wide / 2 + 0.1, y - 0.04], [x + wide / 2 - 0.1, y - 0.04]], K, 0.035)
    line(ctx, [[x - wide / 2 + 0.1, y + 0.06], [x + wide / 2 - 0.22, y + 0.06]], K, 0.035)
  }
  ctx.globalAlpha = 1
}

// ── An observatory on a hill, watching; poles with lights around it. ──
function observatory(ctx: Ctx, time: number) {
  const rx = 2.3
  const ry = 1.1
  mound(ctx, rx, ry)
  const slope = (x: number) => -ry * Math.sqrt(Math.max(0, 1 - (x / rx) ** 2))
  // Poles, wired together.
  const poles = [-1.85, -1.2, 1.25, 1.9]
  const tops = poles.map((x) => [x, slope(x) - 0.95] as Point)
  ctx.strokeStyle = R2
  ctx.lineWidth = 0.025
  ctx.beginPath()
  for (let i = 0; i < tops.length - 1; i++) {
    const [ax, ay] = tops[i]
    const [bx, by] = tops[i + 1]
    ctx.moveTo(ax, ay)
    ctx.quadraticCurveTo((ax + bx) / 2, Math.max(ay, by) + (i === 1 ? 0.75 : 0.3), bx, by)
  }
  ctx.stroke()
  tops.forEach(([x, y], i) => {
    line(ctx, [[x, y + 0.95], [x, y]], K, 0.06)
    lamp(ctx, x, y, 0.065, 0.5 + 0.5 * Math.sin(time * 2.2 + i * 1.7))
  })
  // The beam, sweeping the sky.
  const angle = -Math.PI / 2 + Math.sin(time * 0.35) * 1
  ctx.save()
  ctx.translate(0, -2.35)
  ctx.rotate(angle)
  const beam = ctx.createLinearGradient(0, 0, 7, 0)
  beam.addColorStop(0, "rgba(255, 194, 154, 0.42)")
  beam.addColorStop(1, "rgba(255, 194, 154, 0)")
  ctx.fillStyle = beam
  ctx.beginPath()
  ctx.moveTo(0, -0.05)
  ctx.lineTo(7, -0.75)
  ctx.lineTo(7, 0.75)
  ctx.lineTo(0, 0.05)
  ctx.fill()
  ctx.restore()
  // Drum and dome.
  poly(ctx, [[-0.78, -0.95], [-0.78, -1.75], [0.78, -1.75], [0.78, -0.95]], K)
  line(ctx, [[-0.78, -1.75], [0.78, -1.75]], R2, 0.035)
  disc(ctx, 0, -1.75, 0.8, R2)
  disc(ctx, 0.05, -1.72, 0.77, K)
  ctx.fillStyle = K
  ctx.fillRect(-0.85, -1.74, 1.7, 0.8)
  poly(ctx, [[-0.08, -2.55], [0.08, -2.55], [0.1, -1.8], [-0.1, -1.8]], HOT)
  for (const x of [-0.45, 0, 0.45]) poly(ctx, [[x - 0.07, -1.5], [x + 0.07, -1.5], [x + 0.07, -1.22], [x - 0.07, -1.22]], HOT)
}

// ── An airship at its mooring, shedding pages. ────────────────────────
function airship(ctx: Ctx, time: number) {
  // The mooring mast.
  line(ctx, [[-0.3, 0], [0, -2.5], [0.3, 0]], K, 0.06)
  ctx.strokeStyle = K
  ctx.lineWidth = 0.04
  ctx.beginPath()
  for (let i = 0; i < 4; i++) {
    const a = i / 4
    const b = (i + 1) / 4
    ctx.moveTo(-0.3 * (1 - a), -2.5 * a)
    ctx.lineTo(0.3 * (1 - b), -2.5 * b)
  }
  ctx.stroke()
  lamp(ctx, 0, -2.5, 0.06, 0.5 + 0.5 * Math.sin(time * 2.5))

  ctx.save()
  ctx.translate(1.5, -3.5 + Math.sin(time * 0.7) * 0.1)
  ctx.rotate(Math.sin(time * 0.5) * 0.02)
  line(ctx, [[-1.5, 1], [-2, 0.05]], R1, 0.02)
  // Fins.
  poly(ctx, [[1.5, -0.1], [2.35, -0.95], [2.2, -0.05]], K)
  poly(ctx, [[1.5, 0.1], [2.35, 0.9], [2.2, 0.05]], K)
  // Hull: lit from below by the horizon.
  ctx.fillStyle = R2
  ctx.beginPath()
  ctx.ellipse(0, 0, 2.05, 0.68, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = K
  ctx.beginPath()
  ctx.ellipse(0.02, -0.07, 2.04, 0.65, 0, 0, Math.PI * 2)
  ctx.fill()
  ctx.strokeStyle = M
  ctx.lineWidth = 0.03
  for (const x of [-1.1, -0.35, 0.4, 1.15]) {
    ctx.beginPath()
    ctx.ellipse(x, -0.03, 0.16, 0.62 * Math.sqrt(1 - (x / 2.05) ** 2), 0, -Math.PI / 2, Math.PI / 2)
    ctx.stroke()
  }
  // Gondola.
  ctx.fillStyle = K
  ctx.beginPath()
  ctx.roundRect(-0.75, 0.6, 1.3, 0.3, 0.1)
  ctx.fill()
  for (let i = 0; i < 5; i++) poly(ctx, [[-0.62 + i * 0.23, 0.68], [-0.48 + i * 0.23, 0.68], [-0.48 + i * 0.23, 0.79], [-0.62 + i * 0.23, 0.79]], HOT)
  // Pages, let go one after the other.
  for (let i = 0; i < 7; i++) {
    const t = (time * 0.12 + i / 7) % 1
    const x = 2.3 + t * 3.4
    const y = 0.1 + t * t * 1.6 + Math.sin(time * 1.4 + i * 2) * 0.16
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(Math.sin(time * 1.1 + i) * 0.7)
    ctx.globalAlpha = Math.sin(t * Math.PI) * 0.95
    poly(ctx, [[-0.15, -0.2], [0.15, -0.2], [0.15, 0.2], [-0.15, 0.2]], PAPER)
    line(ctx, [[-0.08, -0.09], [0.08, -0.09]], R2, 0.03)
    line(ctx, [[-0.08, 0], [0.08, 0]], K, 0.025)
    line(ctx, [[-0.08, 0.08], [0.03, 0.08]], K, 0.025)
    ctx.restore()
  }
  ctx.globalAlpha = 1
  ctx.restore()
}

// ── A mountain with a vault in its foot, full of machines. ────────────
function mountain(ctx: Ctx, time: number) {
  poly(
    ctx,
    [[-4, 0], [-3, -1.5], [-2.35, -1.15], [-0.9, -4.5], [-0.25, -3.3], [0.55, -3.9], [1.5, -2.2], [2.1, -2.5], [3.9, 0]],
    K,
  )
  // Snow, where the light reaches.
  poly(ctx, [[-0.9, -4.5], [-1.5, -3.1], [-1.1, -3.35], [-0.85, -2.9], [-0.5, -3.4], [-0.25, -3.3]], R2)
  poly(ctx, [[0.55, -3.9], [0.05, -3.1], [0.42, -3.25], [0.62, -2.95], [0.95, -3.2]], R1)
  poly(ctx, [[2.1, -2.5], [1.8, -2.05], [2.1, -2.15], [2.4, -2.05]], R1)
  line(ctx, [[-4, 0], [-3, -1.5], [-2.35, -1.15], [-0.9, -4.5]], R1, 0.035)
  line(ctx, [[-0.85, -2.9], [-0.6, -1.9], [-0.9, -1.2]], D, 0.05)
  line(ctx, [[0.62, -2.95], [0.9, -2.1], [0.7, -1.4]], D, 0.05)
  // The way in.
  poly(ctx, [[-0.5, 0], [0.5, 0], [0.34, -0.2], [-0.34, -0.2]], R1)
  ctx.fillStyle = M
  ctx.beginPath()
  ctx.moveTo(-0.66, -0.15)
  ctx.lineTo(-0.66, -0.9)
  ctx.arc(0, -0.9, 0.66, Math.PI, 0)
  ctx.lineTo(0.66, -0.15)
  ctx.fill()
  const inside = ctx.createLinearGradient(0, -1.4, 0, -0.15)
  inside.addColorStop(0, "#ff6a3d")
  inside.addColorStop(1, "#c81e17")
  ctx.fillStyle = inside
  ctx.beginPath()
  ctx.moveTo(-0.5, -0.15)
  ctx.lineTo(-0.5, -0.9)
  ctx.arc(0, -0.9, 0.5, Math.PI, 0)
  ctx.lineTo(0.5, -0.15)
  ctx.fill()
  // Racks, their lights going on and off.
  for (let col = 0; col < 4; col++) {
    const x = -0.36 + col * 0.24
    poly(ctx, [[x - 0.085, -0.15], [x - 0.085, -1.02], [x + 0.085, -1.02], [x + 0.085, -0.15]], K)
    for (let row = 0; row < 6; row++) {
      const on = Math.sin(time * (1.3 + col * 0.4) + row * 2.1 + col) > -0.2
      ctx.fillStyle = on ? GLOW : R2
      ctx.fillRect(x - 0.05, -0.95 + row * 0.13, 0.1, 0.045)
    }
  }
  ctx.globalAlpha = 0.1
  disc(ctx, 0, -0.75, 1, HOT)
  ctx.globalAlpha = 1
}

// ── A great tree with a house under it. ───────────────────────────────
function tree(ctx: Ctx, time: number, light: Point) {
  mound(ctx, 2.2, 0.7)
  // House.
  poly(ctx, [[0.9, -0.45], [0.9, -1.05], [2, -1.05], [2, -0.4]], K)
  ctx.save()
  ctx.translate(1.45, 0)
  roof(ctx, -1.02, 1.9, 0.5, 0.5)
  ctx.restore()
  poly(ctx, [[1.1, -0.55], [1.1, -0.88], [1.4, -0.88], [1.4, -0.55]], HOT)
  poly(ctx, [[1.58, -0.5], [1.58, -0.9], [1.82, -0.9], [1.82, -0.48]], HOT)
  lamp(ctx, 0.78, -0.95, 0.05)
  // Trunk and boughs.
  ctx.fillStyle = K
  ctx.beginPath()
  ctx.moveTo(-0.95, -0.55)
  ctx.quadraticCurveTo(-0.55, -1.4, -0.72, -2.6)
  ctx.lineTo(-0.3, -2.6)
  ctx.quadraticCurveTo(-0.2, -1.4, -0.1, -0.62)
  ctx.fill()
  line(ctx, [[-0.5, -2.2], [-1.5, -3.1]], K, 0.16)
  line(ctx, [[-0.45, -2.3], [0.55, -3.2]], K, 0.14)
  // Crown.
  const lumps: [number, number, number][] = [
    [-1.75, -3.25, 0.8],
    [0.85, -3.3, 0.78],
    [-0.5, -3.1, 0.85],
    [-1.2, -4.05, 0.82],
    [0.25, -4.1, 0.86],
    [-0.5, -4.75, 0.8],
    [1.35, -3.9, 0.55],
    [-2.3, -3.8, 0.5],
  ]
  lumps.forEach(([x, y, r], i) => {
    const sway = Math.sin(time * 0.6 + i) * 0.035
    leaf(ctx, x + sway, y, r, light, i % 2 ? R2 : R3, i % 3 ? K : D)
  })
  // Petals.
  for (let i = 0; i < 12; i++) {
    const t = (time * 0.09 + i / 12) % 1
    const x = -2 + ((i * 0.37) % 1) * 3.6 - t * 1.4 + Math.sin(time + i) * 0.12
    const y = -3.6 + t * 3.3
    ctx.globalAlpha = Math.sin(t * Math.PI)
    poly(ctx, [[x, y - 0.07], [x + 0.045, y], [x, y + 0.07], [x - 0.045, y]], i % 3 ? HOT : GLOW)
  }
  ctx.globalAlpha = 1
}

// ── A pagoda: one floor for each station of a career. ─────────────────
function pagoda(ctx: Ctx, time: number, floors: number) {
  mound(ctx, 1.7, 0.45)
  poly(ctx, [[-1.25, -0.25], [1.25, -0.25], [1.1, -0.48], [-1.1, -0.48]], M)
  let y = -0.48
  for (let i = 0; i < floors; i++) {
    const wide = 1.5 - i * 0.2
    const next = 1.5 - (i + 1) * 0.2
    const high = 0.52
    poly(ctx, [[-wide / 2, y], [-wide / 2, y - high], [wide / 2, y - high], [wide / 2, y]], K)
    line(ctx, [[-wide / 2, y], [-wide / 2, y - high]], R1, 0.03)
    for (const x of [-wide * 0.28, 0, wide * 0.28]) {
      ctx.fillStyle = HOT
      ctx.globalAlpha = 0.65 + 0.35 * Math.sin(time * 1.5 + i * 1.3 + x * 4)
      ctx.fillRect(x - 0.07, y - high * 0.74, 0.14, high * 0.44)
    }
    ctx.globalAlpha = 1
    y -= high
    roof(ctx, y, wide + 1.25, i === floors - 1 ? 0.08 : next, i === floors - 1 ? 0.75 : 0.34)
    y -= i === floors - 1 ? 0.75 : 0.34
  }
  // Spire.
  line(ctx, [[0, y + 0.05], [0, y - 1.1]], K, 0.06)
  for (let k = 0; k < 4; k++) disc(ctx, 0, y - 0.25 - k * 0.2, 0.11 - k * 0.015, K)
  lamp(ctx, 0, y - 1.1, 0.05, 0.6 + 0.4 * Math.sin(time * 2))
}

// ── A pavilion letting lanterns go. ───────────────────────────────────
function lanterns(ctx: Ctx, time: number) {
  mound(ctx, 1.6, 0.35)
  for (const x of [-0.8, -0.3, 0.3, 0.8]) line(ctx, [[x, -0.3], [x, -1.25]], K, 0.07)
  poly(ctx, [[-1.05, -0.2], [1.05, -0.2], [0.95, -0.36], [-0.95, -0.36]], M)
  roof(ctx, -1.22, 2.7, 0.3, 0.75)
  lamp(ctx, 0, -0.85, 0.09)
  for (let i = 0; i < 16; i++) {
    const t = (time * (0.035 + (i % 5) * 0.006) + i / 16) % 1
    const x = -3 + ((i * 0.618) % 1) * 6 + Math.sin(time * 0.5 + i * 1.9) * 0.25
    const y = -1.4 - t * 6.4
    const size = 0.2 + ((i * 0.37) % 1) * 0.14
    ctx.globalAlpha = Math.min(1, Math.sin(t * Math.PI) * 1.6)
    ctx.save()
    ctx.translate(x, y)
    ctx.rotate(Math.sin(time * 0.8 + i) * 0.12)
    const paper = ctx.createLinearGradient(0, -size, 0, size)
    paper.addColorStop(0, "#c81e17")
    paper.addColorStop(1, "#ffc29a")
    ctx.fillStyle = paper
    ctx.beginPath()
    ctx.moveTo(-size * 0.62, -size)
    ctx.lineTo(size * 0.62, -size)
    ctx.lineTo(size * 0.46, size)
    ctx.lineTo(-size * 0.46, size)
    ctx.fill()
    ctx.restore()
    ctx.globalAlpha *= 0.14
    disc(ctx, x, y, size * 2.6, HOT)
  }
  ctx.globalAlpha = 1
}

// ── The shrine gate, standing across the path. ────────────────────────
/** `hang` fades the rope: flown through, its streamers would brush the lens. */
function torii(ctx: Ctx, time: number, hang: number) {
  // Steps.
  for (let i = 0; i < 3; i++) {
    const wide = 2.5 - i * 0.28
    const y = -i * 0.09
    poly(ctx, [[-wide, y], [wide, y], [wide - 0.1, y - 0.09], [-wide + 0.1, y - 0.09]], i % 2 ? M : D)
    line(ctx, [[-wide + 0.1, y - 0.09], [wide - 0.1, y - 0.09]], R1, 0.025)
  }
  const foot = -0.27
  for (const side of [-1, 1]) {
    const x = side * 1.5
    const lean = -side * 0.08
    // Pillar, with the light along its edges.
    poly(ctx, [[x - 0.17, foot], [x - 0.13 + lean, -3.3], [x + 0.13 + lean, -3.3], [x + 0.17, foot]], K)
    line(ctx, [[x - side * 0.17, foot], [x - side * 0.13 + lean, -3.3]], R3, 0.045)
    line(ctx, [[x + side * 0.17, foot], [x + side * 0.13 + lean, -3.3]], R2, 0.03)
    poly(ctx, [[x - 0.24, foot], [x - 0.22, foot - 0.3], [x + 0.22, foot - 0.3], [x + 0.24, foot]], K)
  }
  // Tie beam, strut and tablet.
  poly(ctx, [[-2, -2.75], [2, -2.75], [2, -2.52], [-2, -2.52]], K)
  line(ctx, [[-2, -2.52], [2, -2.52]], R3, 0.04)
  poly(ctx, [[-0.2, -3.3], [0.2, -3.3], [0.2, -2.75], [-0.2, -2.75]], K)
  poly(ctx, [[-0.15, -3.22], [0.15, -3.22], [0.15, -2.83], [-0.15, -2.83]], R3)
  // Lintel, its ends turned up.
  ctx.fillStyle = K
  ctx.beginPath()
  ctx.moveTo(-2.55, -3.62)
  ctx.quadraticCurveTo(0, -3.3, 2.55, -3.62)
  ctx.lineTo(2.62, -3.95)
  ctx.quadraticCurveTo(0, -3.62, -2.62, -3.95)
  ctx.fill()
  ctx.strokeStyle = R3
  ctx.lineWidth = 0.05
  ctx.beginPath()
  ctx.moveTo(-2.55, -3.62)
  ctx.quadraticCurveTo(0, -3.3, 2.55, -3.62)
  ctx.stroke()
  poly(ctx, [[-2.2, -3.48], [2.2, -3.48], [2.15, -3.3], [-2.15, -3.3]], K)
  // The rope with its paper streamers.
  if (hang <= 0) return stoneLanterns(ctx)
  const alpha = ctx.globalAlpha
  ctx.globalAlpha = alpha * hang
  ctx.strokeStyle = GLOW
  ctx.lineWidth = 0.05
  ctx.beginPath()
  ctx.moveTo(-1.35, -2.5)
  ctx.quadraticCurveTo(0, -2.22, 1.35, -2.5)
  ctx.stroke()
  for (let i = 0; i < 5; i++) {
    const x = -0.9 + i * 0.45
    const y = -2.5 + (1 - (x / 1.35) ** 2) * 0.14
    const sway = Math.sin(time * 1.3 + i * 1.2) * 0.05
    poly(
      ctx,
      [[x - 0.05, y], [x + 0.05, y], [x + 0.09 + sway, y + 0.14], [x + sway, y + 0.14], [x + 0.06 + sway * 2, y + 0.3], [x - 0.07 + sway * 2, y + 0.3], [x - 0.03 + sway, y + 0.16], [x - 0.09 + sway, y + 0.16]],
      PAPER,
    )
  }
  ctx.globalAlpha = alpha
  stoneLanterns(ctx)
}

/** Stone lanterns to either side of the gate. */
function stoneLanterns(ctx: Ctx) {
  for (const side of [-1, 1]) {
    const x = side * 2.9
    poly(ctx, [[x - 0.2, 0], [x + 0.2, 0], [x + 0.09, -0.85], [x - 0.09, -0.85]], K)
    poly(ctx, [[x - 0.2, -0.85], [x + 0.2, -0.85], [x + 0.2, -1.22], [x - 0.2, -1.22]], K)
    poly(ctx, [[x - 0.12, -0.92], [x + 0.12, -0.92], [x + 0.12, -1.15], [x - 0.12, -1.15]], HOT)
    poly(ctx, [[x - 0.34, -1.22], [x + 0.34, -1.22], [x, -1.55]], K)
  }
}

/**
 * Draws a landmark with its foot at (x, y) on the canvas, `scale` pixels to
 * the world unit. `light` is where the sun stands on the canvas; `floors`
 * is the pagoda's height, `hang` (0..1) how much of the gate's rope shows.
 */
export function drawLandmark(
  ctx: Ctx,
  kind: LandmarkKind,
  x: number,
  y: number,
  scale: number,
  time: number,
  light: { x: number; y: number },
  floors = 4,
  hang = 1,
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale, scale)
  const local: Point = [(light.x - x) / scale, (light.y - y) / scale]
  switch (kind) {
    case "windmill":
      windmill(ctx, time)
      break
    case "mast":
      mast(ctx, time)
      break
    case "observatory":
      observatory(ctx, time)
      break
    case "airship":
      airship(ctx, time)
      break
    case "mountain":
      ctx.scale(0.82, 0.82)
      mountain(ctx, time)
      break
    case "tree":
      tree(ctx, time, local)
      break
    case "pagoda":
      pagoda(ctx, time, Math.max(3, Math.min(5, floors)))
      break
    case "lanterns":
      lanterns(ctx, time)
      break
    case "torii":
      torii(ctx, time, hang)
      break
  }
  ctx.restore()
}

/** A small tree for the fields: round or pointed. */
export function drawTree(
  ctx: Ctx,
  x: number,
  y: number,
  scale: number,
  size: number,
  pointed: boolean,
  light: { x: number; y: number },
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale * size, scale * size)
  const local: Point = [(light.x - x) / (scale * size), (light.y - y) / (scale * size)]
  ctx.fillStyle = K
  ctx.fillRect(-0.05, -0.55, 0.1, 0.55)
  if (pointed) {
    for (let i = 0; i < 3; i++) {
      const base = -0.3 - i * 0.42
      const wide = 0.5 - i * 0.11
      poly(ctx, [[-wide, base], [0, base - 0.72], [wide, base]], K)
      line(ctx, [[-wide, base], [0, base - 0.72]], R1, 0.035)
    }
  } else {
    leaf(ctx, -0.26, -0.85, 0.4, local, R1)
    leaf(ctx, 0.28, -0.9, 0.38, local, R1)
    leaf(ctx, 0, -1.25, 0.44, local, R2)
  }
  ctx.restore()
}

/** A stone lantern beside the path. */
export function drawLantern(ctx: Ctx, x: number, y: number, scale: number, on: number) {
  ctx.save()
  ctx.translate(x, y)
  ctx.scale(scale * 0.75, scale * 0.75)
  poly(ctx, [[-0.07, 0], [0.07, 0], [0.04, -0.5], [-0.04, -0.5]], K)
  poly(ctx, [[-0.12, -0.5], [0.12, -0.5], [0.12, -0.72], [-0.12, -0.72]], K)
  ctx.globalAlpha = 0.5 + 0.5 * on
  poly(ctx, [[-0.07, -0.54], [0.07, -0.54], [0.07, -0.68], [-0.07, -0.68]], HOT)
  ctx.globalAlpha = 1
  poly(ctx, [[-0.2, -0.72], [0.2, -0.72], [0, -0.92]], K)
  ctx.restore()
}
