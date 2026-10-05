"use client"

import { useEffect, useId, useMemo, useRef, useState } from "react"
import { SHOP_FIXES, shopHtml, type ShopFix } from "@/lib/demo/surjection-shop"
import { copy } from "@/lib/copy"

/*
 * Runs axe-core, the engine of @sweberdev/surjection, inside a sandboxed frame
 * that holds the demo shop. The frame posts its findings back; nothing here
 * touches the page around it.
 */

const t = copy.packages.surjectionDemo.check
const AXE_URL = "/demos/surjection/axe-4.13.0.min.js"
const TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]
const IMPACT_ORDER = ["critical", "serious", "moderate", "minor"] as const

interface Finding {
  id: string
  impact: (typeof IMPACT_ORDER)[number]
  help: string
  tags: string[]
  targets: string[]
}

/** "wcag143" → "1.4.3". */
function criteria(tags: string[]) {
  return tags.flatMap((tag) => {
    const m = /^wcag(\d)(\d)(\d+)$/.exec(tag)
    return m ? [`${m[1]}.${m[2]}.${m[3]}`] : []
  })
}

function frameDoc(html: string, axe: string, run: string) {
  const script = `<script>${axe}</script><script>
axe.run(document, { runOnly: { type: "tag", values: ${JSON.stringify(TAGS)} }, resultTypes: ["violations"] })
  .then((r) => parent.postMessage({ type: "surjection-demo", run: ${JSON.stringify(run)}, violations: r.violations.map((v) => ({
    id: v.id, impact: v.impact, help: v.help, tags: v.tags, targets: v.nodes.map((n) => String(n.target)) })) }, "*"))
  .catch(() => parent.postMessage({ type: "surjection-demo", run: ${JSON.stringify(run)}, error: true }, "*"));
</script>`
  return html.replace("</body>", `${script}</body>`)
}

export function LiveCheck() {
  const [fixed, setFixed] = useState<Set<ShopFix>>(new Set())
  const [axe, setAxe] = useState<string | null>(null)
  const [failed, setFailed] = useState(false)
  const [findings, setFindings] = useState<Finding[] | null>(null)
  const frame = useRef<HTMLIFrameElement>(null)
  const current = useRef("")
  const headingId = useId()

  useEffect(() => {
    let alive = true
    fetch(AXE_URL)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((src) => alive && setAxe(src))
      .catch(() => alive && setFailed(true))
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow) return
      const data = event.data as { type?: string; run?: string; violations?: Finding[]; error?: boolean }
      if (data?.type !== "surjection-demo" || data.run !== current.current) return
      if (data.error) setFailed(true)
      else
        setFindings(
          [...(data.violations ?? [])].sort(
            (a, b) => IMPACT_ORDER.indexOf(a.impact) - IMPACT_ORDER.indexOf(b.impact)
          )
        )
    }
    window.addEventListener("message", onMessage)
    return () => window.removeEventListener("message", onMessage)
  }, [])

  // The run id names the fixes, so a late message from an earlier frame is ignored.
  const key = SHOP_FIXES.filter((f) => fixed.has(f)).join(",") || "none"
  const doc = useMemo(() => (axe ? frameDoc(shopHtml(fixed), axe, key) : null), [axe, fixed, key])

  useEffect(() => {
    current.current = key
    setFindings(null)
  }, [key])

  const toggle = (fix: ShopFix) =>
    setFixed((prev) => {
      const next = new Set(prev)
      if (next.has(fix)) next.delete(fix)
      else next.add(fix)
      return next
    })

  const elements = findings?.reduce((n, f) => n + f.targets.length, 0) ?? 0

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-16">
      <div className="flex min-w-0 flex-col gap-4">
        <p className="annotate">{t.previewLabel}</p>
        <div className="well overflow-hidden p-1.5">
          {doc ? (
            <iframe
              ref={frame}
              title={t.frameTitle}
              srcDoc={doc}
              sandbox="allow-scripts"
              className="block h-[440px] w-full rounded-md bg-white"
            />
          ) : (
            <div className="grid h-[440px] place-items-center text-sm text-fg-muted">
              {failed ? t.error : t.loading}
            </div>
          )}
        </div>

        <fieldset className="flex flex-col gap-2">
          <legend className="annotate mb-2">{t.fixesLegend}</legend>
          {SHOP_FIXES.map((fix) => (
            <label key={fix} className="flex items-start gap-3 text-sm text-fg">
              <input
                type="checkbox"
                checked={fixed.has(fix)}
                onChange={() => toggle(fix)}
                className="mt-1 h-4 w-4"
              />
              <span>
                {t.fixes[fix].label}{" "}
                <span className="text-fg-muted">({t.fixes[fix].criterion})</span>
              </span>
            </label>
          ))}
        </fieldset>
      </div>

      <section aria-labelledby={headingId} className="flex min-w-0 flex-col gap-4">
        <h3 id={headingId} className="text-lg tracking-tight">
          {t.resultHeading}
        </h3>
        <p className="text-sm text-fg" role="status" aria-live="polite">
          {failed ? t.error : findings === null ? t.running : t.summary(findings.length, elements)}
        </p>
        {findings && findings.length > 0 && (
          <ul className="flex flex-col divide-y divide-edge-soft border-t border-edge-soft">
            {findings.map((f) => (
              <li key={f.id} className="flex flex-col gap-1.5 py-3">
                <p className="flex flex-wrap items-baseline gap-x-3">
                  <span className="text-sm text-fg">{f.help}</span>
                </p>
                <p className="annotate">
                  {t.impact[f.impact]} · <code className="font-mono">{f.id}</code>
                  {criteria(f.tags).map((c) => (
                    <span key={c}>
                      {" "}
                      · WCAG {c} · EN 301 549 9.{c}
                    </span>
                  ))}
                </p>
                <p className="text-sm text-fg-muted">
                  {t.elements}:{" "}
                  {f.targets.map((target, i) => (
                    <span key={target}>
                      {i > 0 && ", "}
                      <code className="break-all font-mono text-[13px] text-fg">{target}</code>
                    </span>
                  ))}
                </p>
              </li>
            ))}
          </ul>
        )}
        <p className="text-sm leading-relaxed text-fg-muted">{t.limits}</p>
      </section>
    </div>
  )
}
