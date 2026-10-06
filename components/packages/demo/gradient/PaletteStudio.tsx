"use client"

import { type CSSProperties, useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react"
import { Check, Copy } from "lucide-react"
import { Block } from "@/components/site/Block"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import { CookieTableTabs } from "@/components/packages/demo/CookieTableTabs"
import {
  auditCss,
  checkDistinguishable,
  checkPair,
  checkPalette,
  DEFICIENCIES,
  type Deficiency,
  fixContrast,
  createPalette,
  contrastOnBlend,
  createBlend,
  createSeries,
  extractColors,
  pickBrand,
  type Mode,
  type Palette,
  parseColor,
  parseConfig,
  renderConfig,
  STATUS_NAMES,
  simulate,
  STEPS,
  toCss,
  toHex,
  toScss,
  toShadcn,
  toTailwind,
  toTailwindV3,
  toTokens,
  toTypeScript,
} from "@sweberdev/gradient"
import { gradientDemo } from "@/lib/demo/gradient-copy"

/*
 * Runs @sweberdev/gradient in the browser. The preview
 * panels get the generated values as custom properties on their own element,
 * so nothing here changes the colors of the page around it.
 */

const t = gradientDemo

const PRESETS = [
  { name: "Swiss red", color: "#e30613" },
  { name: "Blue", color: "#0a84ff" },
  { name: "Yellow", color: "#ffd60a" },
  { name: "Green", color: "#00a86b" },
  { name: "Violet", color: "#7c3aed" },
  { name: "Slate", color: "#334155" },
]

const FALLBACK = createPalette({ brand: "#e30613", accent: "#0a84ff" })

function isColor(value: string) {
  try {
    parseColor(value)
    return true
  } catch {
    return false
  }
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  const id = useId()
  const valid = isColor(value)
  const hex = valid ? toHex(parseColor(value)) : "#000000"
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="annotate">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          value={hex}
          onChange={(e) => onChange(e.target.value)}
          aria-label={t.controls.picker(label)}
          className="h-11 w-12 shrink-0 cursor-pointer rounded-md border border-edge bg-transparent p-1"
        />
        <input
          id={id}
          type="text"
          value={value}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!valid}
          aria-describedby={valid ? undefined : `${id}-error`}
          className="well h-11 w-full min-w-0 px-3 font-mono text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        />
      </div>
      {!valid && (
        <p id={`${id}-error`} className="text-sm text-fg-muted">
          {t.controls.invalid}
        </p>
      )}
    </div>
  )
}

type Vision = "normal" | Deficiency

/** How the color looks with the selected color vision. */
function see(hex: string, vision: Vision) {
  return vision === "normal" ? hex : simulate(hex, vision)
}

/** Custom properties `--g-<name>-<step>` and `--g-<name>-on-<step>` of one mode. */
function variables(palette: Palette, mode: Mode, vision: Vision): CSSProperties {
  const vars: Record<string, string> = {}
  for (const scale of palette.scales) {
    for (const step of STEPS) {
      vars[`--g-${scale.name}-${step}`] = see(scale[mode][step].hex, vision)
      vars[`--g-${scale.name}-on-${step}`] = see(scale[mode][step].on, vision)
    }
  }
  return vars as CSSProperties
}

function Preview({
  palette,
  mode,
  hasAccent,
  vision,
}: {
  palette: Palette
  mode: Mode
  hasAccent: boolean
  vision: Vision
}) {
  const p = t.preview
  const inputId = useId()
  const accent = hasAccent ? "accent" : "brand"
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="annotate">{mode === "light" ? t.scales.light : t.scales.dark}</p>
      <div
        style={{ ...variables(palette, mode, vision), colorScheme: mode }}
        className="flex flex-col gap-5 rounded-xl border border-edge bg-[var(--g-neutral-50)] p-6 text-[var(--g-neutral-800)]"
        data-mode={mode}
      >
        <div className="flex flex-col gap-4 rounded-lg bg-[var(--g-brand-50)] p-5">
          <div className="flex items-center gap-3">
            <h3 className="text-xl font-semibold tracking-tight text-[var(--g-brand-900)]">{p.heading}</h3>
            <span className="rounded-full bg-[var(--g-brand-100)] px-2.5 py-0.5 text-xs font-medium text-[var(--g-brand-800)]">
              {p.badge}
            </span>
          </div>
          <p className="text-sm leading-relaxed text-[var(--g-neutral-700)]">
            {p.body}{" "}
            <a href="#export" className="font-medium text-[var(--g-brand-600)] underline underline-offset-2">
              {p.link}
            </a>
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className="rounded-md bg-[var(--g-brand-600)] px-4 py-2 text-sm font-medium text-[var(--g-brand-on-600)] hover:bg-[var(--g-brand-700)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--g-brand-500)]"
            >
              {p.button}
            </button>
            <button
              type="button"
              className="rounded-md border border-[var(--g-brand-500)] px-4 py-2 text-sm font-medium text-[var(--g-brand-700)] hover:bg-[var(--g-brand-100)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--g-brand-500)]"
            >
              {p.secondary}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={inputId} className="text-sm font-medium text-[var(--g-neutral-900)]">
            {p.input}
          </label>
          <input
            id={inputId}
            type="email"
            placeholder={p.inputPlaceholder}
            className="rounded-md border border-[var(--g-neutral-500)] bg-[var(--g-neutral-50)] px-3 py-2 text-sm text-[var(--g-neutral-900)] placeholder:text-[var(--g-neutral-600)] focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[var(--g-brand-500)]"
          />
        </div>
        <div
          className="rounded-lg border-l-4 p-4"
          style={{
            borderColor: `var(--g-${accent}-500)`,
            background: `var(--g-${accent}-100)`,
          }}
        >
          <p className="text-sm font-semibold" style={{ color: `var(--g-${accent}-900)` }}>
            {p.alertTitle}
          </p>
          <p className="text-sm" style={{ color: `var(--g-${accent}-800)` }}>
            {p.alert}
          </p>
        </div>
        {STATUS_NAMES.some((name) => palette.scales.some((s) => s.name === name)) && (
          <ul className="grid gap-2 sm:grid-cols-2">
            {STATUS_NAMES.map((name) => (
              <li
                key={name}
                className="rounded-md border px-3 py-2 text-sm"
                style={{
                  borderColor: `var(--g-${name}-500)`,
                  background: `var(--g-${name}-50)`,
                  color: `var(--g-${name}-800)`,
                }}
              >
                <span className="font-semibold">{p.status[name].title}</span> {p.status[name].text}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

function ScaleRows({ palette, pinned, vision }: { palette: Palette; pinned: boolean; vision: Vision }) {
  return (
    <div className="flex flex-col gap-10">
      {palette.scales.map((scale) => (
        <div key={scale.name} className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h3 className="font-mono text-base text-fg">{scale.name}</h3>
            {scale.name !== "neutral" && (
              <p className="annotate">
                {t.scales.closest(scale.anchor)}
                {pinned && scale.name === "brand" ? ` (${t.scales.pinned})` : ""}
              </p>
            )}
          </div>
          {(["light", "dark"] as const).map((mode) => (
            <div key={mode} className="flex flex-col gap-1.5">
              <p className="annotate">{mode === "light" ? t.scales.light : t.scales.dark}</p>
              <ul className="grid grid-cols-4 gap-1.5 sm:grid-cols-6 lg:grid-cols-11">
                {STEPS.map((step) => {
                  const s = scale[mode][step]
                  const ratio = s.contrast.toFixed(2)
                  return (
                    <li
                      key={step}
                      aria-label={t.scales.swatch(scale.name, mode, step, s.hex, ratio)}
                      className="flex min-h-20 flex-col justify-between rounded-md p-2 font-mono text-[11px] leading-tight"
                      style={{ background: see(s.hex, vision), color: see(s.on, vision) }}
                    >
                      <span aria-hidden="true" className="text-xs font-semibold">
                        {step}
                      </span>
                      <span aria-hidden="true">
                        {s.hex}
                        <br />
                        {ratio}:1
                      </span>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function CopyButton({ text, label }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 1800)
        } catch {
          // Clipboard blocked: the code stays selectable.
        }
      }}
      className="control control-ghost inline-flex h-9 items-center gap-1.5 self-start px-3 text-xs text-fg-muted hover:text-fg"
    >
      {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
      <span aria-live="polite">{copied ? t.export.copied : (label ?? t.export.copy)}</span>
    </button>
  )
}

function AuditSection() {
  const a = t.audit
  const [css, setCss] = useState(a.sample)
  const id = useId()
  const deferred = useDeferredValue(css)
  const result = useMemo(() => auditCss(deferred), [deferred])
  const failed = result.checks.filter((c) => !c.pass)
  // One line per scale and mode, with the failing pairs below it.
  const rows = useMemo(() => {
    const map = new Map<string, { scale: string; mode: string; total: number; failed: typeof failed }>()
    for (const c of result.checks) {
      const key = `${c.scale}-${c.mode}`
      const row = map.get(key) ?? { scale: c.scale, mode: c.mode, total: 0, failed: [] }
      row.total += 1
      if (!c.pass) row.failed.push(c)
      map.set(key, row)
    }
    return [...map.values()]
  }, [result])
  return (
    <Block id="audit" label={a.label} title={a.title} sub={a.sub} lede={<p>{a.lede}</p>}>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-2">
          <label htmlFor={id} className="annotate">
            {a.input}
          </label>
          <textarea
            id={id}
            value={css}
            onChange={(e) => setCss(e.target.value)}
            spellCheck={false}
            rows={14}
            className="well w-full min-w-0 resize-y p-3 font-mono text-xs text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          />
          <button
            type="button"
            onClick={() => setCss("")}
            className="control control-ghost inline-flex h-9 items-center self-start px-3 text-xs text-fg-muted hover:text-fg"
          >
            {a.clear}
          </button>
        </div>
        <div className="well flex min-w-0 flex-col gap-3 px-5 py-4" role="status">
          {result.scales.length === 0 ? (
            <p className="text-sm text-fg-muted">{a.empty}</p>
          ) : (
            <>
              <p className="text-sm text-fg">{failed.length === 0 ? a.allPass : a.someFail(failed.length)}</p>
              <ul className="flex flex-col gap-2 text-sm">
                {rows.map((row) => (
                  <li key={`${row.scale}-${row.mode}`} className="flex flex-col gap-1">
                    <span className="font-mono text-fg">
                      {row.scale} {row.mode}: {row.total - row.failed.length}/{row.total}
                    </span>
                    {row.failed.map((c) => (
                      <span key={`${c.foreground}-${c.background}`} className="pl-4 font-mono text-xs text-fg-muted">
                        {a.fail(c.foreground, c.background, c.ratio, c.required)}
                        {c.fix && (
                          <>
                            {" "}
                            {a.try}{" "}
                            <span
                              aria-hidden="true"
                              className="inline-block h-2.5 w-2.5 rounded-full align-middle"
                              style={{ background: c.fix }}
                            />{" "}
                            {c.fix}
                          </>
                        )}
                      </span>
                    ))}
                  </li>
                ))}
              </ul>
              {result.skipped.length > 0 && <p className="text-xs text-fg-muted">{a.skipped(result.skipped.length)}</p>}
            </>
          )}
        </div>
      </div>
      <div className="pt-8">
        <CodeBlock title={a.cli} code="npx @sweberdev/gradient audit app/globals.css" />
      </div>
    </Block>
  )
}

function PairCheck() {
  const p = t.pair
  const [text, setText] = useState("#ff5a5f")
  const [background, setBackground] = useState("#ffffff")
  const valid = isColor(text) && isColor(background)
  const result = useMemo(() => (valid ? checkPair(text, background) : null), [text, background, valid])
  const fixed = useMemo(
    () => (result && !result.aa ? fixContrast(text, background) : null),
    [result, text, background],
  )
  const mark = (ok: boolean) => (ok ? p.pass : p.fail)
  return (
    <Block id="pair" label={p.label} title={p.title} sub={p.sub} lede={<p>{p.lede}</p>}>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-6">
          <ColorField label={p.text} value={text} onChange={setText} />
          <ColorField label={p.background} value={background} onChange={setBackground} />
          {result && (
            <div
              className="rounded-xl border border-edge p-6"
              style={{ background: result.background, color: result.foreground }}
            >
              <p className="text-2xl font-semibold tracking-tight">{p.sampleLarge}</p>
              <p className="mt-2 text-sm leading-relaxed">{p.sample}</p>
            </div>
          )}
        </div>
        {result && (
          <div className="well flex min-w-0 flex-col gap-4 px-5 py-4" role="status">
            <p className="font-mono text-3xl text-fg">{result.ratio}:1</p>
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-1.5 text-sm">
              <dt className="text-fg-muted">{p.body}</dt>
              <dd className="text-fg">
                AA {mark(result.aa)} · AAA {mark(result.aaa)}
              </dd>
              <dt className="text-fg-muted">{p.large}</dt>
              <dd className="text-fg">
                AA {mark(result.aaLarge)} · AAA {mark(result.aaaLarge)}
              </dd>
              <dt className="text-fg-muted">{p.ui}</dt>
              <dd className="text-fg">{mark(result.aaLarge)}</dd>
              <dt className="text-fg-muted">APCA</dt>
              <dd className="text-fg">
                Lc {result.apca} <span className="text-fg-muted">{p.apcaNote}</span>
              </dd>
            </dl>
            {!result.aa && (
              <div className="flex flex-col gap-2 border-t border-edge pt-4">
                <p className="text-sm text-fg">{fixed ? p.suggestion(fixed, checkPair(fixed, background).ratio) : p.noFix}</p>
                {fixed && (
                  <button
                    type="button"
                    onClick={() => setText(fixed)}
                    className="control inline-flex items-center gap-2 self-start px-3 py-2 text-sm"
                  >
                    <span aria-hidden="true" className="h-3.5 w-3.5 rounded-full" style={{ background: fixed }} />
                    {p.use}
                  </button>
                )}
              </div>
            )}
            <CodeBlock title={p.cli} code={`npx @sweberdev/gradient check ${shellQuote(text)} ${shellQuote(background)}`} />
          </div>
        )}
      </div>
    </Block>
  )
}

function SeriesSection({ brand, vision }: { brand: string; vision: Vision }) {
  const s = t.series
  const [count, setCount] = useState(5)
  const countId = useId()
  const series = useMemo(() => createSeries(brand, { count }), [brand, count])
  const heights = [72, 48, 88, 36, 60, 80, 44, 66]
  return (
    <Block id="series" label={s.label} title={s.title} sub={s.sub} lede={<p>{s.lede}</p>}>
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <label htmlFor={countId} className="annotate">
            {s.count}
          </label>
          <select
            id={countId}
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="well h-11 w-full max-w-xs px-3 text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
          >
            {[3, 4, 5, 6, 7, 8].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          {(["light", "dark"] as const).map((mode) => (
            <div key={mode} className="flex min-w-0 flex-col gap-2">
              <p className="annotate">{mode === "light" ? t.scales.light : t.scales.dark}</p>
              <div
                className={`flex flex-col gap-4 rounded-xl border border-edge p-5 ${mode === "light" ? "bg-white" : "bg-black"}`}
                data-mode={mode}
              >
                <div className="flex h-24 items-end gap-2" role="img" aria-label={s.chartLabel(mode)}>
                  {series[mode].map((hex, i) => (
                    <div
                      key={`${hex}-${i}`}
                      className="flex-1 rounded-t-sm"
                      style={{ background: see(hex, vision), height: `${heights[i]}%` }}
                    />
                  ))}
                </div>
                <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px]" style={{ color: mode === "light" ? "#404040" : "#d4d4d4" }}>
                  {series[mode].map((hex, i) => (
                    <li key={`${hex}-${i}`} className="inline-flex items-center gap-1.5">
                      <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full" style={{ background: see(hex, vision) }} />
                      {i + 1} {hex}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
        <p className="text-sm text-fg-muted" role="status">
          {s.distance(series.distance)} {series.distance >= 0.08 ? s.good : s.label2}
        </p>
        <CodeBlock title={s.cli} code={`npx @sweberdev/gradient series ${shellQuote(brand)} --count ${count}`} />
      </div>
    </Block>
  )
}

function BlendSection() {
  const b = t.blend
  const [from, setFrom] = useState("#0a84ff")
  const [to, setTo] = useState("#ffd60a")
  const [text, setText] = useState("#ffffff")
  const valid = isColor(from) && isColor(to) && isColor(text)
  const blend = useMemo(() => (valid ? createBlend([from, to], { steps: 9 }) : null), [from, to, valid])
  const result = useMemo(() => (blend ? contrastOnBlend(blend, text) : null), [blend, text])
  return (
    <Block id="blend" label={b.label} title={b.title} sub={b.sub} lede={<p>{b.lede}</p>}>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-6">
          <ColorField label={b.from} value={from} onChange={setFrom} />
          <ColorField label={b.to} value={to} onChange={setTo} />
          <ColorField label={b.text} value={text} onChange={setText} />
        </div>
        {blend && result && (
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-col gap-2">
              <p className="annotate">{b.srgb}</p>
              <div className="h-14 rounded-xl border border-edge" style={{ background: `linear-gradient(90deg, ${from}, ${to})` }} />
            </div>
            <div className="flex flex-col gap-2">
              <p className="annotate">{b.oklch}</p>
              <div
                className="flex h-24 items-center justify-center rounded-xl border border-edge px-4 text-center text-lg font-semibold"
                style={{ background: blend.css, color: text }}
              >
                {b.textSample}
              </div>
            </div>
            <p className="text-sm text-fg" role="status">
              {b.contrast(result.min, result.max)} {result.pass ? b.pass : b.fail}
            </p>
          </div>
        )}
      </div>
      <div className="mt-8">
        <CodeBlock title={b.cli} code={`npx @sweberdev/gradient blend ${shellQuote(from)} ${shellQuote(to)} --steps 9`} />
      </div>
    </Block>
  )
}

const EXAMPLE_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="160"><rect width="240" height="160" fill="#ffffff"/><circle cx="80" cy="80" r="56" fill="#e30613"/><rect x="120" y="60" width="90" height="40" rx="8" fill="#0a84ff"/></svg>',
  )

function ImageSection({ onUse }: { onUse: (hex: string) => void }) {
  const m = t.image
  const inputId = useId()
  const [src, setSrc] = useState<string | null>(null)
  const [colors, setColors] = useState<{ hex: string; share: number }[] | null>(null)
  const [error, setError] = useState(false)
  const brand = colors ? pickBrand(colors) : null

  const load = (url: string, revoke = false) => {
    setError(false)
    const img = new Image()
    img.onload = () => {
      const scale = Math.min(1, 200 / Math.max(img.width, img.height))
      const canvas = document.createElement("canvas")
      canvas.width = Math.max(1, Math.round(img.width * scale))
      canvas.height = Math.max(1, Math.round(img.height * scale))
      const ctx = canvas.getContext("2d")
      if (!ctx) return setError(true)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      setColors(extractColors(ctx.getImageData(0, 0, canvas.width, canvas.height).data, { count: 5 }))
      setSrc(url)
      if (revoke) setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
    img.onerror = () => setError(true)
    img.src = url
  }

  return (
    <Block id="image" label={m.label} title={m.title} sub={m.sub} lede={<p>{m.lede}</p>}>
      <div className="grid gap-8 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <label htmlFor={inputId} className="control inline-flex cursor-pointer items-center self-start px-3 py-2 text-sm">
            {m.drop}
          </label>
          <input
            id={inputId}
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) load(URL.createObjectURL(file), true)
            }}
          />
          <button type="button" onClick={() => load(EXAMPLE_IMAGE)} className="control inline-flex items-center self-start px-3 py-2 text-sm">
            {m.example}
          </button>
          {src && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={src} alt="" className="max-h-40 max-w-full self-start rounded-xl border border-edge bg-white object-contain" />
          )}
          {error && (
            <p className="text-sm text-fg" role="alert">
              {m.error}
            </p>
          )}
        </div>
        {colors && (
          <div className="well flex flex-col gap-4 px-5 py-4" role="status">
            <p className="annotate">{m.colors}</p>
            <ul className="flex flex-col gap-1.5 font-mono text-sm text-fg">
              {colors.map((c) => (
                <li key={c.hex} className="inline-flex items-center gap-2">
                  <span aria-hidden="true" className="h-4 w-4 rounded-full border border-edge" style={{ background: c.hex }} />
                  {c.hex} <span className="text-fg-muted">{Math.round(c.share * 100)}%</span>
                </li>
              ))}
            </ul>
            <div className="flex flex-col gap-2 border-t border-edge pt-4">
              {brand ? (
                <>
                  <p className="text-sm text-fg">
                    {m.pick}: <span className="font-mono">{brand}</span>
                  </p>
                  <button type="button" onClick={() => onUse(brand)} className="control inline-flex items-center gap-2 self-start px-3 py-2 text-sm">
                    <span aria-hidden="true" className="h-3.5 w-3.5 rounded-full" style={{ background: brand }} />
                    {m.use}
                  </button>
                </>
              ) : (
                <p className="text-sm text-fg">{m.none}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </Block>
  )
}

const ACTION_YAML = `name: Colors
on: pull_request

permissions:
  contents: read
  pull-requests: write

jobs:
  gradient:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: Weber-Development/gradient@v1`

function ConfigSection({
  colors,
  status,
  pin,
}: {
  colors: Record<string, string>
  status: boolean
  pin: boolean
}) {
  const c = t.config
  const result = useMemo(() => {
    const config = parseConfig({
      colors,
      ...(status || pin ? { palette: { ...(status ? { status: true } : {}), ...(pin ? { pin: true } : {}) } } : {}),
      outputs: [
        { file: "app/globals.css", format: "shadcn" },
        { file: "src/colors.ts", format: "ts" },
        { file: "app/chart.css", format: "series", count: 5 },
      ],
    })
    return { config, rendered: renderConfig(config) }
  }, [colors, status, pin])
  const json = JSON.stringify(
    {
      $schema: "https://unpkg.com/@sweberdev/gradient/gradient.config.schema.json",
      ...result.config,
    },
    null,
    2,
  )
  return (
    <Block id="config" label={c.label} title={c.title} sub={c.sub} lede={<p>{c.lede}</p>}>
      <div className="flex flex-col gap-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="flex min-w-0 flex-col gap-2">
            <p className="annotate">{c.json}</p>
            <div className="max-h-[24rem] overflow-y-auto">
              <CodeBlock code={json} label={c.json} />
            </div>
          </div>
          <div className="well flex flex-col gap-3 px-5 py-4">
            <p className="annotate">{c.files}</p>
            <ul className="flex flex-col gap-1.5 font-mono text-sm text-fg">
              {result.rendered.outputs.map((o) => (
                <li key={o.file}>
                  {o.file} <span className="text-fg-muted">{c.lines(o.content.trimEnd().split("\n").length)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <CodeBlock title={c.cli} code={"npx @sweberdev/gradient build\nnpx @sweberdev/gradient build --verify"} />
        <CodeBlock title={c.action} code={ACTION_YAML} />
      </div>
    </Block>
  )
}

function shellQuote(value: string) {
  return `"${value.replace(/"/g, '\\"')}"`
}

export function PaletteStudio() {
  const [brand, setBrand] = useState("#e30613")
  const [accent, setAccent] = useState("#0a84ff")
  const [useAccent, setUseAccent] = useState(true)
  const [pin, setPin] = useState(false)
  const [status, setStatus] = useState(true)
  const [vision, setVision] = useState<Vision>("normal")
  const [shareUrl, setShareUrl] = useState("")
  const pinId = useId()
  const statusId = useId()
  const visionId = useId()
  const accentId = useId()

  // Dragging the color picker fires many events; let React skip stale ones.
  const deferredBrand = useDeferredValue(brand)
  const deferredAccent = useDeferredValue(accent)
  const palette = useMemo(() => {
    if (!isColor(deferredBrand) || (useAccent && !isColor(deferredAccent))) return null
    const colors: Record<string, string> = { brand: deferredBrand }
    if (useAccent) colors.accent = deferredAccent
    return createPalette(colors, { pin, status })
  }, [deferredBrand, deferredAccent, useAccent, pin, status])
  // Palettes can be shared: the colors live in the address.
  useEffect(() => {
    try {
      const q = new URLSearchParams(window.location.search)
      const b = q.get("brand")
      if (b && isColor(b)) setBrand(b)
      const a = q.get("accent")
      if (a === "none") setUseAccent(false)
      else if (a && isColor(a)) setAccent(a)
      if (q.get("pin") === "1") setPin(true)
      if (q.get("status") === "0") setStatus(false)
    } catch {
      // No address to read, the defaults stay.
    }
  }, [])
  useEffect(() => {
    if (!isColor(brand) || (useAccent && !isColor(accent))) return
    // Wait until typing or dragging pauses, then put the colors in the address.
    const timer = setTimeout(() => {
      try {
        const q = new URLSearchParams({ brand, accent: useAccent ? accent : "none" })
        if (pin) q.set("pin", "1")
        if (!status) q.set("status", "0")
        const url = `${window.location.pathname}?${q.toString()}`
        window.history.replaceState(null, "", url)
        setShareUrl(`${window.location.origin}${url}`)
      } catch {
        // History is not available, sharing stays off.
      }
    }, 300)
    return () => clearTimeout(timer)
  }, [brand, accent, useAccent, pin, status])
  // Keep showing the last valid palette while someone is typing a color.
  const last = useRef<Palette | null>(null)
  useEffect(() => {
    if (palette) last.current = palette
  }, [palette])
  const shown = palette ?? last.current ?? FALLBACK
  const hasAccent = shown.scales.some((s) => s.name === "accent")

  const checks = useMemo(() => checkPalette(shown), [shown])
  const failed = checks.filter((c) => !c.pass)
  const alike = useMemo(
    () => checkDistinguishable(shown).filter((c) => c.mode === "light" && !c.pass),
    [shown],
  )
  // One line per pair, listing every vision in which it looks alike.
  const alikePairs = useMemo(() => {
    const pairs = new Map<string, { a: string; b: string; visions: string[] }>()
    for (const c of alike) {
      const key = `${c.a}|${c.b}`
      const entry = pairs.get(key) ?? { a: c.a, b: c.b, visions: [] }
      entry.visions.push(t.vision.names[c.vision])
      pairs.set(key, entry)
    }
    return [...pairs.values()]
  }, [alike])

  const outputs = useMemo(() => {
    const v3 = toTailwindV3(shown)
    return {
      tailwind: toTailwind(shown),
      css: toCss(shown),
      lightDark: toCss(shown, { dark: "light-dark" }),
      tailwind3: `${v3.css}\n// tailwind.config.js → theme.extend.colors\n${JSON.stringify(v3.colors, null, 2)}\n`,
      tokens: `${JSON.stringify(toTokens(shown), null, 2)}\n`,
      shadcn: toShadcn(shown),
      scss: toScss(shown),
      ts: toTypeScript(shown),
    }
  }, [shown])

  const cli = [
    "npx @sweberdev/gradient",
    shellQuote(shown.scales[0]?.source ?? brand),
    hasAccent ? `accent=${shown.scales.find((s) => s.name === "accent")?.source}` : "",
    status ? "--status" : "",
    pin ? "--pin --check" : "",
    "--format tailwind --out app/gradient.css",
  ]
    .filter(Boolean)
    .join(" ")

  const tabs = (["tailwind", "shadcn", "css", "lightDark", "tailwind3", "scss", "ts", "tokens"] as const).map((id) => ({
    id,
    label: t.export[id],
    content: (
      <div className="flex flex-col gap-2">
        <CopyButton text={outputs[id]} />
        <div className="max-h-[28rem] overflow-y-auto">
          <CodeBlock code={outputs[id]} label={t.export[id]} />
        </div>
      </div>
    ),
  }))

  return (
    <>
      <Block id="colors" label={t.controls.label} title={t.scales.title} sub={t.scales.sub} lede={<p>{t.scales.lede}</p>}>
        <div className="flex flex-col gap-10">
          <div className="grid gap-6 md:grid-cols-2">
            <ColorField label={t.controls.brand} value={brand} onChange={setBrand} />
            {useAccent && <ColorField label={t.controls.accent} value={accent} onChange={setAccent} />}
          </div>
          <div className="flex flex-col gap-3">
            <p className="annotate">{t.controls.presets}</p>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((preset) => (
                <button
                  key={preset.color}
                  type="button"
                  onClick={() => setBrand(preset.color)}
                  aria-pressed={brand.toLowerCase() === preset.color}
                  className="control inline-flex items-center gap-2 px-3 py-2 text-sm aria-pressed:border-signal aria-pressed:bg-plate-hi"
                >
                  <span aria-hidden="true" className="h-3.5 w-3.5 rounded-full" style={{ background: preset.color }} />
                  {preset.name}
                </button>
              ))}
            </div>
            <div className="flex flex-col gap-2 pt-2 text-sm text-fg-muted">
              <label htmlFor={accentId} className="inline-flex items-center gap-2">
                <input id={accentId} type="checkbox" checked={useAccent} onChange={(e) => setUseAccent(e.target.checked)} />
                {t.controls.useAccent}
              </label>
              <label htmlFor={pinId} className="inline-flex items-center gap-2">
                <input id={pinId} type="checkbox" checked={pin} onChange={(e) => setPin(e.target.checked)} />
                {t.controls.pin}
              </label>
              <label htmlFor={statusId} className="inline-flex items-center gap-2">
                <input id={statusId} type="checkbox" checked={status} onChange={(e) => setStatus(e.target.checked)} />
                {t.controls.status}
              </label>
            </div>
            {shareUrl && (
              <div className="flex flex-col gap-2 pt-2">
                <CopyButton text={shareUrl} label={t.controls.share} />
                <p className="text-sm text-fg-muted">{t.controls.shareHint}</p>
              </div>
            )}
            <div className="flex flex-col gap-2 pt-2">
              <label htmlFor={visionId} className="annotate">
                {t.vision.label}
              </label>
              <select
                id={visionId}
                value={vision}
                onChange={(e) => setVision(e.target.value as Vision)}
                className="well h-11 w-full max-w-xs px-3 text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
              >
                {(["normal", ...DEFICIENCIES] as const).map((v) => (
                  <option key={v} value={v}>
                    {t.vision.names[v]}
                  </option>
                ))}
              </select>
              <p className="text-sm text-fg-muted">{t.vision.hint}</p>
            </div>
          </div>
          <ScaleRows palette={shown} pinned={pin} vision={vision} />
        </div>
      </Block>

      <Block label={t.preview.label} title={t.preview.title} sub={t.preview.sub} lede={<p>{t.preview.lede}</p>}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Preview palette={shown} mode="light" hasAccent={hasAccent} vision={vision} />
          <Preview palette={shown} mode="dark" hasAccent={hasAccent} vision={vision} />
        </div>
      </Block>

      <Block label={t.checks.label} title={t.checks.title} sub={t.checks.sub}>
        <div className="well flex flex-col gap-3 px-5 py-4" role="status">
          <p className="text-sm text-fg">{t.checks.passed(checks.length - failed.length, checks.length)}</p>
          {failed.length > 0 && (
            <>
              <p className="text-sm text-fg-muted">{t.checks.failedIntro}</p>
              <ul className="flex list-disc flex-col gap-1 pl-5 font-mono text-xs text-fg-muted">
                {failed.map((c) => (
                  <li key={`${c.scale}-${c.mode}-${c.foreground}-${c.background}`}>
                    {t.checks.failed(c.scale, c.mode, c.foreground, c.background, c.ratio, c.required)}
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="text-sm text-fg">{t.vision.summary(alikePairs.length)}</p>
          {alikePairs.length > 0 && (
            <ul className="flex list-disc flex-col gap-1 pl-5 font-mono text-xs text-fg-muted">
              {alikePairs.map((c) => (
                <li key={`${c.a}-${c.b}`}>{t.vision.alike(c.a, c.b, c.visions.join(", "))}</li>
              ))}
            </ul>
          )}
        </div>
      </Block>

      <SeriesSection brand={shown.scales[0]?.source ?? brand} vision={vision} />

      <AuditSection />

      <BlendSection />

      <ImageSection onUse={setBrand} />

      <PairCheck />

      <ConfigSection colors={shown.scales.filter((sc) => sc.name === "brand" || sc.name === "accent").reduce<Record<string, string>>((acc, sc) => ({ ...acc, [sc.name]: sc.source }), {})} status={status} pin={pin} />

      <Block id="export" label={t.export.label} title={t.export.title} sub={t.export.sub}>
        <div className="flex flex-col gap-8">
          <CodeBlock title={t.export.cli} code={cli} />
          <CookieTableTabs label={t.export.tabs} tabs={tabs} />
        </div>
      </Block>
    </>
  )
}
