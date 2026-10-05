"use client"

import { useEffect, useId, useState } from "react"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import { vectorDemoCopy } from "@/lib/demo/vector-copy"
import { useVector } from "./runtime"

const t = vectorDemoCopy.signing
const area =
  "well min-h-[150px] w-full resize-y p-4 font-mono text-[13px] leading-relaxed text-fg focus-visible:outline-2 focus-visible:outline-signal"
const field = "well w-full px-3 py-2 font-mono text-[13px] text-fg"

const SAMPLE = JSON.stringify(
  {
    type: "invoice.paid",
    timestamp: "2026-10-05T09:00:00.000Z",
    data: { invoiceId: "inv_1042", amount: 4900, currency: "CHF" },
  },
  null,
  2,
)

const MESSAGE_ID = "msg_2pV7c1QeS0Kd8xJm4TzR"

type Headers = { "webhook-id": string; "webhook-timestamp": string; "webhook-signature": string }
type Result = { ok: true; id: string } | { ok: false; code: string; message: string } | null

/** Sign a body with a secret, then verify what a receiver gets after you change parts of it. */
export function SignDemo() {
  const mod = useVector()
  const [secret, setSecret] = useState("")
  const [body, setBody] = useState(SAMPLE)
  const [timestamp, setTimestamp] = useState(0)
  const [headers, setHeaders] = useState<Headers | null>(null)
  // Receiver overrides; null means "exactly what was sent".
  const [rxBody, setRxBody] = useState<string | null>(null)
  const [rxSecret, setRxSecret] = useState<string | null>(null)
  const [rxTimestamp, setRxTimestamp] = useState<string | null>(null)
  const [skew, setSkew] = useState(0)
  const [result, setResult] = useState<Result>(null)
  const ids = {
    secret: useId(),
    body: useId(),
    rxBody: useId(),
    rxSecret: useId(),
    rxTimestamp: useId(),
    clock: useId(),
  }

  useEffect(() => {
    if (!mod || secret) return
    setSecret(mod.generateSecret())
    setTimestamp(Math.floor(Date.now() / 1000))
  }, [mod, secret])

  useEffect(() => {
    if (!mod || !secret) return
    let alive = true
    mod.signHeaders({ id: MESSAGE_ID, timestamp, payload: body, secret }).then(
      (h) => alive && setHeaders(h),
      () => alive && setHeaders(null),
    )
    return () => {
      alive = false
    }
  }, [mod, secret, body, timestamp])

  const received = {
    body: rxBody ?? body,
    secret: rxSecret ?? secret,
    timestamp: rxTimestamp ?? headers?.["webhook-timestamp"] ?? "",
  }

  useEffect(() => {
    if (!mod || !headers) return
    let alive = true
    const now = new Date(Date.now() + skew * 1000)
    mod
      .verify(received.body, { ...headers, "webhook-timestamp": received.timestamp }, received.secret, { now })
      .then(
        (v) => alive && setResult({ ok: true, id: v.id }),
        (e: unknown) => {
          if (!alive) return
          const err = e as { code?: string; message?: string }
          setResult({ ok: false, code: err.code ?? "error", message: err.message ?? String(e) })
        },
      )
    return () => {
      alive = false
    }
  }, [mod, headers, received.body, received.secret, received.timestamp, skew])

  if (mod === false) return <p className="text-sm text-fg-muted">{vectorDemoCopy.failed}</p>
  if (!mod || !secret) return <p className="text-sm text-fg-muted">{vectorDemoCopy.loading}</p>

  const resetReceiver = () => {
    setRxBody(null)
    setRxSecret(null)
    setRxTimestamp(null)
    setSkew(0)
  }
  const tamper = () => {
    const current = rxBody ?? body
    setRxBody(current.includes("4900") ? current.replace("4900", "49") : current + " ")
  }

  const headerText = headers
    ? Object.entries(headers)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")
    : ""
  const receiverCode = `import { verify } from "@sweberdev/vector"

// rawBody exactly as received, not re-serialised JSON
const event = await verify(rawBody, request.headers, process.env.WEBHOOK_SECRET)`

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
      <div className="flex min-w-0 flex-col gap-4">
        <h3 className="text-lg tracking-tight">{t.sender}</h3>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={ids.secret} className="annotate">
            {t.secret}
          </label>
          <input id={ids.secret} className={field} value={secret} readOnly />
          <button
            type="button"
            className="control self-start px-4 py-2 text-sm"
            onClick={() => {
              setSecret(mod.generateSecret())
            }}
          >
            {t.newSecret}
          </button>
        </div>
        <label htmlFor={ids.body} className="flex flex-col gap-1.5">
          <span className="annotate">{t.body}</span>
          <textarea id={ids.body} className={area} value={body} spellCheck={false} onChange={(e) => setBody(e.target.value)} />
        </label>
        <CodeBlock title={t.headers} code={headerText || "…"} />
        <button
          type="button"
          className="control self-start px-4 py-2 text-sm"
          onClick={() => setTimestamp(Math.floor(Date.now() / 1000))}
        >
          {t.resign}
        </button>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <h3 className="text-lg tracking-tight">{t.receiver}</h3>
        <label htmlFor={ids.rxBody} className="flex flex-col gap-1.5">
          <span className="annotate">{t.rxBody}</span>
          <textarea
            id={ids.rxBody}
            className={area}
            value={received.body}
            spellCheck={false}
            onChange={(e) => setRxBody(e.target.value)}
          />
        </label>
        <label htmlFor={ids.rxSecret} className="flex flex-col gap-1.5">
          <span className="annotate">{t.rxSecret}</span>
          <input id={ids.rxSecret} className={field} value={received.secret} onChange={(e) => setRxSecret(e.target.value)} />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label htmlFor={ids.rxTimestamp} className="flex flex-col gap-1.5">
            <span className="annotate">{t.rxTimestamp}</span>
            <input
              id={ids.rxTimestamp}
              className={field}
              inputMode="numeric"
              value={received.timestamp}
              onChange={(e) => setRxTimestamp(e.target.value)}
            />
          </label>
          <label htmlFor={ids.clock} className="flex flex-col gap-1.5">
            <span className="annotate">{t.clock}</span>
            <select
              id={ids.clock}
              className="control w-full px-3 py-2 text-sm"
              value={skew}
              onChange={(e) => setSkew(Number(e.target.value))}
            >
              {t.clocks.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="control px-4 py-2 text-sm" onClick={tamper}>
            {t.tamper}
          </button>
          <button type="button" className="control px-4 py-2 text-sm" onClick={() => setRxSecret(mod.generateSecret())}>
            {t.wrongSecret}
          </button>
          <button type="button" className="control px-4 py-2 text-sm" onClick={resetReceiver}>
            {t.reset}
          </button>
        </div>

        <div aria-live="polite" aria-atomic="true" className="well px-5 py-4">
          {result === null ? (
            <p className="text-sm text-fg-muted">…</p>
          ) : result.ok ? (
            <p className="text-sm text-emerald-700 dark:text-emerald-400">{t.valid}</p>
          ) : (
            <div className="flex flex-col gap-1">
              <p className="text-sm text-red-700 dark:text-red-400">
                {t.invalid}: <code className="font-mono">{result.code}</code>
              </p>
              <p className="text-sm text-fg-muted">{t.codes[result.code] ?? result.message}</p>
            </div>
          )}
        </div>
        <CodeBlock title={t.verifyCode} code={receiverCode} />
      </div>
    </div>
  )
}
