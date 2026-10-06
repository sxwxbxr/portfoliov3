"use client"

import { useEffect, useRef, useState } from "react"
import { type System, loop, reducedMotion, system } from "@sweberdev/lagrangian"
import { lagrangianDemo } from "@/lib/demo/lagrangian-copy"

const t = lagrangianDemo.pendulum
const G = 9.81
const L1 = 1
const L2 = 1
const M1 = 1
const M2 = 1
const TRAIL = 240

/** Equations of motion of the double pendulum, from its Lagrangian. State: [θ1, θ2, ω1, ω2]. */
function derivatives([a1 = 0, a2 = 0, w1 = 0, w2 = 0]: readonly number[]) {
  const d = a1 - a2
  const den = 2 * M1 + M2 - M2 * Math.cos(2 * d)
  const dw1 =
    (-G * (2 * M1 + M2) * Math.sin(a1) -
      M2 * G * Math.sin(a1 - 2 * a2) -
      2 * Math.sin(d) * M2 * (w2 * w2 * L2 + w1 * w1 * L1 * Math.cos(d))) /
    (L1 * den)
  const dw2 =
    (2 * Math.sin(d) * (w1 * w1 * L1 * (M1 + M2) + G * (M1 + M2) * Math.cos(a1) + w2 * w2 * L2 * M2 * Math.cos(d))) /
    (L2 * den)
  return [w1, w2, dw1, dw2]
}

function energy([a1 = 0, a2 = 0, w1 = 0, w2 = 0]: readonly number[]) {
  const kinetic =
    0.5 * M1 * L1 * L1 * w1 * w1 +
    0.5 * M2 * (L1 * L1 * w1 * w1 + L2 * L2 * w2 * w2 + 2 * L1 * L2 * w1 * w2 * Math.cos(a1 - a2))
  const potential = -(M1 + M2) * G * L1 * Math.cos(a1) - M2 * G * L2 * Math.cos(a2)
  return kinetic + potential
}

/** Two double pendulums a thousandth of a radian apart, stepped with RK4. */
export function DoublePendulum() {
  const canvas = useRef<HTMLCanvasElement>(null)
  const [playing, setPlaying] = useState(false)
  const [angle, setAngle] = useState(120)
  const [stats, setStats] = useState({ time: 0, drift: 0 })
  const sims = useRef<{ sys: System; trail: [number, number][]; e0: number }[]>([])
  const visible = useRef(false)

  const reset = (degrees: number) => {
    const a = (degrees * Math.PI) / 180
    sims.current = [0, 0.001].map((offset) => {
      const start = [a + offset, a + offset, 0, 0]
      return { sys: system(derivatives, start), trail: [], e0: energy(start) }
    })
    setStats({ time: 0, drift: 0 })
    draw()
  }

  const draw = () => {
    const c = canvas.current
    if (!c) return
    const ratio = window.devicePixelRatio || 1
    const w = c.clientWidth
    const h = c.clientHeight
    if (c.width !== Math.round(w * ratio)) {
      c.width = Math.round(w * ratio)
      c.height = Math.round(h * ratio)
    }
    const ctx = c.getContext("2d")
    if (!ctx) return
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    ctx.clearRect(0, 0, w, h)
    const styles = getComputedStyle(c)
    const colors = [styles.getPropertyValue("--fg").trim() || "#fff", styles.getPropertyValue("--fg-muted").trim() || "#888"]
    const scale = Math.min(w, h) / 4.6
    const ox = w / 2
    const oy = h / 2
    sims.current.forEach((sim, i) => {
      const [a1 = 0, a2 = 0] = sim.sys.state
      const x1 = ox + Math.sin(a1) * L1 * scale
      const y1 = oy + Math.cos(a1) * L1 * scale
      const x2 = x1 + Math.sin(a2) * L2 * scale
      const y2 = y1 + Math.cos(a2) * L2 * scale
      const color = colors[i] ?? "#fff"
      ctx.strokeStyle = color
      ctx.globalAlpha = 0.45
      ctx.lineWidth = 1.5
      ctx.beginPath()
      sim.trail.forEach(([tx, ty], j) => {
        const px = ox + tx * scale
        const py = oy + ty * scale
        if (j === 0) ctx.moveTo(px, py)
        else ctx.lineTo(px, py)
      })
      ctx.stroke()
      ctx.globalAlpha = 1
      ctx.lineWidth = 2.5
      ctx.beginPath()
      ctx.moveTo(ox, oy)
      ctx.lineTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
      ctx.fillStyle = color
      for (const [x, y, r] of [
        [x1, y1, 7],
        [x2, y2, 9],
      ] as const) {
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
      }
    })
    ctx.fillStyle = colors[0] ?? "#fff"
    ctx.beginPath()
    ctx.arc(ox, oy, 3, 0, Math.PI * 2)
    ctx.fill()
  }

  useEffect(() => {
    reset(angle)
    const c = canvas.current
    if (!c) return
    const observer = new IntersectionObserver(([entry]) => {
      visible.current = entry?.isIntersecting ?? false
      // Start on its own the first time it is seen, unless the user asked for less motion.
      if (!visible.current || c.dataset.seen) return
      c.dataset.seen = "1"
      if (!reducedMotion()) setPlaying(true)
    })
    observer.observe(c)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!playing) return
    let frames = 0
    const stop = loop.add((dt) => {
      if (!visible.current) return
      for (const sim of sims.current) {
        const [a1 = 0, a2 = 0] = sim.sys.advance(dt)
        const x2 = Math.sin(a1) * L1 + Math.sin(a2) * L2
        const y2 = Math.cos(a1) * L1 + Math.cos(a2) * L2
        sim.trail.push([x2, y2])
        if (sim.trail.length > TRAIL) sim.trail.shift()
      }
      draw()
      if (++frames % 10 === 0) {
        const first = sims.current[0]
        if (first) {
          const e = energy(first.sys.state)
          setStats({ time: first.sys.time, drift: Math.abs((e - first.e0) / first.e0) })
        }
      }
    })
    return stop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing])

  return (
    <div className="flex flex-col gap-5">
      <canvas ref={canvas} role="img" aria-label={t.canvasLabel} className="well aspect-square w-full md:aspect-[16/10]" />
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex flex-wrap items-center gap-2">
          <button type="button" className="control control-primary px-4 py-2 text-sm" onClick={() => setPlaying((p) => !p)}>
            {playing ? t.pause : t.play}
          </button>
          <button type="button" className="control px-4 py-2 text-sm" onClick={() => reset(angle)}>
            {t.restart}
          </button>
        </div>
        <label className="flex min-w-48 flex-1 flex-col gap-1.5 text-sm md:max-w-xs">
          <span className="flex justify-between text-fg-muted">
            <span>{t.angle}</span>
            <span className="font-mono text-fg">{angle}°</span>
          </span>
          <input
            type="range"
            min={30}
            max={180}
            step={5}
            value={angle}
            onChange={(e) => {
              const v = Number(e.target.value)
              setAngle(v)
              reset(v)
            }}
            className="w-full accent-[var(--signal)]"
          />
        </label>
        <p className="text-sm text-fg-muted">
          {t.time} <span className="font-mono text-fg">{stats.time.toFixed(1)} s</span> · {t.energy}{" "}
          <span className="font-mono text-fg">{(stats.drift * 100).toFixed(4)} %</span>
        </p>
      </div>
    </div>
  )
}
