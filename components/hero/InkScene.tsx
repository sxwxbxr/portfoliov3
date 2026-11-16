"use client"

import { useEffect, useRef } from "react"
import type { MotionValue } from "framer-motion"

/**
 * The picture behind the home stage, drawn live on a canvas: banks of
 * cel-shaded smoke in flat reds on black, a low red disc cut by
 * cloud bars, and sparks rising through it. It is drawn here, not loaded,
 * so it stays sharp at any size and can answer the scroll:
 *
 * - `progress` (0..1 along the stage's journey) lifts the banks at
 *   different rates and raises the disc, so the scene has depth.
 * - `velocity` (px/s, smoothed) stretches the sparks and pulls speed lines
 *   down the frame while the page is moving.
 *
 * Purely decorative. With `still` it paints one frame and stops.
 */

export const INK = "#070304"
export const PAPER = "#f4f4f1"

/** Small seeded generator, so the scene is the same on every visit. */
export function seeded(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface Puff {
  /** Centre, x in frame widths and y in scene heights. */
  x: number
  y: number
  /** Radius in scene heights. */
  r: number
  phase: number
}

interface Bank {
  puffs: Puff[]
  /** Top of the solid mass under the puffs, in scene heights. */
  floor: number
  rim: string
  fill: string
  /** Sideways drift in frame widths per second. */
  drift: number
  /** How far the bank rises over the whole journey, in scene heights. */
  lift: number
}

/** A bank is a row of mounds, each a pile of circles that thins upwards. */
function bank(
  seed: number,
  floor: number,
  size: number,
  tones: [string, string],
  drift: number,
  lift: number,
): Bank {
  const rand = seeded(seed)
  const puffs: Puff[] = []
  for (let x = -0.25; x < 1.25; x += size * (0.5 + rand() * 0.5)) {
    const height = size * (0.5 + rand() * 1.1)
    const count = 7 + Math.floor(rand() * 6)
    for (let k = 0; k < count; k++) {
      const up = Math.pow(rand(), 1.6)
      puffs.push({
        x: x + (rand() - 0.5) * size * 0.9 * (1 - up * 0.5),
        y: floor - up * height,
        r: size * (0.2 + rand() * 0.22) * (1 - up * 0.45),
        phase: rand() * Math.PI * 2,
      })
    }
  }
  // A row along the floor, so the solid mass below never shows a straight edge.
  for (let x = -0.3; x < 1.3; x += size * 0.3) {
    puffs.push({
      x: x + (rand() - 0.5) * size * 0.1,
      y: floor + size * 0.04,
      r: size * (0.26 + rand() * 0.1),
      phase: rand() * Math.PI * 2,
    })
  }
  // Tall puffs first, so the lower ones overlap them.
  puffs.sort((a, b) => a.y - b.y)
  return { puffs, floor, rim: tones[0], fill: tones[1], drift, lift }
}

export const BANKS: Bank[] = [
  bank(11, 0.66, 0.2, ["#5d0a0f", "#2b0608"], 0.004, 0.1),
  bank(23, 0.86, 0.26, ["#8f1016", "#3c070a"], -0.007, 0.24),
  bank(37, 1.08, 0.34, ["#4a080c", "#120405"], 0.011, 0.42),
]

interface Spark {
  x: number
  y: number
  size: number
  rise: number
  phase: number
  hot: boolean
}

const SPARKS: Spark[] = (() => {
  const rand = seeded(5)
  return Array.from({ length: 64 }, () => ({
    x: rand(),
    y: rand(),
    size: 1 + rand() * 2.6,
    rise: 0.02 + rand() * 0.05,
    phase: rand() * Math.PI * 2,
    hot: rand() > 0.6,
  }))
})()

const LINES = (() => {
  const rand = seeded(9)
  return Array.from({ length: 34 }, () => ({
    x: rand(),
    y: rand(),
    length: 0.12 + rand() * 0.3,
    width: 0.6 + rand() * 1.8,
  }))
})()

export const wrap = (value: number, min: number, max: number) => {
  const span = max - min
  return ((((value - min) % span) + span) % span) + min
}

export interface Disc {
  x: number
  y: number
  r: number
}

/** The night sky with the disc and the cloud bars across its lower half. */
export function paintSky(ctx: CanvasRenderingContext2D, w: number, h: number, disc: Disc, time: number) {
  ctx.fillStyle = INK
  ctx.fillRect(0, 0, w, h)

  const glow = ctx.createRadialGradient(disc.x, disc.y, disc.r * 0.6, disc.x, disc.y, disc.r * 3.4)
  glow.addColorStop(0, "rgba(120, 12, 18, 0.55)")
  glow.addColorStop(1, "rgba(120, 12, 18, 0)")
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, w, h)

  const face = ctx.createLinearGradient(0, disc.y - disc.r, 0, disc.y + disc.r)
  face.addColorStop(0, "#c81e17")
  face.addColorStop(1, "#6f0b10")
  ctx.fillStyle = face
  ctx.beginPath()
  ctx.arc(disc.x, disc.y, disc.r, 0, Math.PI * 2)
  ctx.fill()

  // Cloud bars, drifting slowly against each other.
  ctx.fillStyle = INK
  const bars = [
    [0.18, 0.05, 0.9],
    [0.42, 0.09, -0.6],
    [0.7, 0.14, 0.4],
  ]
  for (const [at, thick, pace] of bars) {
    const shift = Math.sin(time * 0.12 * pace + at * 9) * disc.r * 0.18
    const y = disc.y + disc.r * at
    const half = disc.r * thick * 0.5
    ctx.beginPath()
    ctx.roundRect(disc.x - disc.r * 1.5 + shift, y - half, disc.r * 3, half * 2, half)
    ctx.fill()
  }
}

/** One lump of smoke: a lit disc, and the body pushed away from the light
 *  so the light shows as a crescent on the side that faces it. */
export function paintPuff(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  rim: string,
  fill: string,
  light: { x: number; y: number },
) {
  const dx = x - light.x
  const dy = y - light.y
  const far = Math.hypot(dx, dy) || 1
  ctx.fillStyle = rim
  ctx.beginPath()
  ctx.arc(x, y, r, 0, Math.PI * 2)
  ctx.fill()
  ctx.fillStyle = fill
  ctx.beginPath()
  ctx.arc(x + (dx / far) * r * 0.16, y + (dy / far) * r * 0.16, r * 0.95, 0, Math.PI * 2)
  ctx.fill()
}

/**
 * The banks of smoke, far to near, each lifted by `rise(index)` pixels.
 * Drawn back to front, so the lumps overlap like smoke in a drawn film.
 * `top` and `u` place the scene: see paint().
 */
export function paintBanks(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  top: number,
  u: number,
  time: number,
  rise: (index: number) => number,
  light: { x: number; y: number },
) {
  BANKS.forEach((b, index) => {
    const lifted = rise(index)
    for (const puff of b.puffs) {
      const x = wrap(puff.x + time * b.drift, -0.3, 1.3) * w
      const y = top + puff.y * u - lifted
      const r = puff.r * u * (1 + 0.06 * Math.sin(time * 0.5 + puff.phase))
      paintPuff(ctx, x, y, r, b.rim, b.fill, light)
    }
    ctx.fillStyle = b.fill
    ctx.fillRect(0, top + b.floor * u - lifted, w, h + lifted)
  })
}

/**
 * Sparks: small diamonds that rise and, while the page moves, stretch into
 * streaks against the direction of travel. `shift` moves them all up, in
 * frame heights. Speed lines only while scrolling.
 */
export function paintAir(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  shift: number,
  velocity: number,
) {
  const pull = Math.max(-1, Math.min(1, velocity / 2400))
  for (const spark of SPARKS) {
    const x = (spark.x + Math.sin(time * 0.4 + spark.phase) * 0.012) * w
    const y = wrap(spark.y - time * spark.rise - shift, -0.05, 1.05) * h
    const flicker = 0.45 + 0.55 * Math.abs(Math.sin(time * 1.7 + spark.phase))
    const stretch = spark.size + Math.abs(pull) * 46
    ctx.globalAlpha = flicker
    ctx.fillStyle = spark.hot ? "#ff6a3d" : "#d4241b"
    ctx.beginPath()
    ctx.moveTo(x, y - stretch)
    ctx.lineTo(x + spark.size * 0.7, y)
    ctx.lineTo(x, y + stretch)
    ctx.lineTo(x - spark.size * 0.7, y)
    ctx.fill()
  }

  const rush = Math.abs(pull)
  if (rush > 0.02) {
    ctx.strokeStyle = PAPER
    ctx.lineCap = "round"
    for (const line of LINES) {
      const x = line.x * w
      const y = wrap(line.y - time * 0.9 * Math.sign(pull), -0.4, 1.1) * h
      ctx.globalAlpha = rush * 0.34
      ctx.lineWidth = line.width
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x - h * line.length * 0.06, y + h * line.length * (0.4 + rush))
      ctx.stroke()
    }
  }
  ctx.globalAlpha = 1
}

function paint(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  progress: number,
  velocity: number,
) {
  // The scene is composed for a frame about as tall as a window. In a
  // much taller one (a footer on a phone) it keeps that size and stands on
  // the bottom edge, under open sky.
  const u = Math.min(h, w * 2.2)
  const top = h - u

  // The disc: low at rest, rising and growing along the journey.
  const disc = {
    x: w * 0.7,
    y: top + u * (0.47 - progress * 0.2),
    r: Math.min(w, u) * (0.25 + progress * 0.12),
  }
  paintSky(ctx, w, h, disc, time)
  paintBanks(ctx, w, h, top, u, time, (i) => progress * BANKS[i].lift * u, disc)
  paintAir(ctx, w, h, time, progress * 1.6, velocity)
}

/**
 * Runs `frame` on the canvas: once per animation frame while it is on
 * screen and the tab is visible, once only with `still`. Sizes the canvas
 * to its box.
 */
export function useScene(
  ref: React.RefObject<HTMLCanvasElement | null>,
  frame: (ctx: CanvasRenderingContext2D, width: number, height: number, time: number) => void,
  still: boolean,
) {
  const latest = useRef(frame)
  latest.current = frame

  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    let width = 0
    let height = 0
    let raf = 0
    let onScreen = true
    const started = performance.now()

    const draw = () => latest.current(ctx, width, height, still ? 0 : (performance.now() - started) / 1000)
    const loop = () => {
      draw()
      raf = requestAnimationFrame(loop)
    }
    const run = () => {
      cancelAnimationFrame(raf)
      if (!still && onScreen && !document.hidden) raf = requestAnimationFrame(loop)
    }

    const fit = () => {
      // Flat shapes hold up at a modest pixel ratio, which keeps the fill cheap.
      const ratio = Math.min(window.devicePixelRatio || 1, 1.5)
      width = canvas.clientWidth
      height = canvas.clientHeight
      canvas.width = Math.round(width * ratio)
      canvas.height = Math.round(height * ratio)
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      draw()
    }
    const resize = new ResizeObserver(fit)
    resize.observe(canvas)
    const watch = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      run()
    })
    watch.observe(canvas)
    document.addEventListener("visibilitychange", run)
    fit()
    run()

    return () => {
      cancelAnimationFrame(raf)
      resize.disconnect()
      watch.disconnect()
      document.removeEventListener("visibilitychange", run)
    }
  }, [ref, still])
}

export default function InkScene({
  progress,
  velocity,
  still,
  className,
}: {
  progress: MotionValue<number>
  velocity: MotionValue<number>
  still: boolean
  className?: string
}) {
  const ref = useRef<HTMLCanvasElement>(null)
  useScene(
    ref,
    (ctx, width, height, time) =>
      paint(ctx, width, height, time, still ? 0 : progress.get(), still ? 0 : velocity.get()),
    still,
  )

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
