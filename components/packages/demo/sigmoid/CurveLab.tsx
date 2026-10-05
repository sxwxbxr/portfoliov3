"use client"

import { useId, useMemo, useState } from "react"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import { bezier, ease, logistic, spring, type Easing } from "@/lib/demo/sigmoid"
import { sigmoidDemo } from "@/lib/demo/sigmoid-copy"

const t = sigmoidDemo.curves

type Kind = keyof typeof t.kinds

const BEZIERS = {
  "ease.out": [0.16, 1, 0.3, 1],
  "ease.inOut": [0.65, 0, 0.35, 1],
  "ease.standard": [0.2, 0, 0, 1],
  "back out": [0.34, 1.56, 0.64, 1],
} as const

type BezierName = keyof typeof BEZIERS

const W = 320
const H = 220
const PAD = 16

/** Stops of a CSS linear() value as [x, y] pairs (0..1). */
function stops(css: string): [number, number][] {
  if (!css.startsWith("linear(")) return []
  const parts = css.slice(7, -1).split(",")
  return parts.map((part, i) => {
    const [v, p] = part.trim().split(/\s+/)
    const x = p ? Number.parseFloat(p) / 100 : i === 0 ? 0 : 1
    return [x, Number(v)]
  })
}

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string
  value: number
  min: number
  max: number
  step: number
  format: (v: number) => string
  onChange: (v: number) => void
}) {
  const id = useId()
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm text-fg">
          {label}
        </label>
        <output htmlFor={id} className="font-mono text-xs text-fg-muted">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-[var(--signal)]"
      />
    </div>
  )
}

export function CurveLab() {
  const [kind, setKind] = useState<Kind>("spring")
  const [bounce, setBounce] = useState(0.3)
  const [duration, setDuration] = useState(0.6)
  const [steepness, setSteepness] = useState(10)
  const [preset, setPreset] = useState<BezierName>("back out")
  const [played, setPlayed] = useState(false)
  const kindId = useId()
  const presetId = useId()

  const { curve, code } = useMemo((): { curve: Easing; code: string } => {
    if (kind === "spring") {
      return {
        curve: spring({ duration, bounce }),
        code: `import { spring } from "@sweberdev/sigmoid/easing"\n\nconst pop = spring({ duration: ${duration}, bounce: ${bounce} })`,
      }
    }
    if (kind === "logistic") {
      return {
        curve: steepness === 10 ? ease.sigmoid : logistic(steepness),
        code: `import { logistic } from "@sweberdev/sigmoid/easing"\n\nconst s = logistic(${steepness})`,
      }
    }
    const [a, b, c, d] = BEZIERS[preset]
    return {
      curve: bezier(a, b, c, d),
      code: `import { bezier } from "@sweberdev/sigmoid/easing"\n\nconst curve = bezier(${a}, ${b}, ${c}, ${d})`,
    }
  }, [kind, bounce, duration, steepness, preset])

  const plot = useMemo(() => {
    const samples = Array.from({ length: 161 }, (_, i) => {
      const x = i / 160
      return [x, curve(x)] as const
    })
    const ys = samples.map(([, y]) => y)
    const lo = Math.min(0, ...ys) - 0.05
    const hi = Math.max(1, ...ys) + 0.05
    const sx = (x: number) => PAD + x * (W - 2 * PAD)
    const sy = (y: number) => H - PAD - ((y - lo) / (hi - lo)) * (H - 2 * PAD)
    const path = samples.map(([x, y], i) => `${i ? "L" : "M"}${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`).join(" ")
    return { path, sx, sy, points: stops(curve.css) }
  }, [curve])

  const ms = kind === "spring" && curve.duration ? curve.duration : 700
  const css = `transition: transform ${ms}ms ${curve.css};`

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor={kindId} className="text-sm text-fg">
            {t.kindLabel}
          </label>
          <select
            id={kindId}
            value={kind}
            onChange={(e) => setKind(e.target.value as Kind)}
            className="control w-full px-3 py-2 text-sm"
          >
            {(Object.keys(t.kinds) as Kind[]).map((k) => (
              <option key={k} value={k}>
                {t.kinds[k]}
              </option>
            ))}
          </select>
        </div>

        {kind === "spring" && (
          <>
            <Slider label={t.bounce} value={bounce} min={0} max={0.8} step={0.05} format={(v) => v.toFixed(2)} onChange={setBounce} />
            <Slider label={t.duration} value={duration} min={0.2} max={1.5} step={0.05} format={(v) => `${v.toFixed(2)} s`} onChange={setDuration} />
          </>
        )}
        {kind === "logistic" && (
          <Slider label={t.steepness} value={steepness} min={4} max={20} step={1} format={(v) => String(v)} onChange={setSteepness} />
        )}
        {kind === "bezier" && (
          <div className="flex flex-col gap-2">
            <label htmlFor={presetId} className="text-sm text-fg">
              {t.bezierPreset}
            </label>
            <select
              id={presetId}
              value={preset}
              onChange={(e) => setPreset(e.target.value as BezierName)}
              className="control w-full px-3 py-2 text-sm"
            >
              {(Object.keys(BEZIERS) as BezierName[]).map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex flex-wrap gap-x-4 gap-y-1 annotate">
          {plot.points.length > 0 && <span>{t.stops(plot.points.length)}</span>}
          {kind === "spring" && curve.duration && <span>{t.rest(curve.duration)}</span>}
        </div>

        <CodeBlock title={t.jsHeading} code={code} />
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <div className="cast p-4">
          <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto max-h-[22rem] w-full" role="img" aria-label={t.plotLabel(t.kinds[kind])}>
            <line x1={PAD} x2={W - PAD} y1={plot.sy(0)} y2={plot.sy(0)} stroke="var(--edge-mid)" strokeWidth="1" />
            <line x1={PAD} x2={W - PAD} y1={plot.sy(1)} y2={plot.sy(1)} stroke="var(--edge-mid)" strokeWidth="1" strokeDasharray="3 4" />
            <path d={plot.path} fill="none" stroke="var(--fg)" strokeWidth="2" strokeLinejoin="round" />
            {plot.points.map(([x, y], i) => (
              <circle key={i} cx={plot.sx(x)} cy={plot.sy(y)} r="2.5" fill="var(--plate)" stroke="var(--fg-muted)" />
            ))}
          </svg>
        </div>

        <div className="flex items-center gap-4">
          <button type="button" className="control control-primary px-5 py-2.5 text-sm" onClick={() => setPlayed((p) => !p)}>
            {t.play}
          </button>
          <div className="well relative h-12 flex-1 overflow-hidden p-1.5" style={{ containerType: "inline-size" }}>
            <div
              className="h-9 w-9 rounded-md bg-fg"
              style={{
                transform: played ? "translateX(calc(100cqw - 2.25rem - 0.75rem))" : "none",
                transition: `transform ${ms}ms ${curve.css}`,
              }}
            />
          </div>
        </div>

        <CodeBlock title={t.cssHeading} code={css} />
      </div>
    </div>
  )
}
