"use client"

import { useEffect, useId, useState } from "react"
import { vectorDemoCopy } from "@/lib/demo/vector-copy"
import { useVector } from "./runtime"

const t = vectorDemoCopy.ssrf

const EXAMPLES = [
  "https://example.com/webhooks",
  "http://localhost:3000/hooks",
  "https://169.254.169.254/latest/meta-data/",
  "https://10.0.0.1/webhook",
  "https://[::1]/webhook",
  "https://[::ffff:192.168.1.10]/in",
  "http://example.com/webhooks",
  "https://user:pass@example.com/in",
  "https://intranet.acme.example/hooks",
]

/** Stand-in for DNS, which browsers do not offer. */
const DEMO_DNS: Record<string, string[]> = { "intranet.acme.example": ["10.0.0.12"] }
const resolveHost = async (host: string) => DEMO_DNS[host] ?? ["93.184.215.14"]

type Result = { ok: true } | { ok: false; reason: string }

/** Runs assertDeliverableUrl and isPrivateAddress on any URL. */
export function SsrfDemo() {
  const mod = useVector()
  const [url, setUrl] = useState(EXAMPLES[2]!)
  const [result, setResult] = useState<Result | null>(null)
  const inputId = useId()

  useEffect(() => {
    if (!mod) return
    let alive = true
    mod.assertDeliverableUrl(url.trim(), { resolveHost }).then(
      () => alive && setResult({ ok: true }),
      (e: unknown) => alive && setResult({ ok: false, reason: e instanceof Error ? e.message : String(e) }),
    )
    return () => {
      alive = false
    }
  }, [mod, url])

  if (mod === false) return <p className="text-sm text-fg-muted">{vectorDemoCopy.failed}</p>

  let host: string | null = null
  try {
    host = new URL(url.trim()).hostname.replace(/^\[|\]$/g, "")
  } catch {
    host = null
  }
  const isIp = host !== null && (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(":"))

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
      <div className="flex min-w-0 flex-col gap-4">
        <label htmlFor={inputId} className="flex flex-col gap-1.5">
          <span className="annotate">{t.input}</span>
          <input
            id={inputId}
            className="well w-full px-3 py-2 font-mono text-[13px] text-fg"
            value={url}
            spellCheck={false}
            autoComplete="off"
            onChange={(e) => setUrl(e.target.value)}
          />
        </label>
        <div aria-live="polite" aria-atomic="true" className="well flex flex-col gap-1 px-5 py-4">
          {!mod || result === null ? (
            <p className="text-sm text-fg-muted">{vectorDemoCopy.loading}</p>
          ) : result.ok ? (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">{t.allowed}</p>
          ) : (
            <p className="text-sm text-red-700 dark:text-red-400">
              {t.refused}: {result.reason.replace(/^Endpoint URL not allowed: /, "")}
            </p>
          )}
          {mod && isIp && host && <p className="font-mono text-xs text-fg-muted">{t.private(host, mod.isPrivateAddress(host))}</p>}
        </div>
        <p className="text-sm leading-relaxed text-fg-muted">{t.dnsNote}</p>
      </div>

      <div className="flex min-w-0 flex-col gap-3">
        <p className="annotate">{t.examples}</p>
        <ul className="flex flex-col gap-2">
          {EXAMPLES.map((example) => (
            <li key={example}>
              <button
                type="button"
                aria-pressed={url === example}
                className="control w-full break-all px-3 py-2 text-left font-mono text-xs"
                onClick={() => setUrl(example)}
              >
                {example}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
