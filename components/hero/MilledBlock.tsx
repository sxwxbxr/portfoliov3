"use client"

import { useEffect, useRef } from "react"
import { FRAGMENT_SHADER, VERTEX_SHADER } from "./milledBlockShader"
import { oklchToLinearRgbClamped, type Rgb } from "@/lib/oklch"
// The camera and the framing live in lib/heroFraming.ts because the offline
// shader harness has to solve them identically. Duplicating them here is what
// let the ground plane and the vertical extent drift out of sync twice.
import { solveFraming } from "@/lib/heroFraming"

interface MilledBlockProps {
  /** Fired after the first frame is actually on screen, so the poster can go. */
  onReady?: () => void
  /**
   * Fired when WebGL is unavailable, refused, lost, or simply too slow. The
   * poster stays up and nothing else about the page changes.
   */
  onFail?: () => void
  className?: string
}

/** Resting angle: the lit corner points back toward the type on the left. */
const SPIN_REST = -0.42
/** Radians of spin per hero-height of scroll. One screen ≈ half a quarter turn. */
const SPIN_PER_SCREEN = 0.85
/** Radians/second of drift, so a block nobody touches is not a still image. */
const IDLE_RATE = 0.045
/** How far the pointer may push the spin. Deliberately small — this is not a toy. */
const POINTER_SPIN = 0.2

/**
 * Linear-sRGB stand-ins for light mode, used only if a token is renamed or
 * missing. Being visibly wrong beats rendering a black slab.
 */
const FALLBACK: Record<"plate" | "hi" | "lo" | "signal", Rgb> = {
  plate: [0.855, 0.864, 0.876],
  hi: [0.957, 0.962, 0.972],
  lo: [0.596, 0.617, 0.65],
  signal: [0.0, 0.26, 0.15],
}

function readPalette(el: Element) {
  const cs = getComputedStyle(el)
  return {
    plate: oklchToLinearRgbClamped(cs.getPropertyValue("--plate"), FALLBACK.plate),
    hi: oklchToLinearRgbClamped(cs.getPropertyValue("--cast-hi"), FALLBACK.hi),
    lo: oklchToLinearRgbClamped(cs.getPropertyValue("--cast-lo"), FALLBACK.lo),
    // --signal-bright, not --signal. The screen is a dark panel in BOTH themes,
    // so a syntax token needs the graphics-tier accent to clear it: light mode's
    // --signal is oklch(0.478), which would sink into the panel.
    signal: oklchToLinearRgbClamped(
      cs.getPropertyValue("--signal-bright"),
      FALLBACK.signal
    ),
  }
}

function compile(gl: WebGL2RenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, src)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[MilledBlock] shader compile failed:", gl.getShaderInfoLog(shader))
    }
    gl.deleteShader(shader)
    return null
  }
  return shader
}

/**
 * The hero object. Mounted only after the poster is already painted, and only
 * when the caller has established that motion is wanted — see HeroStage.
 *
 * Everything here is written to fail soft. There is no state in which this
 * component being unable to run leaves the page worse off than not having it,
 * which is the whole reason it was allowed to be 3D at all.
 */
export default function MilledBlock({ onReady, onFail, className }: MilledBlockProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  // Kept in refs so the render loop never re-subscribes when a parent re-renders.
  const readyRef = useRef(onReady)
  const failRef = useRef(onFail)
  readyRef.current = onReady
  failRef.current = onFail

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl2", {
      alpha: true,
      premultipliedAlpha: true,
      antialias: false, // useless against a raymarched silhouette; see resize()
      depth: false,
      stencil: false,
      preserveDrawingBuffer: false,
      // A software-rendered context is exactly the case where the poster is
      // the better answer, so let the browser refuse rather than crawl.
      failIfMajorPerformanceCaveat: true,
    })

    if (!gl) {
      failRef.current?.()
      return
    }

    const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
    const program = vs && fs ? gl.createProgram() : null

    if (!vs || !fs || !program) {
      failRef.current?.()
      return
    }

    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    // The shaders are linked into the program now; the objects themselves are
    // no longer referenced by anything else.
    gl.deleteShader(vs)
    gl.deleteShader(fs)

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      if (process.env.NODE_ENV !== "production") {
        console.warn("[MilledBlock] link failed:", gl.getProgramInfoLog(program))
      }
      gl.deleteProgram(program)
      failRef.current?.()
      return
    }

    gl.useProgram(program)

    const u = {
      res: gl.getUniformLocation(program, "uRes"),
      spin: gl.getUniformLocation(program, "uSpin"),
      tilt: gl.getUniformLocation(program, "uTilt"),
      fov: gl.getUniformLocation(program, "uFov"),
      offsetX: gl.getUniformLocation(program, "uOffsetX"),
      offsetY: gl.getUniformLocation(program, "uOffsetY"),
      time: gl.getUniformLocation(program, "uTime"),
      centerY: gl.getUniformLocation(program, "uCenterY"),
      camLift: gl.getUniformLocation(program, "uCamLift"),
      camDist: gl.getUniformLocation(program, "uCamDist"),
      planeY: gl.getUniformLocation(program, "uPlaneY"),
      plate: gl.getUniformLocation(program, "uPlate"),
      hi: gl.getUniformLocation(program, "uHi"),
      lo: gl.getUniformLocation(program, "uLo"),
      signal: gl.getUniformLocation(program, "uSignal"),
    }

    // One fullscreen triangle. Cheaper than a quad and it needs no index buffer.
    const vao = gl.createVertexArray()
    const buffer = gl.createBuffer()
    gl.bindVertexArray(vao)
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    )
    const aPos = gl.getAttribLocation(program, "aPos")
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    gl.disable(gl.DEPTH_TEST)
    gl.enable(gl.BLEND)
    // Premultiplied source, which is what the shader writes.
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
    gl.clearColor(0, 0, 0, 0)

    // ── Motion state, and the one place a frame is written ───────────────
    let idle = 0
    let clock = 0
    let pointerTarget = 0
    let pointer = 0
    let spin = SPIN_REST

    // An arrow rather than a `function` declaration on purpose: a hoisted
    // declaration could in principle run before the null guard above, so TS
    // discards the narrowing on `gl` inside one and the body stops compiling.
    const draw = () => {
      gl.uniform1f(u.spin, spin)
      gl.uniform1f(u.time, clock)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }

    // ── Palette, and following the theme ────────────────────────────────
    let palette = readPalette(canvas)
    const pushPalette = () => {
      gl.uniform3fv(u.plate, palette.plate)
      gl.uniform3fv(u.hi, palette.hi)
      gl.uniform3fv(u.lo, palette.lo)
      gl.uniform3fv(u.signal, palette.signal)
    }
    pushPalette()

    // next-themes toggles `.dark` on <html>, including when the OS preference
    // changes under `defaultTheme: "system"` — so watching the class covers
    // both the widget and the system switch.
    const themeObserver = new MutationObserver(() => {
      palette = readPalette(canvas)
      pushPalette()
      draw()
    })
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    })

    // ── Sizing ──────────────────────────────────────────────────────────
    let cssHeight = 1
    /** Dropped once by the watchdog before it gives up entirely. */
    let quality = 1

    const resize = () => {
      const w = canvas.clientWidth
      const h = canvas.clientHeight
      if (w === 0 || h === 0) return

      // Backing-store supersampling is the only anti-aliasing available here:
      // MSAA acts on rasterised geometry edges, and this silhouette is found
      // per-pixel in a fragment shader, so it has no edges to sample. The 1.5
      // floor is what gives a DPR-1 display a smooth outline.
      const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1.5), 2)
      const scale = dpr * quality
      const bw = Math.max(1, Math.round(w * scale))
      const bh = Math.max(1, Math.round(h * scale))

      if (canvas.width !== bw || canvas.height !== bh) {
        canvas.width = bw
        canvas.height = bh
      }

      cssHeight = h

      const f = solveFraming(w, h)

      gl.viewport(0, 0, bw, bh)
      gl.uniform2f(u.res, bw, bh)
      gl.uniform1f(u.fov, f.fov)
      gl.uniform1f(u.offsetX, f.offsetX)
      gl.uniform1f(u.offsetY, f.offsetY)
      gl.uniform1f(u.tilt, f.tilt)
      gl.uniform1f(u.centerY, f.centerY)
      gl.uniform1f(u.camLift, f.camLift)
      gl.uniform1f(u.camDist, f.camDist)
      gl.uniform1f(u.planeY, f.planeY)
    }

    resize()
    const resizeObserver = new ResizeObserver(() => {
      resize()
      draw()
    })
    resizeObserver.observe(canvas)

    // ── Loop, with a watchdog ───────────────────────────────────────────
    let raf = 0
    let running = false
    let onScreen = false
    let announced = false
    let last = 0
    let ema = 16
    let samples = 0
    let disposed = false

    const stop = () => {
      running = false
      if (raf) cancelAnimationFrame(raf)
      raf = 0
    }

    const bail = () => {
      stop()
      failRef.current?.()
    }

    const frame = (now: number) => {
      if (!running || disposed) return

      const deltaMs = last === 0 ? 16 : now - last
      last = now
      const dt = Math.min(deltaMs / 1000, 0.05)

      clock += dt
      idle += dt * IDLE_RATE
      pointer += (pointerTarget - pointer) * Math.min(1, dt * 4)

      // window.scrollY rather than getBoundingClientRect(): a scroll-position
      // read is cheap, a rect read forces layout, and Lenis has already
      // smoothed the value by the time it lands here.
      const scrolled = window.scrollY / Math.max(cssHeight, 1)
      spin = SPIN_REST + idle + scrolled * SPIN_PER_SCREEN + pointer * POINTER_SPIN

      draw()

      if (!announced) {
        announced = true
        readyRef.current?.()
      }

      // The block is an enhancement and is never allowed to make the page
      // worse than the poster it replaced. One downgrade, then it gives up.
      ema += (deltaMs - ema) * 0.08
      samples += 1
      if (quality === 1 && samples >= 45 && ema > 26) {
        quality = 0.62
        samples = 0
        resize()
      } else if (quality < 1 && samples >= 90 && ema > 30) {
        bail()
        return
      }

      raf = requestAnimationFrame(frame)
    }

    const start = () => {
      if (running || disposed || !onScreen || document.hidden) return
      running = true
      last = 0
      raf = requestAnimationFrame(frame)
    }

    const intersectionObserver = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting
        if (onScreen) start()
        else stop()
      },
      { rootMargin: "96px" }
    )
    intersectionObserver.observe(canvas)

    const onVisibility = () => (document.hidden ? stop() : start())
    document.addEventListener("visibilitychange", onVisibility)

    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches
    const onPointerMove = (e: PointerEvent) => {
      pointerTarget = (e.clientX / window.innerWidth) * 2 - 1
    }
    if (finePointer) {
      window.addEventListener("pointermove", onPointerMove, { passive: true })
    }

    // A lost context is not recoverable here and not worth recovering: the
    // poster is a complete answer. preventDefault would ask for a restore.
    const onContextLost = (e: Event) => {
      e.preventDefault()
      bail()
    }
    canvas.addEventListener("webglcontextlost", onContextLost)

    return () => {
      disposed = true
      stop()
      intersectionObserver.disconnect()
      resizeObserver.disconnect()
      themeObserver.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
      if (finePointer) window.removeEventListener("pointermove", onPointerMove)
      canvas.removeEventListener("webglcontextlost", onContextLost)

      gl.deleteBuffer(buffer)
      gl.deleteVertexArray(vao)
      gl.deleteProgram(program)

      // DO NOT call WEBGL_lose_context.loseContext() here.
      //
      // It was here as an eager free, and it broke the component outright.
      // React strict mode runs effects mount → cleanup → mount against the
      // SAME canvas element, and `getContext("webgl2")` on a canvas whose
      // context has been force-lost hands back that same lost context rather
      // than a fresh one. Every call then fails silently: compileShader does
      // nothing, COMPILE_STATUS reads false, compile() returns null, and the
      // component reports onFail and leaves the poster up permanently.
      //
      // In development that is every page load and every hot reload — the
      // renderer could never run there at all. The canvas element is removed
      // from the DOM on unmount anyway, so the context is collected without
      // help, and losing it buys nothing worth this failure mode.
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      // Purely decorative: the hero states everything this object says.
      aria-hidden="true"
      role="presentation"
    />
  )
}
