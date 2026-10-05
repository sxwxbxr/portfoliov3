"use client"

import { useEffect, useState } from "react"
import {
  ConsentBanner,
  ConsentGate,
  ConsentIframe,
  PermitoProvider,
  PreferenceCenter,
  createMemoryStorage,
  useConsent,
} from "@permitojs/react"
import "@permitojs/react/styles.css"
import { copy } from "@/lib/copy"

/*
 * The free core, @permitojs/react. Like ThemeDemo this provider is separate
 * from the site's own consent: memory storage, no Google Consent Mode, and the
 * banner and dialog portal into the frame below. Clicking here cannot change
 * the real consent of the site.
 */

const t = copy.packages.demo.core

const CONFIG = {
  consentVersion: "demo",
  language: "en",
  categories: [{ id: "necessary", required: true }, { id: "statistics" }, { id: "marketing" }],
  services: [
    {
      id: "youtube",
      name: "YouTube",
      provider: "Google Ireland Ltd.",
      category: "marketing",
      purpose: { en: "Embed videos" },
      privacyPolicyUrl: "https://policies.google.com/privacy",
    },
  ],
}

function MockSite() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 flex flex-col gap-6 p-5 md:p-8"
      style={{ background: "#f4f4f1", color: "#2a2a2a" }}
    >
      <div className="flex items-center justify-between gap-4">
        <span className="font-mono text-sm">{t.mockHost}</span>
        <span className="flex gap-2">
          <span className="h-2 w-10 rounded-full bg-black/10" />
          <span className="h-2 w-10 rounded-full bg-black/10" />
        </span>
      </div>
      <div className="flex max-w-md flex-col gap-3">
        <p className="text-2xl tracking-tight">{t.mockHeading}</p>
        <p className="text-sm leading-relaxed opacity-80">{t.mockBody}</p>
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
        <dl className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
          {Object.entries(decision.categories).map(([id, granted]) => (
            <div key={id} className="flex gap-2">
              <dt className="font-mono text-[13px] text-fg-muted">{id}</dt>
              <dd className="font-mono text-[13px] text-fg">{granted ? t.granted : t.declined}</dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  )
}

function Panel({
  onRestart,
  onFrame,
  container,
}: {
  onRestart: () => void
  onFrame: (el: HTMLDivElement | null) => void
  container: HTMLDivElement | null
}) {
  const { openPreferences } = useConsent()
  const btn =
    "control min-h-11 px-5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal md:min-h-10"

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-3">
        <button type="button" className={btn} onClick={openPreferences}>
          {t.openPreferences}
        </button>
        <button type="button" className={btn} onClick={onRestart}>
          {t.restart}
        </button>
      </div>

      <figure className="flex min-w-0 flex-col gap-3">
        <div
          ref={onFrame}
          data-pmt-theme="light"
          className="relative h-[460px] overflow-hidden rounded-[var(--radius)] border border-edge-mid md:h-[420px]"
          // A transform and paint containment make this box the containing
          // block for the fixed-position banner, so it stays inside the frame.
          style={{ transform: "translateZ(0)", contain: "layout paint", colorScheme: "light" }}
        >
          <MockSite />
          {container && (
            <>
              <ConsentBanner autoFocus={false} />
              <PreferenceCenter />
            </>
          )}
        </div>
        <figcaption className="annotate">{t.previewLabel}</figcaption>
      </figure>

      <div className="grid min-w-0 gap-8 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-3">
          <p className="annotate">{t.gateLabel}</p>
          <div className="well px-5 py-4 text-sm" aria-live="polite">
            <ConsentGate category="statistics" fallback={<p className="text-fg-muted">{t.statsBlocked}</p>}>
              <p className="text-fg">{t.statsAllowed}</p>
            </ConsentGate>
          </div>
        </div>
        <div className="flex min-w-0 flex-col gap-3">
          <p className="annotate">{t.iframeLabel}</p>
          <div className="min-w-0 [&_iframe]:aspect-video [&_iframe]:h-auto [&_iframe]:w-full">
            <ConsentIframe
              service="youtube"
              src="https://www.youtube-nocookie.com/embed/aqz-KE-bpKQ"
              title={t.videoTitle}
              width={480}
              height={270}
            />
          </div>
        </div>
      </div>

      <Result />
    </div>
  )
}

export function CoreDemo() {
  // Render only after mount, so server and client markup match (hydration error #418).
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="min-h-[36rem]" aria-busy="true" />
  return <CoreDemoInner />
}

function CoreDemoInner() {
  const [run, setRun] = useState(0)
  const [container, setContainer] = useState<HTMLDivElement | null>(null)
  // A restart needs a fresh memory store, so the provider remounts with a new one.
  const [config, setConfig] = useState(() => ({ ...CONFIG, storage: createMemoryStorage() }))
  const restart = () => {
    setConfig({ ...CONFIG, storage: createMemoryStorage() })
    setRun((r) => r + 1)
  }
  return (
    <PermitoProvider key={run} config={config} theme="light" portalContainer={container ?? undefined}>
      <Panel onRestart={restart} onFrame={setContainer} container={container} />
    </PermitoProvider>
  )
}
