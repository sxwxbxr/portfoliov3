"use client"

import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import { bezier, logistic, spring, type Easing } from "@/lib/demo/sigmoid"
import { sigmoidCurves } from "@/lib/demo/sigmoid-copy"

const t = sigmoidCurves

type Kind = "spring" | "logistic" | "bezier"
type Bezier = [number, number, number, number]

interface State {
  kind: Kind
  bounce: number
  duration: number
  steepness: number
  bezier: Bezier
}

const DEFAULT: State = { kind: "spring", bounce: 0.3, duration: 0.6, steepness: 10, bezier: [0.34, 1.56, 0.64, 1] }

const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi)
const round = (v: number, d = 2) => Number(v.toFixed(d))

/** Reads a shared curve from the query string, ignoring anything invalid. */
function fromQuery(search: string): State {
  const q = new URLSearchParams(search)
  const kind = q.get("curve")
  const num = (key: string, fallback: number, lo: number, hi: number) => {
    const v = Number.parseFloat(q.get(key) ?? "")
    return Number.isFinite(v) ? clamp(v, lo, hi) : fallback
  }
  const s = { ...DEFAULT }
  if (kind === "spring" || kind === "logistic" || kind === "bezier") s.kind = kind
  s.bounce = num("bounce", s.bounce, 0, 0.8)
  s.duration = num("duration", s.duration, 0.2, 1.5)
  s.steepness = num("steepness", s.steepness, 4, 20)
  const b = (q.get("bezier") ?? "").split(",").map(Number.parseFloat)
  if (b.length === 4 && b.every(Number.isFinite)) {
    s.bezier = [clamp(b[0] ?? 0, 0, 1), clamp(b[1] ?? 0, -1, 2), clamp(b[2] ?? 0, 0, 1), clamp(b[3] ?? 0, -1, 2)]
  }
  return s
}

function toQuery(s: State): string {
  const q = new URLSearchParams({ curve: s.kind })
  if (s.kind === "spring") {
    q.set("bounce", String(s.bounce))
    q.set("duration", String(s.duration))
  } else if (s.kind === "logistic") q.set("steepness", String(s.steepness))
  else q.set("bezier", s.bezier.join(","))
  return q.toString()
}

function makeCurve(s: State): Easing {
  if (s.kind === "spring") return spring({ duration: s.duration, bounce: s.bounce })
  if (s.kind === "logistic") return logistic(s.steepness)
  return bezier(...s.bezier)
}

function sigmoidCall(s: State): string {
  if (s.kind === "spring") return `spring({ duration: ${s.duration}, bounce: ${s.bounce} })`
  if (s.kind === "logistic") return `logistic(${s.steepness})`
  return `bezier(${s.bezier.join(", ")})`
}

const W = 360
const H = 260
const PAD = 28

function Slider(props: {
  label: string
  value: number
  min: number
  max: number
  step: number
  format?: (v: number) => string
  onChange: (v: number) => void
}) {
  const id = useId()
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm text-fg">
          {props.label}
        </label>
        <output htmlFor={id} className="font-mono text-xs text-fg-muted">
          {(props.format ?? String)(props.value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={props.min}
        max={props.max}
        step={props.step}
        value={props.value}
        onChange={(e) => props.onChange(Number(e.target.value))}
        className="w-full accent-[var(--signal)]"
      />
    </div>
  )
}

export function CurveEditor() {
  const [state, setState] = useState<State>(DEFAULT)
  const [tab, setTab] = useState<keyof typeof t.tabs>("css")
  const [copied, setCopied] = useState(false)
  const [played, setPlayed] = useState(false)
  const [drag, setDrag] = useState<0 | 1 | null>(null)
  const svg = useRef<SVGSVGElement>(null)
  const [ready, setReady] = useState(false)
  const kindId = useId()

  // The shared link: read once on load, write on every change.
  useEffect(() => {
    setState(fromQuery(window.location.search))
    setReady(true)
  }, [])
  useEffect(() => {
    if (ready) window.history.replaceState(null, "", `?${toQuery(state)}`)
  }, [state, ready])

  const curve = useMemo(() => makeCurve(state), [state])
  const ms = state.kind === "spring" && curve.duration ? curve.duration : 600

  const plot = useMemo(() => {
    const samples = Array.from({ length: 161 }, (_, i) => [i / 160, curve(i / 160)] as const)
    const ys = samples.map(([, y]) => y)
    const lo = Math.min(0, ...ys, state.kind === "bezier" ? Math.min(state.bezier[1], state.bezier[3]) : 0) - 0.05
    const hi = Math.max(1, ...ys, state.kind === "bezier" ? Math.max(state.bezier[1], state.bezier[3]) : 1) + 0.05
    const sx = (x: number) => PAD + x * (W - 2 * PAD)
    const sy = (y: number) => H - PAD - ((y - lo) / (hi - lo)) * (H - 2 * PAD)
    const ix = (px: number) => (px - PAD) / (W - 2 * PAD)
    const iy = (py: number) => lo + ((H - PAD - py) / (H - 2 * PAD)) * (hi - lo)
    return { path: samples.map(([x, y], i) => `${i ? "L" : "M"}${sx(x).toFixed(1)} ${sy(y).toFixed(1)}`).join(" "), sx, sy, ix, iy }
  }, [curve, state.kind, state.bezier])

  const moveHandle = useCallback(
    (e: React.PointerEvent) => {
      if (drag === null || !svg.current) return
      const r = svg.current.getBoundingClientRect()
      const px = ((e.clientX - r.left) / r.width) * W
      const py = ((e.clientY - r.top) / r.height) * H
      const x = round(clamp(plot.ix(px), 0, 1))
      const y = round(clamp(plot.iy(py), -1, 2))
      setState((s) => {
        const b: Bezier = [...s.bezier]
        b[drag * 2] = x
        b[drag * 2 + 1] = y
        return { ...s, bezier: b }
      })
    },
    [drag, plot]
  )

  const css = curve.css
  const code: Record<keyof typeof t.tabs, string> = {
    css: `transition: transform ${ms}ms ${css};`,
    variable: `:root {\n  --ease-custom: ${css};\n}\n\n.card {\n  transition: transform ${ms}ms var(--ease-custom);\n}`,
    tailwind: `@theme {\n  --ease-custom: ${css};\n}\n\n/* <div class="transition-transform duration-[${ms}ms] ease-custom"> */`,
    js: `import { ${state.kind} } from "@sweberdev/sigmoid/easing"\n\nconst curve = ${sigmoidCall(state)}\n\ncurve(0.5)  // the value half way through\ncurve.css   // the CSS linear() or cubic-bezier() string${state.kind === "spring" ? "\ncurve.duration // milliseconds until it comes to rest" : ""}`,
    libs: `// Motion\nanimate(".box", { x: 200 }, { ease: curve, duration: ${ms / 1000} })\n\n// GSAP\ngsap.to(".box", { x: 200, ease: curve, duration: ${ms / 1000} })`,
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(code[tab])
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard blocked: the code stays selectable */
    }
  }

  async function share() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* the address bar already holds the link */
    }
  }

  const [b0, b1, b2, b3] = state.bezier

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:gap-16">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <label htmlFor={kindId} className="text-sm text-fg">
            {t.kindLabel}
          </label>
          <select
            id={kindId}
            value={state.kind}
            onChange={(e) => setState((s) => ({ ...s, kind: e.target.value as Kind }))}
            className="control w-full px-3 py-2 text-sm"
          >
            {(Object.keys(t.kinds) as Kind[]).map((k) => (
              <option key={k} value={k}>
                {t.kinds[k]}
              </option>
            ))}
          </select>
        </div>

        {state.kind === "spring" && (
          <>
            <Slider label={t.bounce} value={state.bounce} min={0} max={0.8} step={0.05} format={(v) => v.toFixed(2)} onChange={(bounce) => setState((s) => ({ ...s, bounce }))} />
            <Slider label={t.duration} value={state.duration} min={0.2} max={1.5} step={0.05} format={(v) => `${v.toFixed(2)} s`} onChange={(duration) => setState((s) => ({ ...s, duration }))} />
          </>
        )}
        {state.kind === "logistic" && (
          <Slider label={t.steepness} value={state.steepness} min={4} max={20} step={1} onChange={(steepness) => setState((s) => ({ ...s, steepness }))} />
        )}
        {state.kind === "bezier" && (
          <>
            <Slider label="x1" value={b0} min={0} max={1} step={0.01} format={(v) => v.toFixed(2)} onChange={(v) => setState((s) => ({ ...s, bezier: [v, b1, b2, b3] }))} />
            <Slider label="y1" value={b1} min={-1} max={2} step={0.01} format={(v) => v.toFixed(2)} onChange={(v) => setState((s) => ({ ...s, bezier: [b0, v, b2, b3] }))} />
            <Slider label="x2" value={b2} min={0} max={1} step={0.01} format={(v) => v.toFixed(2)} onChange={(v) => setState((s) => ({ ...s, bezier: [b0, b1, v, b3] }))} />
            <Slider label="y2" value={b3} min={-1} max={2} step={0.01} format={(v) => v.toFixed(2)} onChange={(v) => setState((s) => ({ ...s, bezier: [b0, b1, b2, v] }))} />
            <p className="annotate">{t.dragHint}</p>
          </>
        )}

        <div className="flex flex-wrap gap-3">
          <button type="button" className="control control-primary px-5 py-2.5 text-sm" onClick={() => setPlayed((p) => !p)}>
            {t.play}
          </button>
          <button type="button" className="control px-5 py-2.5 text-sm" onClick={share}>
            {t.share}
          </button>
          <button type="button" className="control px-4 py-2.5 text-sm" onClick={() => setState(DEFAULT)}>
            {t.reset}
          </button>
        </div>
        <p role="status" aria-live="polite" className="annotate h-4">
          {copied ? t.copied : ""}
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-6">
        <div className="cast p-4">
          <svg
            ref={svg}
            viewBox={`0 0 ${W} ${H}`}
            className="mx-auto h-auto max-h-[24rem] w-full touch-none"
            role="img"
            aria-label={t.plotLabel(t.kinds[state.kind])}
            onPointerMove={moveHandle}
            onPointerUp={() => setDrag(null)}
            onPointerLeave={() => setDrag(null)}
          >
            <line x1={PAD} x2={W - PAD} y1={plot.sy(0)} y2={plot.sy(0)} stroke="var(--edge-mid)" strokeWidth="1" />
            <line x1={PAD} x2={W - PAD} y1={plot.sy(1)} y2={plot.sy(1)} stroke="var(--edge-mid)" strokeWidth="1" strokeDasharray="3 4" />
            <path d={plot.path} fill="none" stroke="var(--fg)" strokeWidth="2.5" strokeLinejoin="round" />
            {state.kind === "bezier" && (
              <>
                <line x1={plot.sx(0)} y1={plot.sy(0)} x2={plot.sx(b0)} y2={plot.sy(b1)} stroke="var(--fg-muted)" strokeWidth="1" />
                <line x1={plot.sx(1)} y1={plot.sy(1)} x2={plot.sx(b2)} y2={plot.sy(b3)} stroke="var(--fg-muted)" strokeWidth="1" />
                {([[b0, b1, 0], [b2, b3, 1]] as const).map(([x, y, i]) => (
                  <circle
                    key={i}
                    cx={plot.sx(x)}
                    cy={plot.sy(y)}
                    r="9"
                    fill="var(--plate)"
                    stroke="var(--signal)"
                    strokeWidth="2.5"
                    className="cursor-grab"
                    onPointerDown={(e) => {
                      e.currentTarget.setPointerCapture(e.pointerId)
                      setDrag(i)
                    }}
                  />
                ))}
              </>
            )}
          </svg>
        </div>

        <div className="well relative h-12 overflow-hidden p-1.5" style={{ containerType: "inline-size" }}>
          <div
            className="h-9 w-9 rounded-md bg-fg"
            style={{
              transform: played ? "translateX(calc(100cqw - 2.25rem - 0.75rem))" : "none",
              transition: `transform ${ms}ms ${css}`,
            }}
          />
        </div>

        <div className="flex flex-col gap-3">
          <div role="tablist" aria-label={t.outputLabel} className="flex flex-wrap gap-2">
            {(Object.keys(t.tabs) as (keyof typeof t.tabs)[]).map((k) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={tab === k}
                onClick={() => setTab(k)}
                className={`control px-3 py-1.5 text-xs ${tab === k ? "control-primary" : ""}`}
              >
                {t.tabs[k]}
              </button>
            ))}
            <button type="button" className="control ml-auto px-3 py-1.5 text-xs" onClick={copy}>
              {t.copy}
            </button>
          </div>
          <CodeBlock title={t.tabs[tab]} code={code[tab]} />
        </div>
      </div>
    </div>
  )
}
