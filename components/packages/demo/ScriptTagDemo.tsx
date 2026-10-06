"use client"

import { useEffect, useRef, useState } from "react"
import { createMemoryStorage } from "@permitojs/core"
import { type ConsentUI, createConsentUI } from "@permitojs/core/ui"
import "@permitojs/core/styles.css"
import { copy } from "@/lib/copy"

/*
 * The framework-free UI from @permitojs/core/ui (since 0.3.0), the same code the
 * script-tag build runs. Like CoreDemo it is isolated from the site's own consent:
 * memory storage, no Google Consent Mode, no script activation, rendered into the
 * frame below.
 */

const t = copy.packages.demo.scriptTag

const CONFIG = {
  consentVersion: "demo",
  language: "en",
  categories: [{ id: "necessary", required: true }, { id: "statistics" }, { id: "marketing" }],
}

const SNIPPET = `<script type="application/json" id="permito-config">
  { "config": { "consentVersion": "2026-10", "categories": [
      { "id": "necessary", "required": true },
      { "id": "statistics" }, { "id": "marketing" } ] } }
</script>
<script src="/vendor/permito.global.js" data-config="#permito-config"></script>

<a href="#" data-permito-open>Cookie settings</a>`

export function ScriptTagDemo() {
  const frame = useRef<HTMLDivElement>(null)
  const ui = useRef<ConsentUI | null>(null)
  const [run, setRun] = useState(0)
  const [decision, setDecision] = useState<Record<string, boolean> | null>(null)

  useEffect(() => {
    if (!frame.current) return
    const instance = createConsentUI({
      config: { ...CONFIG, storage: createMemoryStorage() },
      container: frame.current,
      theme: "light",
      preferencesButton: "bottom-right",
      blockedElements: false,
      injectStyles: false,
      autoFocus: false,
    })
    ui.current = instance
    const update = () => setDecision(instance.manager.getSnapshot().decision?.categories ?? null)
    update()
    const unsubscribe = instance.manager.subscribe(update)
    return () => {
      unsubscribe()
      instance.destroy()
      ui.current = null
    }
  }, [run])

  const btn =
    "control min-h-11 px-5 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal md:min-h-10"

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-3">
        <button type="button" className={btn} onClick={() => ui.current?.openPreferences()}>
          {t.openPreferences}
        </button>
        <button type="button" className={btn} onClick={() => setRun((r) => r + 1)}>
          {t.restart}
        </button>
      </div>

      <div className="grid min-w-0 gap-8 lg:grid-cols-2">
        <figure className="flex min-w-0 flex-col gap-3">
          <div
            ref={frame}
            data-pmt-theme="light"
            className="relative h-[420px] overflow-hidden rounded-[var(--radius)] border border-edge-mid"
            // Same containment trick as CoreDemo: keeps the fixed banner inside the frame.
            style={{ transform: "translateZ(0)", contain: "layout paint", colorScheme: "light", background: "#f4f4f1" }}
          />
          <figcaption className="annotate">{t.previewLabel}</figcaption>
        </figure>
        <div className="flex min-w-0 flex-col gap-3">
          <p className="annotate">{t.snippetLabel}</p>
          <pre className="well overflow-x-auto px-5 py-4 font-mono text-[13px] leading-relaxed">
            <code>{SNIPPET}</code>
          </pre>
          <div className="well px-5 py-4 text-sm" aria-live="polite">
            {!decision ? (
              <p className="text-fg-muted">{t.resultPending}</p>
            ) : (
              <p className="font-mono text-[13px]">
                {Object.entries(decision)
                  .map(([id, granted]) => `${id}: ${granted}`)
                  .join(" · ")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
