"use client"

import { useCallback, useEffect, useId, useRef, useState } from "react"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import { vectorDemoCopy } from "@/lib/demo/vector-copy"
import {
  formatSeconds,
  useVector,
  type Attempt,
  type Delivery,
  type Endpoint,
  type Message,
  type VectorInstance,
  type VectorModule,
} from "./runtime"

const t = vectorDemoCopy.delivery

/** Short schedule for the demo: five attempts within about 3.5 minutes. */
const RETRY_SCHEDULE = [10, 30, 60, 120]
const MAX_ATTEMPTS = RETRY_SCHEDULE.length + 1
const TENANT = "acme"

const BEHAVIOURS = ["healthy", "failing", "limited", "slow", "gone"] as const
type Behaviour = (typeof BEHAVIOURS)[number]

const ENDPOINTS: { url: string; description: string; eventTypes: string[] | null; behaviour: Behaviour }[] = [
  { url: "https://billing.acme.example/webhooks", description: "Billing", eventTypes: ["invoice.*"], behaviour: "healthy" },
  { url: "https://crm.acme.example/hooks/vector", description: "CRM sync", eventTypes: ["customer.*", "invoice.paid"], behaviour: "failing" },
  { url: "https://archive.acme.example/in", description: "Audit archive", eventTypes: null, behaviour: "healthy" },
]

const EVENTS: { type: string; payload: unknown }[] = [
  { type: "invoice.paid", payload: { invoiceId: "inv_1042", amount: 4900, currency: "CHF" } },
  { type: "invoice.created", payload: { invoiceId: "inv_1043", amount: 12000, currency: "CHF" } },
  { type: "customer.updated", payload: { customerId: "cus_88", email: "anna@acme.example" } },
  { type: "order.shipped", payload: { orderId: "ord_311", carrier: "Swiss Post" } },
]

const STATUS_TONE: Record<Delivery["status"], string> = {
  pending: "text-amber-700 dark:text-amber-400",
  succeeded: "text-emerald-700 dark:text-emerald-400",
  failed: "text-red-700 dark:text-red-400",
  cancelled: "text-fg-muted",
}

interface Row {
  message: Message
  deliveries: { delivery: Delivery; attempts: Attempt[] }[]
}

interface Snapshot {
  endpoints: Endpoint[]
  rows: Row[]
}

interface ReceivedRequest {
  url: string
  headers: Record<string, string>
  body: string
}

interface Sim {
  vector: VectorInstance
  clock: { now: number; start: number }
  behaviour: Map<string, Behaviour>
  endpointIds: string[]
  messageIds: string[]
}

function simulatedFetch(sim: () => Sim | null, onRequest: (r: ReceivedRequest) => void) {
  return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url = String(input instanceof Request ? input.url : input)
    const headers: Record<string, string> = {}
    new Headers(init?.headers).forEach((v, k) => (headers[k] = v))
    onRequest({ url, headers, body: typeof init?.body === "string" ? init.body : "" })
    const behaviour = sim()?.behaviour.get(url) ?? "healthy"
    switch (behaviour) {
      case "healthy":
        return new Response('{"received":true}', { status: 200, headers: { "content-type": "application/json" } })
      case "failing":
        return new Response("Internal Server Error", { status: 500 })
      case "limited":
        return new Response("Too Many Requests", { status: 429, headers: { "retry-after": "90" } })
      case "gone":
        return new Response("This endpoint was removed", { status: 410 })
      case "slow":
        // Never answers; Vector's own timeout aborts the request.
        return new Promise<Response>((_, reject) => {
          const signal = init?.signal
          if (!signal) return
          if (signal.aborted) reject(signal.reason)
          signal.addEventListener("abort", () => reject(signal.reason), { once: true })
        })
    }
  }
}

async function snapshot(sim: Sim): Promise<Snapshot> {
  const { vector } = sim
  const endpoints = (await Promise.all(sim.endpointIds.map((id) => vector.endpoints.get(id)))).filter(
    (e): e is Endpoint => !!e,
  )
  const rows: Row[] = []
  for (const id of [...sim.messageIds].reverse()) {
    const message = await vector.messages.get(id)
    if (!message) continue
    const deliveries = await vector.deliveries.list({ messageId: id, limit: 100 })
    deliveries.sort((a, b) => sim.endpointIds.indexOf(a.endpointId) - sim.endpointIds.indexOf(b.endpointId))
    rows.push({
      message,
      deliveries: await Promise.all(
        deliveries.map(async (delivery) => ({
          delivery,
          attempts: (await vector.attempts.list({ deliveryId: delivery.id, limit: 100 })).reverse(),
        })),
      ),
    })
  }
  return { endpoints, rows }
}

/** Endpoints with switchable receivers, a fake clock and the delivery log, all on the real sender. */
export function DeliveryDemo() {
  const mod = useVector()
  const simRef = useRef<Sim | null>(null)
  const [snap, setSnap] = useState<Snapshot | null>(null)
  const [busy, setBusy] = useState(false)
  const [now, setNow] = useState(0)
  const [start, setStart] = useState(0)
  const [announcement, setAnnouncement] = useState("")
  const [lastRequest, setLastRequest] = useState<ReceivedRequest | null>(null)
  const [eventType, setEventType] = useState(EVENTS[0]!.type)
  const [generation, setGeneration] = useState(0)
  const eventId = useId()

  const refresh = useCallback(async () => {
    const sim = simRef.current
    if (!sim) return
    setSnap(await snapshot(sim))
    setNow(sim.clock.now)
  }, [])

  // Build a fresh sender with three endpoints. Runs again on "Start over".
  useEffect(() => {
    if (!mod) return
    let alive = true
    const setup = async (m: VectorModule) => {
      const startAt = Math.floor(Date.now() / 1000) * 1000
      const clock = { now: startAt, start: startAt }
      const behaviour = new Map<string, Behaviour>()
      let sim: Sim | null = null
      const vector = m.createVector({
        store: new m.MemoryStore(),
        retrySchedule: RETRY_SCHEDULE,
        timeoutMs: 1500,
        disableEndpointAfter: 3,
        now: () => new Date(clock.now),
        // Browsers cannot resolve DNS; every demo host gets a public address.
        urlPolicy: { resolveHost: async () => ["93.184.215.14"] },
        fetch: simulatedFetch(
          () => sim,
          (r) => alive && setLastRequest(r),
        ),
        onError: () => {},
      })
      vector.on("endpoint.disabled", ({ endpoint, reason }) => {
        if (alive) setAnnouncement(t.announceDisabled(endpoint.url, reason))
      })
      const endpointIds: string[] = []
      for (const e of ENDPOINTS) {
        const created = await vector.endpoints.create({
          tenant: TENANT,
          url: e.url,
          description: e.description,
          eventTypes: e.eventTypes,
        })
        behaviour.set(e.url, e.behaviour)
        endpointIds.push(created.id)
      }
      sim = { vector, clock, behaviour, endpointIds, messageIds: [] }
      if (!alive) return
      simRef.current = sim
      setStart(startAt)
      setLastRequest(null)
      setAnnouncement("")
      await refresh()
    }
    setup(mod).catch(() => {})
    return () => {
      alive = false
    }
  }, [mod, generation, refresh])

  /** Runs one step, then lets the worker do one pass, then reads the store again. */
  const run = async (step: (sim: Sim) => Promise<unknown>, pass = true) => {
    const sim = simRef.current
    if (!sim || busy) return
    setBusy(true)
    try {
      await step(sim)
      if (pass) {
        const r = await sim.vector.process()
        if (r.claimed > 0) setAnnouncement(t.announcePass(r))
      }
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  if (mod === false) return <p className="text-sm text-fg-muted">{vectorDemoCopy.failed}</p>
  if (!mod || !snap) return <p className="text-sm text-fg-muted">{vectorDemoCopy.loading}</p>

  const nextDue = snap.rows
    .flatMap((r) => r.deliveries.map((d) => d.delivery))
    .filter((d) => d.status === "pending" && d.nextAttemptAt)
    .map((d) => d.nextAttemptAt!.getTime())
    .sort((a, b) => a - b)[0]

  const send = () =>
    run(async (sim) => {
      const event = EVENTS.find((e) => e.type === eventType) ?? EVENTS[0]!
      const { message } = await sim.vector.send({ tenant: TENANT, eventType: event.type, payload: event.payload })
      sim.messageIds.push(message.id)
    })
  const advance = (seconds: number) =>
    run(async (sim) => {
      sim.clock.now += seconds * 1000
    })
  const jump = () =>
    run(async (sim) => {
      if (nextDue && nextDue > sim.clock.now) sim.clock.now = nextDue
    })

  const endpointName = (id: string) => snap.endpoints.find((e) => e.id === id)?.description ?? id
  const clockText = new Date(now).toISOString().slice(11, 19) + " UTC"
  const btn = "control px-4 py-2 text-sm disabled:opacity-50"

  return (
    <div className="flex flex-col gap-10">
      <p className="max-w-3xl text-sm leading-relaxed text-fg-muted">{t.schedule}</p>

      <section aria-label={t.endpoints} className="flex flex-col gap-4">
        <h3 className="text-lg tracking-tight">{t.endpoints}</h3>
        <ul className="grid gap-3 md:grid-cols-3">
          {snap.endpoints.map((e) => (
            <EndpointCard
              key={e.id}
              endpoint={e}
              behaviour={simRef.current?.behaviour.get(e.url) ?? "healthy"}
              busy={busy}
              onBehaviour={(b) => {
                simRef.current?.behaviour.set(e.url, b)
                void refresh()
              }}
              onEnable={() => run((sim) => sim.vector.endpoints.update(e.id, { enabled: true }), false)}
              onTest={() =>
                run(async (sim) => {
                  const d = await sim.vector.sendTest(e.id)
                  if (d) sim.messageIds.push(d.messageId)
                }, false)
              }
            />
          ))}
        </ul>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex flex-col gap-3">
          <label htmlFor={eventId} className="annotate">
            {t.eventType}
          </label>
          <div className="flex flex-wrap gap-3">
            <select
              id={eventId}
              className="control min-w-0 flex-1 px-3 py-2 font-mono text-sm"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            >
              {EVENTS.map((e) => (
                <option key={e.type} value={e.type}>
                  {e.type}
                </option>
              ))}
            </select>
            <button type="button" className={btn + " control-primary"} onClick={send} disabled={busy}>
              {t.send}
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-3">
          <p className="annotate">
            {t.clock}: <span className="tabular text-fg">{clockText}</span>{" "}
            <span>({t.elapsed(formatSeconds((now - start) / 1000))})</span>
          </p>
          <div role="group" aria-label={t.advance} className="flex flex-wrap gap-2">
            {t.advanceBy.map((a) => (
              <button key={a.seconds} type="button" className={btn} onClick={() => advance(a.seconds)} disabled={busy}>
                {a.label}
              </button>
            ))}
            <button type="button" className={btn} onClick={jump} disabled={busy || !nextDue}>
              {t.next}
            </button>
          </div>
        </div>
      </div>

      <p aria-live="polite" className="min-h-[1.25rem] text-sm text-fg-muted">
        {busy ? t.working : announcement}
      </p>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
        <section aria-label={t.log} className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-lg tracking-tight">{t.log}</h3>
            <button
              type="button"
              className={btn}
              disabled={busy}
              onClick={() => {
                simRef.current = null
                setSnap(null)
                setGeneration((g) => g + 1)
              }}
            >
              {t.reset}
            </button>
          </div>
          {snap.rows.length === 0 && <p className="text-sm text-fg-muted">{t.empty}</p>}
          <ol className="flex flex-col gap-3">
            {snap.rows.map(({ message, deliveries }) => (
              <li key={message.id} className="well flex flex-col gap-3 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="text-sm text-fg">
                    <code className="font-mono">{message.eventType}</code>{" "}
                    <span className="annotate break-all">{message.id}</span>
                  </p>
                  <button
                    type="button"
                    className="control px-3 py-1.5 text-xs disabled:opacity-50"
                    disabled={busy || deliveries.length === 0}
                    onClick={() => run((sim) => sim.vector.resend(message.id))}
                  >
                    {t.resend}
                  </button>
                </div>
                {deliveries.length === 0 && (
                  <p className="text-sm text-fg-muted">{t.noSubscriber}</p>
                )}
                <ul className="flex flex-col gap-2">
                  {deliveries.map(({ delivery: d, attempts }) => (
                    <li key={d.id} className="border-t border-edge-soft pt-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm">
                          <span className="text-fg-muted">{t.to} </span>
                          <span className="text-fg">{endpointName(d.endpointId)}</span>{" "}
                          <span className={STATUS_TONE[d.status]}>{t.status[d.status]}</span>
                        </p>
                        {(d.status === "failed" || d.status === "cancelled") && (
                          <button
                            type="button"
                            className="control px-3 py-1.5 text-xs disabled:opacity-50"
                            disabled={busy}
                            onClick={() => run((sim) => sim.vector.retry(d.id))}
                          >
                            {t.retry}
                          </button>
                        )}
                      </div>
                      <p className="annotate">
                        {t.attemptsOf(d.attempts, MAX_ATTEMPTS)}
                        {d.status === "pending" &&
                          d.nextAttemptAt &&
                          ", " +
                            (d.nextAttemptAt.getTime() <= now
                              ? t.dueNow
                              : t.nextIn(formatSeconds((d.nextAttemptAt.getTime() - now) / 1000)))}
                        {d.lastError && d.status !== "succeeded" ? ` · ${d.lastError}` : ""}
                      </p>
                      {attempts.length > 0 && (
                        <ol aria-label={t.attempts} className="mt-1.5 flex flex-col gap-0.5 font-mono text-xs text-fg-muted">
                          {attempts.map((a, i) => (
                            <li key={a.id} className="tabular">
                              #{i + 1} {t.attemptAt(`+${formatSeconds((a.at.getTime() - start) / 1000)}`)} ·{" "}
                              <span className={a.success ? STATUS_TONE.succeeded : STATUS_TONE.failed}>
                                {a.statusCode ?? a.error ?? "error"}
                              </span>
                              {a.statusCode !== null && a.error ? ` ${a.error}` : ""}
                            </li>
                          ))}
                        </ol>
                      )}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>

        <div className="flex min-w-0 flex-col gap-4">
          {lastRequest ? (
            <CodeBlock
              title={t.lastRequest}
              code={[
                `POST ${lastRequest.url}`,
                ...Object.entries(lastRequest.headers).map(([k, v]) => `${k}: ${v}`),
                "",
                prettyJson(lastRequest.body),
              ].join("\n")}
            />
          ) : (
            <div className="flex flex-col gap-2">
              <p className="annotate">{t.lastRequest}</p>
              <p className="text-sm text-fg-muted">{t.noRequest}</p>
            </div>
          )}
          <CodeBlock
            title={t.senderCode}
            code={`const vector = createVector({
  store: new MemoryStore(),
  retrySchedule: [10, 30, 60, 120], // default: ~27 h
  disableEndpointAfter: 3,          // default: 10
  timeoutMs: 1500,
  now: () => demoClock,
  fetch: simulatedReceivers,
})

await vector.send({ tenant: "acme", eventType, payload })
await vector.process() // what the worker does`}
          />
        </div>
      </div>
    </div>
  )
}

function prettyJson(body: string): string {
  try {
    return JSON.stringify(JSON.parse(body), null, 2)
  } catch {
    return body
  }
}

function EndpointCard({
  endpoint: e,
  behaviour,
  busy,
  onBehaviour,
  onEnable,
  onTest,
}: {
  endpoint: Endpoint
  behaviour: Behaviour
  busy: boolean
  onBehaviour: (b: Behaviour) => void
  onEnable: () => void
  onTest: () => void
}) {
  const id = useId()
  return (
    <li className="cast flex min-w-0 flex-col gap-3 p-5">
      <div className="flex flex-col gap-1">
        <p className="text-base text-fg">{e.description}</p>
        <code className="break-all font-mono text-xs text-fg-muted">{e.url}</code>
      </div>
      <p className="text-sm text-fg-muted">
        {t.filter}:{" "}
        <code className="font-mono text-fg">{e.eventTypes ? e.eventTypes.join(", ") : t.allEvents}</code>
      </p>
      <label htmlFor={id} className="flex flex-col gap-1.5">
        <span className="annotate">{t.behaviour}</span>
        <select
          id={id}
          className="control w-full px-3 py-2 text-sm"
          value={behaviour}
          onChange={(ev) => onBehaviour(ev.target.value as Behaviour)}
        >
          {BEHAVIOURS.map((b) => (
            <option key={b} value={b}>
              {t.behaviours[b]}
            </option>
          ))}
        </select>
      </label>
      <div className="flex flex-col gap-0.5 text-sm">
        <p className={e.enabled ? STATUS_TONE.succeeded : STATUS_TONE.failed}>{e.enabled ? t.enabled : t.disabled}</p>
        {!e.enabled && e.disabledReason && <p className="text-fg-muted">{e.disabledReason}</p>}
        {e.failureStreak > 0 && <p className="text-fg-muted">{t.streak(e.failureStreak)}</p>}
      </div>
      <div className="mt-auto flex flex-wrap gap-2">
        {!e.enabled && (
          <button type="button" className="control px-3 py-1.5 text-xs disabled:opacity-50" disabled={busy} onClick={onEnable}>
            {t.enable}
          </button>
        )}
        <button type="button" className="control px-3 py-1.5 text-xs disabled:opacity-50" disabled={busy} onClick={onTest}>
          {t.test}
        </button>
      </div>
    </li>
  )
}
