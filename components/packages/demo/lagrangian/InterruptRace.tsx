"use client"

import { useEffect, useRef, useState } from "react"
import { getValue, loop } from "@sweberdev/lagrangian"
import { lagrangianDemo } from "@/lib/demo/lagrangian-copy"

const t = lagrangianDemo.springs
const DOT = 28
const HISTORY = 3000

/** Reads the current translateX of an element that moves with a CSS transition. */
function cssX(el: HTMLElement) {
  const m = getComputedStyle(el).transform
  if (!m || m === "none") return 0
  return new DOMMatrixReadOnly(m).m41
}

function Slider(props: {
  label: string
  value: number
  min: number
  max: number
  step: number
  format: (v: number) => string
  onChange: (v: number) => void
}) {
  return (
    <label className="flex min-w-40 flex-1 flex-col gap-1.5 text-sm">
      <span className="flex justify-between text-fg-muted">
        <span>{props.label}</span>
        <span className="font-mono text-fg">{props.format(props.value)}</span>
      </span>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        className="w-full accent-[var(--signal)]"
      />
    </label>
  )
}

/** CSS transition and Lagrangian spring side by side, with a live position plot. */
export function InterruptRace() {
  const track = useRef<HTMLButtonElement>(null)
  const cssDot = useRef<HTMLDivElement>(null)
  const springDot = useRef<HTMLDivElement>(null)
  const canvas = useRef<HTMLCanvasElement>(null)
  const side = useRef(0)
  const samples = useRef<{ t: number; css: number; spring: number }[]>([])
  const stopPlot = useRef<(() => void) | null>(null)
  const idle = useRef(0)
  const [duration, setDuration] = useState(0.6)
  const [bounce, setBounce] = useState(0.25)

  const width = () => Math.max((track.current?.clientWidth ?? 300) - DOT - 32, 40)

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
    const fg = styles.getPropertyValue("--fg").trim() || "#fff"
    const muted = styles.getPropertyValue("--fg-muted").trim() || "#888"
    const edge = styles.getPropertyValue("--edge-soft").trim() || "#333"
    ctx.strokeStyle = edge
    ctx.lineWidth = 1
    for (const y of [0.15, 0.85]) {
      ctx.beginPath()
      ctx.moveTo(0, h * y)
      ctx.lineTo(w, h * y)
      ctx.stroke()
    }
    const now = performance.now()
    const span = width()
    const line = (key: "css" | "spring", color: string, dash: number[]) => {
      ctx.strokeStyle = color
      ctx.lineWidth = 2
      ctx.setLineDash(dash)
      ctx.beginPath()
      samples.current.forEach((s, i) => {
        const x = w - ((now - s.t) / HISTORY) * w
        const y = h * 0.85 - (s[key] / span) * h * 0.7
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.stroke()
      ctx.setLineDash([])
    }
    line("css", muted, [5, 4])
    line("spring", fg, [])
  }

  const sample = () => {
    if (!cssDot.current || !springDot.current) return
    const now = performance.now()
    const css = cssX(cssDot.current)
    const spring = getValue(springDot.current, "x").get()
    const list = samples.current
    const last = list[list.length - 1]
    list.push({ t: now, css, spring })
    while (list.length > 2 && (list[0]?.t ?? now) < now - HISTORY) list.shift()
    draw()
    // Keep plotting until both dots have rested and the plot has scrolled empty.
    const moving = !last || Math.abs(last.css - css) > 0.01 || Math.abs(last.spring - spring) > 0.01
    idle.current = moving ? 0 : idle.current + 1
    if (idle.current > 200) {
      stopPlot.current?.()
      stopPlot.current = null
    }
  }

  const ensurePlot = () => {
    idle.current = 0
    if (!stopPlot.current) stopPlot.current = loop.add(sample)
  }

  const flip = () => {
    side.current = side.current ? 0 : 1
    const x = side.current * width()
    if (cssDot.current) cssDot.current.style.transform = `translateX(${x}px)`
    if (springDot.current) getValue(springDot.current, "x").to(x, { duration, bounce })
    ensurePlot()
  }

  useEffect(() => {
    draw()
    const onResize = () => {
      const x = side.current * width()
      if (cssDot.current) cssDot.current.style.transform = `translateX(${x}px)`
      if (springDot.current) getValue(springDot.current, "x").jump(x)
      draw()
    }
    window.addEventListener("resize", onResize)
    return () => {
      window.removeEventListener("resize", onResize)
      stopPlot.current?.()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="flex flex-col gap-6">
      <button
        ref={track}
        type="button"
        onClick={flip}
        className="cast flex w-full cursor-pointer flex-col gap-5 p-4 text-left md:p-6"
        aria-label={t.toggle}
      >
        <span className="flex flex-col gap-2">
          <span className="annotate">{t.css}</span>
          <span className="well relative block h-11">
            <span
              ref={cssDot}
              className="absolute top-2 left-2 block rounded-full bg-fg-muted"
              style={{ width: DOT, height: DOT, transition: "transform 600ms cubic-bezier(0.16, 1, 0.3, 1)" }}
            />
          </span>
        </span>
        <span className="flex flex-col gap-2">
          <span className="annotate">{t.spring}</span>
          <span className="well relative block h-11">
            <span ref={springDot} className="absolute top-2 left-2 block rounded-full bg-fg" style={{ width: DOT, height: DOT }} />
          </span>
        </span>
        <span className="annotate text-center">{t.toggle}</span>
      </button>

      <canvas ref={canvas} aria-label={t.plotLabel} role="img" className="well h-40 w-full" />

      <div className="flex flex-wrap gap-6">
        <Slider label={t.duration} value={duration} min={0.2} max={1.5} step={0.05} format={(v) => `${v.toFixed(2)} s`} onChange={setDuration} />
        <Slider label={t.bounce} value={bounce} min={-0.5} max={0.8} step={0.05} format={(v) => v.toFixed(2)} onChange={setBounce} />
      </div>
    </div>
  )
}
