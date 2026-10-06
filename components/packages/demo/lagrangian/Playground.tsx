"use client"

import { useEffect, useRef, useState } from "react"
import { type Body, World } from "@sweberdev/lagrangian"
import { lagrangianDemo } from "@/lib/demo/lagrangian-copy"

const t = lagrangianDemo.world
const MAX = 48
const TONES = ["var(--fg)", "var(--fg-muted)", "var(--fg-subtle)", "var(--signal-bright)"]

/** A world with walls from the container: drop, grab, throw, change gravity. */
export function Playground() {
  const box = useRef<HTMLDivElement>(null)
  const world = useRef<World | null>(null)
  const [count, setCount] = useState(0)
  const [awake, setAwake] = useState(false)
  const [gravity, setGravity] = useState<number>(t.gravities[0].value)
  const [material, setMaterial] = useState<number>(1)

  const restitution = () => t.materials[material]?.restitution ?? 0.5

  const drop = (n: number) => {
    const w = world.current
    const container = box.current
    if (!w || !container) return
    const width = container.clientWidth
    for (let i = 0; i < n && w.bodies.length < MAX; i++) {
      const radius = 14 + Math.round(Math.random() * 22)
      const el = document.createElement("div")
      el.className = "absolute top-0 left-0 rounded-full cursor-grab active:cursor-grabbing"
      el.style.width = el.style.height = `${radius * 2}px`
      el.style.background = TONES[i % TONES.length] ?? "var(--fg)"
      // A notch shows the rotation, so rolling is visible.
      el.style.backgroundImage = "linear-gradient(90deg, transparent 46%, rgba(0,0,0,0.35) 46% 54%, transparent 54%)"
      container.appendChild(el)
      w.add({
        x: radius + Math.random() * (width - 2 * radius),
        y: -radius - Math.random() * 200,
        radius,
        restitution: restitution(),
        vx: (Math.random() - 0.5) * 300,
        element: el,
      })
    }
    setCount(w.bodies.length)
  }

  const reset = () => {
    const w = world.current
    if (!w) return
    for (const body of [...w.bodies]) {
      body.element?.remove()
      w.remove(body)
    }
    drop(14)
  }

  const shake = () => {
    const w = world.current
    if (!w) return
    for (const body of w.bodies) {
      w.push(body, { x: (Math.random() - 0.5) * 900 * body.mass, y: -(400 + Math.random() * 900) * body.mass })
    }
  }

  useEffect(() => {
    const container = box.current
    if (!container) return
    // Walls from the container, with an open ceiling so new balls can fall in from above.
    const walls = () => ({ left: 0, top: -10_000, right: container.clientWidth, bottom: container.clientHeight })
    const w = new World({ bounds: walls() })
    const observer = new ResizeObserver(() => w.setBounds(walls()))
    observer.observe(container)
    world.current = w
    w.start()
    const unbind = w.bindPointer(container)
    drop(14)
    const timer = window.setInterval(() => setAwake(w.awake), 250)
    return () => {
      window.clearInterval(timer)
      observer.disconnect()
      unbind()
      w.destroy()
      container.replaceChildren()
      world.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const w = world.current
    if (!w) return
    w.gravity = { x: 0, y: gravity }
    w.wake()
  }, [gravity])

  useEffect(() => {
    const w = world.current
    if (!w) return
    for (const body of w.bodies as Body[]) body.restitution = restitution()
    w.wake()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [material])

  const chip = "control px-3 py-1.5 text-sm"
  // Inline so the pressed state of .control does not override the highlight.
  const on = (active: boolean) =>
    active ? { background: "var(--signal)", color: "var(--signal-fg)", borderColor: "var(--signal)" } : undefined

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.gravity}>
          <span className="annotate mr-1">{t.gravity}</span>
          {t.gravities.map((g) => (
            <button key={g.label} type="button" aria-pressed={gravity === g.value} className={chip} style={on(gravity === g.value)} onClick={() => setGravity(g.value)}>
              {g.label}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.material}>
          <span className="annotate mr-1">{t.material}</span>
          {t.materials.map((m, i) => (
            <button key={m.label} type="button" aria-pressed={material === i} className={chip} style={on(material === i)} onClick={() => setMaterial(i)}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      <div ref={box} className="well relative h-[26rem] touch-none overflow-hidden select-none" aria-label={t.hint} />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button type="button" className="control px-4 py-2 text-sm" onClick={() => drop(6)} disabled={count >= MAX}>
            {t.drop}
          </button>
          <button type="button" className="control px-4 py-2 text-sm" onClick={shake}>
            {t.shake}
          </button>
          <button type="button" className="control px-4 py-2 text-sm" onClick={reset}>
            {t.reset}
          </button>
        </div>
        <p className="text-sm text-fg-muted" aria-live="polite">
          <span className="font-mono text-fg">{count}</span> {t.bodies} · {awake ? t.running : t.asleep}
        </p>
      </div>
    </div>
  )
}
