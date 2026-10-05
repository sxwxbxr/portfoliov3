"use client"

import { useEffect, useState } from "react"
import {
  ConsentBanner,
  PermitoProvider,
  PreferenceCenter,
  createMemoryStorage,
  useConsent,
} from "@permitojs/react"
import { ConsentModal, TwoStepBanner } from "@weber-development/permito-themes"
import "@permitojs/react/styles.css"
import "@weber-development/permito-themes/themes/all.css"
import "@weber-development/permito-themes/layouts.css"
import { copy } from "@/lib/copy"

/*
 * Themes and layouts are the one Pro part that runs in the browser. The
 * catalog and the cookie table stay on the server (lib/demo/permito-server.ts).
 *
 * This provider is separate from the site's own consent provider on purpose:
 * it keeps its state in memory, sends nothing to Google Consent Mode, blocks
 * nothing, and portals into the frame below so the modal covers the preview
 * only. Clicking here cannot change the real consent of the site.
 */

const t = copy.packages.demo.themes

const THEMES = ["neutral", "minimal", "rounded", "contrast", "corporate", "warm"] as const
const MODES = ["light", "dark"] as const
const LAYOUTS = ["bottom", "bar", "corner", "twostep", "modal"] as const

type ThemeName = (typeof THEMES)[number]
type Mode = (typeof MODES)[number]
type Layout = (typeof LAYOUTS)[number]

function RadioGroup<T extends string>({
  legend,
  name,
  value,
  options,
  onChange,
}: {
  legend: string
  name: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <fieldset className="flex min-w-0 flex-col gap-2">
      <legend className="annotate mb-2">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o.value} className="relative">
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={value === o.value}
              onChange={() => onChange(o.value)}
              className="peer sr-only"
            />
            <span className="control flex min-h-11 cursor-pointer items-center px-4 text-sm peer-checked:border-signal peer-checked:bg-plate-hi peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-signal md:min-h-10">
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function MockSite({ mode }: { mode: Mode }) {
  const dark = mode === "dark"
  const bar = dark ? "bg-white/10" : "bg-black/10"
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex flex-col gap-6 p-5 md:p-8"
      style={{ background: dark ? "#161616" : "#f4f4f1", color: dark ? "#d8d8d8" : "#2a2a2a" }}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="font-mono text-sm">{t.mockHost}</span>
        <span className="flex gap-2">
          <span className={`h-2 w-10 rounded-full ${bar}`} />
          <span className={`h-2 w-10 rounded-full ${bar}`} />
          <span className={`hidden h-2 w-10 rounded-full sm:block ${bar}`} />
        </span>
      </div>
      <div className="flex max-w-md flex-col gap-3">
        <p className="text-2xl tracking-tight">{t.mockHeading}</p>
        <p className="text-sm leading-relaxed opacity-80">{t.mockBody}</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <span className={`h-20 rounded ${bar}`} />
        <span className={`h-20 rounded ${bar}`} />
        <span className={`h-20 rounded ${bar}`} />
      </div>
    </div>
  )
}

function Result() {
  const { ready, decision } = useConsent()
  return (
    <div className="well flex flex-col gap-3 px-5 py-4" aria-live="polite">
      <h3 className="text-base tracking-tight">{t.resultHeading}</h3>
      {!ready ? (
        <p className="text-sm text-fg-muted">{t.resultLoading}</p>
      ) : !decision ? (
        <p className="text-sm text-fg-muted">{t.resultPending}</p>
      ) : (
        <>
          <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            {Object.entries(decision.categories).map(([id, granted]) => (
              <div key={id} className="flex gap-2">
                <dt className="font-mono text-[13px] text-fg-muted">{id}</dt>
                <dd className="font-mono text-[13px] text-fg">{granted ? t.granted : t.declined}</dd>
              </div>
            ))}
          </dl>
          <p className="annotate">
            {t.resultSource}: {decision.source}. {t.resultTime}: {decision.timestamp}
          </p>
        </>
      )}
    </div>
  )
}

function Panel({
  onFrame,
  container,
  theme,
  setTheme,
  mode,
  setMode,
  layout,
  setLayout,
}: {
  onFrame: (el: HTMLDivElement | null) => void
  container: HTMLDivElement | null
  theme: ThemeName
  setTheme: (v: ThemeName) => void
  mode: Mode
  setMode: (v: Mode) => void
  layout: Layout
  setLayout: (v: Layout) => void
}) {
  const { decision, resetConsent } = useConsent()

  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-[2fr_1fr_2fr]">
        <RadioGroup
          legend={t.themeLegend}
          name="demo-theme"
          value={theme}
          options={THEMES.map((v) => ({ value: v, label: t.themeNames[v] }))}
          onChange={setTheme}
        />
        <RadioGroup
          legend={t.modeLegend}
          name="demo-mode"
          value={mode}
          options={MODES.map((v) => ({ value: v, label: t.modes[v] }))}
          onChange={setMode}
        />
        <div className="flex min-w-0 flex-col gap-3 md:col-span-2 xl:col-span-1">
          <RadioGroup
            legend={t.layoutLegend}
            name="demo-layout"
            value={layout}
            options={LAYOUTS.map((v) => ({ value: v, label: t.layouts[v] }))}
            onChange={(v) => {
              setLayout(v)
              // A new layout only shows if the visitor has not decided yet.
              void resetConsent()
            }}
          />
          <p className="annotate">{t.layoutHints[layout]}</p>
        </div>
      </div>

      <div>
        <button
          type="button"
          className="control min-h-11 px-5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal md:min-h-10"
          disabled={!decision}
          onClick={() => void resetConsent()}
        >
          {t.showAgain}
        </button>
      </div>

      <figure className="flex min-w-0 flex-col gap-3">
        <div
          ref={onFrame}
          data-pmt-theme={mode}
          className={`pmt-theme-${theme} relative h-[560px] overflow-hidden rounded-[var(--radius)] border border-edge-mid md:h-[520px]`}
          // A transform and paint containment make this box the containing
          // block for the fixed-position banner, so it stays inside the frame.
          style={{ transform: "translateZ(0)", contain: "layout paint", colorScheme: mode }}
        >
          <MockSite mode={mode} />
          {container && (
            <>
              {layout === "bottom" && <ConsentBanner position="bottom" />}
              {layout === "bar" && <ConsentBanner position="top" className="pmt-bar" />}
              {layout === "corner" && <ConsentBanner position="bottom-left" />}
              {layout === "twostep" && <TwoStepBanner position="bottom-right" />}
              {layout === "modal" && <ConsentModal />}
              <PreferenceCenter />
            </>
          )}
        </div>
        <figcaption className="annotate">{t.previewLabel}</figcaption>
      </figure>

      {layout === "modal" && <p className="annotate">{t.modalNote}</p>}

      <Result />
    </div>
  )
}

export function ThemeDemo() {
  // The demo manager uses memory storage, so it is ready on the server too and would render the
  // banner there, while the client portals it into the preview frame. Rendering only after mount
  // keeps server and client markup identical.
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="min-h-[36rem]" aria-busy="true" />
  return <ThemeDemoInner />
}

function ThemeDemoInner() {
  const [theme, setTheme] = useState<ThemeName>("neutral")
  const [mode, setMode] = useState<Mode>("light")
  const [layout, setLayout] = useState<Layout>("bottom")
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  const [config] = useState(() => ({
    consentVersion: "demo",
    language: "en",
    categories: [{ id: "necessary", required: true }, { id: "statistics" }, { id: "marketing" }],
    storage: createMemoryStorage(),
  }))

  return (
    <PermitoProvider
      config={config}
      theme={mode}
      portalContainer={container ?? undefined}
    >
      <Panel
        container={container}
        onFrame={setContainer}
        theme={theme}
        setTheme={setTheme}
        mode={mode}
        setMode={setMode}
        layout={layout}
        setLayout={setLayout}
      />
    </PermitoProvider>
  )
}
