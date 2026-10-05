"use client"

import { type CSSProperties, useDeferredValue, useEffect, useId, useMemo, useRef, useState } from "react"
import { Check, Copy } from "lucide-react"
import { Block } from "@/components/site/Block"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import { CookieTableTabs } from "@/components/packages/demo/CookieTableTabs"
import {
  checkPalette,
  createPalette,
  type Mode,
  type Palette,
  parseColor,
  STEPS,
  toCss,
  toHex,
  toTailwind,
  toTailwindV3,
  toTokens,
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

/** Custom properties `--g-<name>-<step>` and `--g-<name>-on-<step>` of one mode. */
function variables(palette: Palette, mode: Mode): CSSProperties {
  const vars: Record<string, string> = {}
  for (const scale of palette.scales) {
    for (const step of STEPS) {
      vars[`--g-${scale.name}-${step}`] = scale[mode][step].hex
      vars[`--g-${scale.name}-on-${step}`] = scale[mode][step].on
    }
  }
  return vars as CSSProperties
}

function Preview({ palette, mode, hasAccent }: { palette: Palette; mode: Mode; hasAccent: boolean }) {
  const p = t.preview
  const inputId = useId()
  const accent = hasAccent ? "accent" : "brand"
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="annotate">{mode === "light" ? t.scales.light : t.scales.dark}</p>
      <div
        style={{ ...variables(palette, mode), colorScheme: mode }}
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
      </div>
    </div>
  )
}

function ScaleRows({ palette, pinned }: { palette: Palette; pinned: boolean }) {
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
                      style={{ background: s.hex, color: s.on }}
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

function CopyButton({ text }: { text: string }) {
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
      <span aria-live="polite">{copied ? t.export.copied : t.export.copy}</span>
    </button>
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
  const pinId = useId()
  const accentId = useId()

  // Dragging the color picker fires many events; let React skip stale ones.
  const deferredBrand = useDeferredValue(brand)
  const deferredAccent = useDeferredValue(accent)
  const palette = useMemo(() => {
    if (!isColor(deferredBrand) || (useAccent && !isColor(deferredAccent))) return null
    const colors: Record<string, string> = { brand: deferredBrand }
    if (useAccent) colors.accent = deferredAccent
    return createPalette(colors, { pin })
  }, [deferredBrand, deferredAccent, useAccent, pin])
  // Keep showing the last valid palette while someone is typing a color.
  const last = useRef<Palette | null>(null)
  useEffect(() => {
    if (palette) last.current = palette
  }, [palette])
  const shown = palette ?? last.current ?? FALLBACK
  const hasAccent = shown.scales.some((s) => s.name === "accent")

  const checks = useMemo(() => checkPalette(shown), [shown])
  const failed = checks.filter((c) => !c.pass)

  const outputs = useMemo(() => {
    const v3 = toTailwindV3(shown)
    return {
      tailwind: toTailwind(shown),
      css: toCss(shown),
      tailwind3: `${v3.css}\n// tailwind.config.js → theme.extend.colors\n${JSON.stringify(v3.colors, null, 2)}\n`,
      tokens: `${JSON.stringify(toTokens(shown), null, 2)}\n`,
    }
  }, [shown])

  const cli = [
    "npx @sweberdev/gradient",
    shellQuote(shown.scales[0]?.source ?? brand),
    hasAccent ? `accent=${shown.scales.find((s) => s.name === "accent")?.source}` : "",
    pin ? "--pin --check" : "",
    "--format tailwind --out app/gradient.css",
  ]
    .filter(Boolean)
    .join(" ")

  const tabs = (["tailwind", "css", "tailwind3", "tokens"] as const).map((id) => ({
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
            </div>
          </div>
          <ScaleRows palette={shown} pinned={pin} />
        </div>
      </Block>

      <Block label={t.preview.label} title={t.preview.title} sub={t.preview.sub} lede={<p>{t.preview.lede}</p>}>
        <div className="grid gap-6 lg:grid-cols-2">
          <Preview palette={shown} mode="light" hasAccent={hasAccent} />
          <Preview palette={shown} mode="dark" hasAccent={hasAccent} />
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
        </div>
      </Block>

      <Block id="export" label={t.export.label} title={t.export.title} sub={t.export.sub}>
        <div className="flex flex-col gap-8">
          <CodeBlock title={t.export.cli} code={cli} />
          <CookieTableTabs label={t.export.tabs} tabs={tabs} />
        </div>
      </Block>
    </>
  )
}
