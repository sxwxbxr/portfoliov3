"use client"

import { useRef } from "react"
import type { MotionValue } from "framer-motion"
import { BANKS, INK, paintAir, paintBanks, paintPuff, paintSky, seeded, useScene, wrap } from "./InkScene"
import { flight, type Route } from "./journey"
import { drawLandmark, drawLantern, drawTree, type LandmarkKind } from "./landmarks"
import { cruiseAt, heightAt, rowAt, type Feature, type Land, type Row } from "./terrain"

/**
 * The picture behind the home page's flight, drawn live on a canvas in the
 * style of InkScene: above the sea of clouds, down through it, low over a
 * landscape with one landmark per station, through the shrine gate and up
 * again. Where the camera is comes from journey.ts; this file only draws.
 *
 * Purely decorative. With `still` it paints the opening picture once.
 */

export interface SceneStation {
  kind: LandmarkKind
  /** Height of a pagoda. */
  floors?: number
}

/** Cruising height over the ground, in world units. */
const CAMERA = 2
/** Where the underside of the clouds rests, in frame heights. */
const CEILING = 0.13
const CELL = 3
const PATH = 0.75
const HORIZON = 70
/** How close the nearest row of land is drawn, and how many points make a row. */
const NEAREST = 0.5
const COLUMNS = 36

/** How far to the side of the path each landmark stands: [wide, narrow]. */
const ASIDE: Record<LandmarkKind, [number, number]> = {
  windmill: [2.7, 2.4],
  mast: [2, 1.6],
  observatory: [3.3, 2.9],
  airship: [1.8, 1.2],
  mountain: [4.2, 3.7],
  bridge: [3.3, 2.9],
  storehouses: [3.6, 3.2],
  tree: [3.1, 2.7],
  pagoda: [2.8, 2.4],
  lanterns: [2.8, 2.5],
  torii: [0, 0],
}

/** What the ground does around a landmark. */
const RELIEF: Partial<Record<LandmarkKind, Feature["shape"]>> = {
  windmill: "knoll",
  observatory: "knoll",
  storehouses: "knoll",
  pagoda: "knoll",
  tree: "knoll",
  mountain: "massif",
}

/** Colour of the land `d` away: lit at the horizon, dark underfoot. */
const SHADES: [number, number[]][] = [
  [0, [122, 13, 18]],
  [0.1, [43, 6, 8]],
  [0.5, [28, 6, 7]],
  [1, [13, 3, 4]],
]
function shade(d: number, dim: boolean): number[] {
  const at = Math.min(1, 3.6 / d)
  let i = 1
  while (i < SHADES.length - 1 && SHADES[i][0] < at) i++
  const [a, from] = SHADES[i - 1]
  const [b, to] = SHADES[i]
  const t = (at - a) / (b - a)
  const k = dim ? 0.8 : 1
  return from.map((v, c) => (v + (to[c] - v) * t) * k)
}
/** The light a crest catches. */
const RIM = [143, 16, 22]
const rgb = (c: number[]) => `rgb(${Math.round(c[0])},${Math.round(c[1])},${Math.round(c[2])})`

function ridge(seed: number, points: number, rough: number) {
  const rand = seeded(seed)
  const heights: number[] = []
  let level = 0.5
  for (let i = 0; i < points; i++) {
    level = Math.max(0.12, Math.min(1, level + (rand() - 0.5) * rough))
    heights.push(i % 2 ? level : level * (0.72 + rand() * 0.2))
  }
  return heights
}
const FAR_RIDGE = ridge(41, 46, 0.55)
const NEAR_RIDGE = ridge(73, 64, 0.4)

const TILE = 48
const TREES = (() => {
  const rand = seeded(19)
  return Array.from({ length: 64 }, () => {
    const side = rand() > 0.5 ? 1 : -1
    return {
      x: side * (1.9 + Math.pow(rand(), 1.5) * 19),
      z: rand() * TILE,
      size: 0.8 + rand() * 1,
      pointed: rand() > 0.55,
    }
  })
})()

const WISPS = (() => {
  const rand = seeded(57)
  return Array.from({ length: 16 }, () => ({
    x: rand(),
    y: rand(),
    r: 0.1 + rand() * 0.2,
    phase: rand() * Math.PI * 2,
  }))
})()

const noise = (a: number, b: number) => Math.abs(Math.sin(a * 127.1 + b * 311.7) * 43758.5453) % 1
const smooth = (v: number) => {
  const t = Math.max(0, Math.min(1, v))
  return t * t * (3 - 2 * t)
}

/** A range of hills along the horizon, lower where the sun stands. */
function paintRidge(
  ctx: CanvasRenderingContext2D,
  w: number,
  yh: number,
  heights: number[],
  tall: number,
  fill: string,
  sunX: number,
) {
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.moveTo(-w * 0.1, yh + 1)
  heights.forEach((height, i) => {
    const x = -w * 0.1 + (i / (heights.length - 1)) * w * 1.2
    const gap = 0.3 + 0.7 * Math.min(1, Math.abs(x - sunX) / (w * 0.28))
    ctx.lineTo(x, yh - height * tall * gap)
  })
  ctx.lineTo(w * 1.1, yh + 1)
  ctx.fill()
}

/** The underside of the clouds: two layers of smoke hanging from `yc`. */
function paintCeiling(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  u: number,
  time: number,
  yc: number,
  light: { x: number; y: number },
) {
  const layers = [
    { bank: BANKS[1], y: yc + h * 0.07, size: 0.5 },
    { bank: BANKS[2], y: yc, size: 0.62 },
  ]
  for (const { bank, y, size } of layers) {
    for (const puff of bank.puffs) {
      const x = wrap(puff.x + time * bank.drift, -0.3, 1.3) * w
      const hang = (bank.floor - puff.y) * u * size * 0.8
      const r = puff.r * u * size * (1 + 0.06 * Math.sin(time * 0.5 + puff.phase))
      paintPuff(ctx, x, y + hang, r, bank.rim, bank.fill, light)
    }
    ctx.fillStyle = bank.fill
    ctx.fillRect(0, -h, w, y + h)
  }
}

function paintWorld(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  z: number,
  /** 0 just under the clouds, 1 at cruising height. */
  low: number,
  route: Route,
  stations: SceneStation[],
) {
  const wide = w > 760
  const focal = 0.9 * Math.min(h, w * 1.15)
  // On a narrow screen the sheets lie across the bottom, so the land sits higher.
  const yh = h * (wide ? 0.5 : 0.32)
  const side = wide ? 0 : 1
  const land: Land = {
    shrine: route.shrine,
    features: stations.map((station, i) => ({
      z: route.stations[i],
      x: ASIDE[station.kind][side],
      shape: RELIEF[station.kind] ?? "level",
    })),
  }
  // The camera keeps its height over the path, wherever the path goes.
  const cam = cruiseAt(z, land, CAMERA) + (1 - low) * 2.6
  // The gate is flown through, so the view centres on it at the end.
  const toGate = route.shrine - z
  const centred = smooth((6 - toGate) / 5)
  const vpX = w * ((wide ? 0.62 : 0.38) * (1 - centred) + 0.5 * centred)
  const yOf = (height: number, d: number) => yh + (focal * (cam - height)) / d
  const xAt = (x: number, d: number) => vpX + (focal * x) / d

  // ── Sky under the clouds, and the low sun.
  const sky = ctx.createLinearGradient(0, 0, 0, yh)
  sky.addColorStop(0, "#120405")
  sky.addColorStop(0.5, "#4a080c")
  sky.addColorStop(1, "#a8161a")
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, yh + 1)

  const sunR = Math.min(w, h) * 0.2
  const sun = { x: vpX, y: yh - sunR * 0.22 }
  const glow = ctx.createRadialGradient(sun.x, sun.y, sunR * 0.5, sun.x, sun.y, sunR * 3.4)
  glow.addColorStop(0, "rgba(255, 96, 58, 0.5)")
  glow.addColorStop(1, "rgba(255, 96, 58, 0)")
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, yh + 1)
  const face = ctx.createLinearGradient(0, sun.y - sunR, 0, sun.y + sunR)
  face.addColorStop(0, "#f0452f")
  face.addColorStop(1, "#b3151a")
  ctx.fillStyle = face
  ctx.beginPath()
  ctx.arc(sun.x, sun.y, sunR, 0, Math.PI * 2)
  ctx.fill()
  // Haze across it.
  ctx.fillStyle = "#8f1016"
  for (const [at, thick, pace] of [
    [0.1, 0.05, 0.8],
    [0.38, 0.08, -0.5],
  ]) {
    const shift = Math.sin(time * 0.1 * pace + at * 9) * sunR * 0.2
    const half = sunR * thick * 0.5
    ctx.beginPath()
    ctx.roundRect(sun.x - sunR * 1.5 + shift, sun.y + sunR * at - half, sunR * 3, half * 2, half)
    ctx.fill()
  }

  paintRidge(ctx, w, yh, FAR_RIDGE, h * 0.15, "#7a0d12", sun.x)
  paintRidge(ctx, w, yh, NEAR_RIDGE, h * 0.085, "#4a080c", sun.x)

  // Birds, crossing.
  ctx.strokeStyle = "#0b0304"
  ctx.lineWidth = Math.max(1, h * 0.0022)
  ctx.lineCap = "round"
  const flockX = wrap(1 - time * 0.012, -0.2, 1.2) * w
  const flockY = yh * 0.52 + Math.sin(time * 0.3) * h * 0.012
  ctx.beginPath()
  for (let i = 0; i < 7; i++) {
    const rank = Math.ceil(i / 2)
    const bx = flockX + rank * h * 0.024
    const by = flockY + (i % 2 ? 1 : -1) * rank * h * 0.012
    const flap = Math.sin(time * 5 + i * 1.3) * h * 0.006
    const span = h * 0.011
    ctx.moveTo(bx - span, by - flap)
    ctx.lineTo(bx, by)
    ctx.lineTo(bx + span, by - flap)
  }
  ctx.stroke()

  // ── Ground. Far away it is a lit plain; nearer, the land is drawn row by
  //    row from the back, so every rise hides what lies behind it.
  const ground = ctx.createLinearGradient(0, yh, 0, h)
  ground.addColorStop(0, "#7a0d12")
  ground.addColorStop(0.1, "#2b0608")
  ground.addColorStop(1, "#1c0607")
  ctx.fillStyle = ground
  ctx.fillRect(0, yh, w, h - yh)

  // Rows stand on whole world units, so the land holds still as the camera
  // moves over it. They thin out with distance.
  const rows: Row[] = []
  for (let r = Math.floor(z + HORIZON); r - z >= NEAREST; r--) {
    const d = r - z
    if ((d > 22 && r % 2) || (d > 42 && r % 4)) continue
    rows.push(rowAt(r, land))
  }
  // The last strip runs out under the camera.
  rows.push(rowAt(z + NEAREST * 0.8, land))

  // Everything that stands on the ground, far to near, drawn between the rows.
  type Item = { d: number; draw: () => void }
  const items: Item[] = []
  const footAt = (x: number, at: number) => yOf(heightAt(x, rowAt(at, land)), at - z)

  stations.forEach((station, i) => {
    const at = route.stations[i]
    const d = at - z
    if (d < 0.5 || d > HORIZON) return
    const x = ASIDE[station.kind][side]
    items.push({
      d,
      draw: () => drawLandmark(ctx, station.kind, xAt(x, d), footAt(x, at), focal / d, time, sun, station.floors),
    })
  })
  if (toGate > 0.3 && toGate < HORIZON) {
    // The rope is gone before the camera reaches it.
    const hang = smooth((toGate - 1.4) / 1.8)
    items.push({
      d: toGate,
      draw: () => drawLandmark(ctx, "torii", vpX, footAt(0, route.shrine), focal / toGate, time, sun, 4, hang),
    })
  }

  const tile = Math.floor(z / TILE) * TILE
  for (const start of [tile, tile + TILE]) {
    for (const t of TREES) {
      const at = start + t.z
      const d = at - z
      if (d < 0.6 || d > 46) continue
      // Nothing grows where a landmark stands, or beyond the gate's steps.
      if (t.x > 0 && route.stations.some((s) => Math.abs(s - at) < 5)) continue
      if (at > route.shrine - 2.5 && Math.abs(t.x) < 4.5) continue
      items.push({
        d,
        draw: () => {
          ctx.globalAlpha = smooth((46 - d) / 12)
          drawTree(ctx, xAt(t.x, d), footAt(t.x, at), focal / d, t.size, t.pointed, sun)
          ctx.globalAlpha = 1
        },
      })
    }
  }
  for (let post = Math.ceil(z / 4) * 4; post < z + 40; post += 4) {
    const d = post - z
    if (d < 0.5 || post > route.shrine - 3) continue
    for (const x of [-1.05, 1.05]) {
      items.push({
        d,
        draw: () => drawLantern(ctx, xAt(x, d), footAt(x, post), focal / d, 0.5 + 0.5 * Math.sin(time * 2 + post + x)),
      })
    }
  }
  items.sort((a, b) => b.d - a.d)
  let next = 0

  const left = -40
  const step = (w + 80) / (COLUMNS - 1)
  let line = new Float32Array(COLUMNS)
  let under = new Float32Array(COLUMNS)
  const trace = (row: Row, into: Float32Array) => {
    const d = row.z - z
    for (let i = 0; i < COLUMNS; i++) into[i] = yOf(heightAt(((left + i * step - vpX) * d) / focal, row), d)
  }

  for (let i = 0; i < rows.length - 1; i++) {
    const far = rows[i]
    const near = rows[i + 1]
    const dFar = far.z - z
    const dNear = near.z - z
    // Each row is filled only down to where the next one takes over, so
    // steep ground costs no more than flat ground.
    if (i === 0) trace(far, line)
    if (i === rows.length - 2) under.fill(h)
    else trace(near, under)
    const r = Math.round(far.z)

    // The crest catches the light: the row is laid down once in that light
    // and again, a little lower, in its own colour. Two fills cost far less
    // than stroking the line.
    const body = shade(dFar, dFar <= 42 && (r >> 1) % 2 === 0)
    const lit = Math.max(0.22, Math.min(1, 9 / dFar) * 0.7)
    const rim = Math.max(1, (focal * 0.03) / dFar)
    for (const [colour, drop] of [
      [rgb(body.map((v, c) => v + (RIM[c] - v) * lit)), 0],
      [rgb(body), rim],
    ] as const) {
      ctx.fillStyle = colour
      ctx.beginPath()
      for (let c = 0; c < COLUMNS; c++) ctx.lineTo(left + c * step, line[c] + drop)
      for (let c = COLUMNS - 1; c >= 0; c--) ctx.lineTo(left + c * step, Math.max(line[c] + drop, under[c] + 2))
      ctx.fill()
    }

    // The valley floor between this row and the next.
    const inner = Math.min(far.left, near.left)
    const outer = Math.min(far.right, near.right)
    const corner = (x: number, row: Row, d: number) => ctx.lineTo(xAt(x, d), yOf(heightAt(x, row), d))
    // Flooded fields mirror the sky.
    const field = Math.floor((r - 1) / 2)
    for (let col = -1; col <= 2; col++) {
      const x0 = col * CELL - CELL / 2
      const x1 = x0 + CELL
      if (col === 0 || x0 < -inner || x1 > outer || noise(col, field) > 0.4) continue
      ctx.globalAlpha = Math.min(1, 9 / dFar) * 0.7
      ctx.fillStyle = "#5d0a0f"
      ctx.beginPath()
      corner(x0, far, dFar)
      corner(x1, far, dFar)
      corner(x1, near, dNear)
      corner(x0, near, dNear)
      ctx.fill()
    }
    // Field edges, running away from the camera.
    if (dFar < 30) {
      ctx.strokeStyle = "#5d0a0f"
      ctx.lineWidth = 1
      ctx.globalAlpha = 0.4
      ctx.beginPath()
      for (let col = -1; col <= 3; col++) {
        const x = col * CELL - CELL / 2
        if (x < -inner || x > outer) continue
        ctx.moveTo(xAt(x, dFar), yOf(heightAt(x, far), dFar))
        corner(x, near, dNear)
      }
      ctx.stroke()
    }

    // The path to the shrine, as far as the gate's steps.
    if (far.z <= route.shrine + 1) {
      const yFar = yOf(far.floor, dFar)
      const yNear = yOf(near.floor, dNear)
      // Laid down twice: a hair wider in the colour of its lit edge, then itself.
      ctx.globalAlpha = 1
      for (const [colour, wider] of [
        ["#75101a", 1.5],
        ["#3c070a", 0],
      ] as const) {
        ctx.fillStyle = colour
        ctx.beginPath()
        ctx.moveTo(xAt(-PATH, dFar) - wider, yFar)
        ctx.lineTo(xAt(PATH, dFar) + wider, yFar)
        ctx.lineTo(xAt(PATH, dNear) + wider, yNear)
        ctx.lineTo(xAt(-PATH, dNear) - wider, yNear)
        ctx.fill()
      }
      if (dFar < 40) {
        const half = (focal * PATH) / dFar
        ctx.fillStyle = INK
        ctx.globalAlpha = Math.min(1, 8 / dFar) * 0.5
        ctx.fillRect(vpX - half, yFar, half * 2, Math.max(1, (focal * 0.025) / dFar))
      }
    }
    ctx.globalAlpha = 1

    while (next < items.length && items[next].d > dNear) items[next++].draw()
    ;[line, under] = [under, line]
  }
  while (next < items.length) items[next++].draw()

  // A wash where the type stands.
  if (wide) {
    const wash = ctx.createLinearGradient(0, 0, w * 0.6, 0)
    wash.addColorStop(0, "rgba(7, 3, 4, 0.62)")
    wash.addColorStop(1, "rgba(7, 3, 4, 0)")
    ctx.fillStyle = wash
    ctx.fillRect(0, 0, w * 0.6, h)
  }

  return sun
}

function paintJourney(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  progress: number,
  velocity: number,
  route: Route,
  stations: SceneStation[],
) {
  const { z, depth } = flight(progress, route)
  const u = Math.min(h, w * 2.2)
  const top = h - u

  if (depth < 1) {
    // Above the clouds, or sinking into them: the tops pass upwards and the
    // disc goes with them.
    const disc = { x: w * 0.7, y: top + u * (0.47 - depth * 0.95), r: Math.min(w, u) * 0.25 }
    paintSky(ctx, w, h, disc, time)
    const rises = [0.55, 0.9, 1.35]
    paintBanks(ctx, w, h, top, u, time, (i) => depth * rises[i] * u, disc)
  } else {
    const low = depth - 1
    const sun = paintWorld(ctx, w, h, time, z, low, route, stations)
    paintCeiling(ctx, w, h, u, time, h * (1.4 - (1.4 - CEILING) * low), sun)
  }

  // Inside the layer, smoke streams past.
  const inside = 1 - Math.abs(depth - 1) / 0.55
  if (inside > 0) {
    ctx.globalAlpha = Math.min(1, inside * 1.4)
    for (const wisp of WISPS) {
      const x = (wisp.x + Math.sin(time * 0.3 + wisp.phase) * 0.02) * w
      const y = wrap(wisp.y - depth * 2.4, -0.35, 1.35) * h
      paintPuff(ctx, x, y, wisp.r * u, "#4a080c", "#1c0607", { x: w * 0.6, y: h * 2 })
    }
    ctx.globalAlpha = 1
  }

  // Six times round over the journey, so the last frame matches the first.
  paintAir(ctx, w, h, time, progress * 6.6, velocity)
}

export default function JourneyScene({
  progress,
  velocity,
  still,
  route,
  stations,
  className,
}: {
  progress: MotionValue<number>
  velocity: MotionValue<number>
  still: boolean
  route: Route
  stations: SceneStation[]
  className?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  useScene(
    ref,
    (ctx, width, height, time) =>
      paintJourney(ctx, width, height, time, still ? 0 : progress.get(), still ? 0 : velocity.get(), route, stations),
    still,
  )

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
