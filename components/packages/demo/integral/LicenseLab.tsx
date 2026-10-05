"use client"

import { type ReactNode, useCallback, useEffect, useId, useMemo, useState } from "react"
import { Check, Copy, Lock } from "lucide-react"
import { Block } from "@/components/site/Block"
import { CodeBlock } from "@/components/packages/demo/CodeBlock"
import {
  coversRelease,
  createEntitlements,
  decodeLicense,
  definePlans,
  generateKeyPair,
  type KeyPair,
  type LicensePayload,
  type LicenseVerification,
  planFor,
  signLicense,
  verifyLicense,
} from "@/lib/demo/integral"
import { integralDemo } from "@/lib/demo/integral-copy"

/*
 * Runs the vendored copy of @sweberdev/integral in the browser: key pair,
 * signing, verification and entitlements. The Pro section simulates the
 * webhook events the license server of Integral Pro handles and re-signs the
 * license with the same rules.
 */

const t = integralDemo
const PRODUCT = "demo-app"

const plans = definePlans({
  free: { label: "Free", features: ["editor"], limits: { projects: 1 } },
  pro: { extends: "free", label: "Pro", features: ["export", "sync"], limits: { projects: 10 } },
  team: { extends: "pro", label: "Team", features: ["sso"], limits: { projects: null } },
})

const PLANS_SOURCE = `import { definePlans } from "@sweberdev/integral"

export const plans = definePlans({
  free: {
    label: "Free",
    features: ["editor"],
    limits: { projects: 1 },
  },
  pro: {
    extends: "free",
    label: "Pro",
    features: ["export", "sync"],
    limits: { projects: 10 },
  },
  team: {
    extends: "pro",
    label: "Team",
    features: ["sso"],
    limits: { projects: null }, // unlimited
  },
})`

const FEATURES = ["editor", "export", "sync", "sso", "beta"]

const field =
  "well h-11 w-full min-w-0 px-3 text-sm text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
const btn = "control inline-flex items-center gap-1.5 px-4 py-2 text-sm"

function isoDay(date: Date) {
  return date.toISOString().slice(0, 10)
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 86_400_000)
}

function addMonth(date: Date) {
  const next = new Date(date)
  next.setUTCMonth(next.getUTCMonth() + 1)
  return next
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
          // Clipboard blocked: the text stays selectable.
        }
      }}
      className="control control-ghost inline-flex h-9 items-center gap-1.5 self-start px-3 text-xs text-fg-muted hover:text-fg"
    >
      {copied ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
      <span aria-live="polite">{copied ? t.issue.copied : t.issue.copy}</span>
    </button>
  )
}

function Field({ label, children, id }: { label: string; children: ReactNode; id: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <label htmlFor={id} className="annotate">
        {label}
      </label>
      {children}
    </div>
  )
}

/** Changes the signed content without re-signing, like someone editing the license by hand. */
function tamper(license: string): string {
  const [prefix, body, signature] = license.split(".")
  const payload = decodeLicense(license)
  if (!prefix || !body || !signature || !payload) return license
  const json = JSON.stringify({ ...payload, plan: "team" })
  const bytes = new TextEncoder().encode(json)
  let binary = ""
  bytes.forEach((b) => (binary += String.fromCharCode(b)))
  const encoded = btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
  return `${prefix}.${encoded}.${signature}`
}

type SimStatus = "active" | "canceled" | "ended" | "revoked"

interface SimState {
  now: Date
  periodEnd: Date | null
  status: SimStatus | null
  license: string | null
  payload: LicensePayload | null
  log: string[]
  lifetime: boolean
}

const SIM_START = new Date("2026-10-05T09:00:00Z")
const EMPTY_SIM: SimState = {
  now: SIM_START,
  periodEnd: null,
  status: null,
  license: null,
  payload: null,
  log: [],
  lifetime: false,
}

function ProSimulator({ keys }: { keys: KeyPair }) {
  const [sim, setSim] = useState<SimState>(EMPTY_SIM)
  const [validToday, setValidToday] = useState<boolean | null>(null)
  const p = t.pro

  // Same rules as integral-server: updates until period end + 3 days, refund sets exp.
  const issue = useCallback(
    async (state: SimState, status: SimStatus, dates: { exp?: string; updatesUntil?: string }, event: string) => {
      const license = await signLicense(
        {
          id: state.payload?.id,
          product: PRODUCT,
          plan: "pro",
          customer: { email: "kunde@example.ch" },
          iat: state.now.toISOString(),
          ...dates,
          meta: { source: state.lifetime ? "order" : "subscription" },
        },
        keys.privateKey
      )
      return {
        ...state,
        status,
        license,
        payload: decodeLicense(license),
        log: [`${isoDay(state.now)}  ${event}`, ...state.log],
      }
    },
    [keys]
  )

  async function run(action: keyof typeof p.events) {
    let next: SimState = sim
    if (action === "reset") {
      setSim(EMPTY_SIM)
      return
    }
    if (action === "purchase") {
      const periodEnd = addMonth(sim.now)
      next = await issue(
        { ...EMPTY_SIM, now: sim.now, periodEnd },
        "active",
        { updatesUntil: addDays(periodEnd, 3).toISOString() },
        "subscription.active → license issued"
      )
    } else if (action === "lifetime") {
      next = await issue({ ...EMPTY_SIM, now: sim.now, lifetime: true }, "active", {}, "order.paid → lifetime license issued")
    } else if (action === "renew" && sim.periodEnd) {
      const now = sim.periodEnd
      const periodEnd = addMonth(now)
      next = await issue(
        { ...sim, now, periodEnd },
        "active",
        { updatesUntil: addDays(periodEnd, 3).toISOString() },
        "subscription.updated → license renewed"
      )
    } else if (action === "cancel" && sim.periodEnd) {
      next = await issue(
        sim,
        "canceled",
        { updatesUntil: sim.payload?.updatesUntil },
        "subscription.canceled → runs until period end"
      )
    } else if (action === "end" && sim.periodEnd) {
      const now = sim.periodEnd
      next = await issue(
        { ...sim, now },
        "ended",
        { updatesUntil: now.toISOString() },
        "subscription.revoked → updates end, license keeps working"
      )
    } else if (action === "refund") {
      next = await issue(
        sim,
        "revoked",
        { exp: sim.now.toISOString(), updatesUntil: sim.now.toISOString() },
        "order.refunded → license revoked"
      )
    }
    setSim(next)
  }

  useEffect(() => {
    let cancelled = false
    if (!sim.license) {
      setValidToday(null)
      return
    }
    verifyLicense(sim.license, {
      publicKey: keys.publicKey,
      product: PRODUCT,
      now: addDays(sim.now, 1),
    }).then((r) => {
      if (!cancelled) setValidToday(r.valid)
    })
    return () => {
      cancelled = true
    }
  }, [sim, keys])

  const has = sim.status !== null
  const subscription = has && !sim.lifetime
  const actions: { id: keyof typeof p.events; enabled: boolean }[] = [
    { id: "purchase", enabled: !has },
    { id: "lifetime", enabled: !has },
    { id: "renew", enabled: subscription && sim.status === "active" },
    { id: "cancel", enabled: subscription && sim.status === "active" },
    { id: "end", enabled: subscription && sim.status === "canceled" },
    { id: "refund", enabled: has && sim.status !== "revoked" },
    { id: "reset", enabled: has },
  ]

  const day = (iso?: string) => (iso ? new Date(iso).toLocaleDateString("en-GB", { dateStyle: "medium" }) : p.forever)

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <button key={a.id} type="button" disabled={!a.enabled} onClick={() => void run(a.id)} className={btn + " disabled:opacity-40"}>
            {p.events[a.id]}
          </button>
        ))}
      </div>
      <p className="annotate">{p.clock(day(sim.now.toISOString()))}</p>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="well flex flex-col gap-3 px-5 py-4" role="status" aria-live="polite">
          {sim.payload && sim.status ? (
            <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
              <dt className="text-fg-muted">{p.status}</dt>
              <dd className="text-fg">{p.statuses[sim.status]}</dd>
              <dt className="text-fg-muted">{p.updatesUntil}</dt>
              <dd className="text-fg">{day(sim.payload.updatesUntil)}</dd>
              <dt className="text-fg-muted">{p.expires}</dt>
              <dd className="text-fg">{day(sim.payload.exp)}</dd>
              <dt className="text-fg-muted">ID</dt>
              <dd className="font-mono text-xs text-fg">{sim.payload.id}</dd>
              <dt className="sr-only">Check</dt>
              <dd className="col-span-2 pt-1 text-fg">{validToday === null ? "" : p.checkToday(validToday)}</dd>
            </dl>
          ) : (
            <p className="text-sm text-fg-muted">{p.none}</p>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-2">
          <p className="annotate">{p.log}</p>
          <div className="well min-h-32 p-4">
            <ol className="flex flex-col gap-1 font-mono text-xs text-fg-muted">
              {sim.log.map((line, i) => (
                <li key={`${i}-${line}`}>{line}</li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

export function LicenseLab() {
  const [supported, setSupported] = useState<boolean | null>(null)
  const [keys, setKeys] = useState<KeyPair | null>(null)
  const [plan, setPlan] = useState("pro")
  const [email, setEmail] = useState("kunde@example.ch")
  const [beta, setBeta] = useState(false)
  const [projects, setProjects] = useState("")
  const [updatesUntil, setUpdatesUntil] = useState(() => isoDay(addDays(new Date(), 365)))
  const [expires, setExpires] = useState("")
  const [issued, setIssued] = useState("")
  const [input, setInput] = useState("")
  const [today, setToday] = useState(() => isoDay(new Date()))
  const [release, setRelease] = useState(() => isoDay(new Date()))
  const [result, setResult] = useState<LicenseVerification | null>(null)
  const [used, setUsed] = useState(1)
  const ids = {
    plan: useId(),
    email: useId(),
    beta: useId(),
    projects: useId(),
    updates: useId(),
    expires: useId(),
    input: useId(),
    today: useId(),
    release: useId(),
  }

  const newKeys = useCallback(async () => {
    try {
      setKeys(await generateKeyPair())
      setSupported(true)
    } catch {
      setSupported(false)
    }
  }, [])

  useEffect(() => {
    void newKeys()
  }, [newKeys])

  const sign = useCallback(async () => {
    if (!keys) return
    const limit = projects.trim() === "" ? undefined : Number(projects)
    const license = await signLicense(
      {
        product: PRODUCT,
        plan,
        customer: email ? { email } : undefined,
        features: beta ? ["beta"] : undefined,
        limits: limit !== undefined && Number.isFinite(limit) ? { projects: limit } : undefined,
        updatesUntil: updatesUntil || undefined,
        exp: expires || undefined,
      },
      keys.privateKey
    )
    setIssued(license)
    setInput(license)
  }, [keys, plan, email, beta, projects, updatesUntil, expires])

  // Issue a first license as soon as the keys exist.
  useEffect(() => {
    if (keys) void sign()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys])

  useEffect(() => {
    let cancelled = false
    if (!keys || !input.trim()) {
      setResult(null)
      return
    }
    const now = new Date(`${today}T12:00:00Z`)
    verifyLicense(input, { publicKey: keys.publicKey, product: PRODUCT, now: Number.isNaN(now.getTime()) ? new Date() : now })
      .then((r) => {
        if (!cancelled) setResult(r)
      })
      .catch(() => {
        if (!cancelled) setResult({ valid: false, reason: "malformed" })
      })
    return () => {
      cancelled = true
    }
  }, [input, keys, today])

  async function signWithStranger() {
    const stranger = await generateKeyPair()
    const payload = decodeLicense(issued)
    if (!payload) return
    const { v: _v, ...rest } = payload
    setInput(await signLicense(rest, stranger.privateKey))
  }

  const license = result?.valid ? result.license : null
  const entitlements = useMemo(() => createEntitlements({ plans, license }), [license])
  const projectCheck = entitlements.check("projects", used)
  const covered = license ? coversRelease(license, `${release}T12:00:00Z`) : true
  const decoded = useMemo(() => decodeLicense(input), [input])

  if (supported === false) {
    return (
      <Block label={t.keys.label} title={t.keys.title} flush>
        <p className="well px-5 py-4 text-sm text-fg" role="alert">
          {t.unsupported}
        </p>
      </Block>
    )
  }

  return (
    <>
      <Block
        label={t.keys.label}
        title={t.keys.title}
        sub={t.keys.sub}
        lede={<p>{t.keys.lede}</p>}
        aside={
          <button type="button" onClick={() => void newKeys()} className={btn + " self-start"}>
            {t.keys.regenerate}
          </button>
        }
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <CodeBlock title={t.keys.publicKey} code={keys?.publicKey ?? "…"} />
          <CodeBlock title={t.keys.privateKey} code={keys ? `${keys.privateKey.slice(0, 18)}…` : "…"} />
        </div>
        <div className="mt-6">
          <CodeBlock title={t.keys.cli} code="npx integral keygen" />
        </div>
      </Block>

      <Block label={t.issue.label} title={t.issue.title} sub={t.issue.sub} lede={<p>{t.issue.lede}</p>}>
        <form
          className="flex flex-col gap-8"
          onSubmit={(e) => {
            e.preventDefault()
            void sign()
          }}
        >
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Field label={t.issue.plan} id={ids.plan}>
              <select id={ids.plan} value={plan} onChange={(e) => setPlan(e.target.value)} className={field}>
                <option value="free">Free</option>
                <option value="pro">Pro</option>
                <option value="team">Team</option>
              </select>
            </Field>
            <Field label={t.issue.email} id={ids.email}>
              <input id={ids.email} type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
            </Field>
            <Field label={t.issue.projects} id={ids.projects}>
              <input
                id={ids.projects}
                type="number"
                min={0}
                inputMode="numeric"
                value={projects}
                onChange={(e) => setProjects(e.target.value)}
                className={field}
              />
            </Field>
            <Field label={t.issue.updatesUntil} id={ids.updates}>
              <input id={ids.updates} type="date" value={updatesUntil} onChange={(e) => setUpdatesUntil(e.target.value)} className={field} />
            </Field>
            <Field label={t.issue.expires} id={ids.expires}>
              <input id={ids.expires} type="date" value={expires} onChange={(e) => setExpires(e.target.value)} className={field} />
            </Field>
            <label htmlFor={ids.beta} className="inline-flex items-center gap-2 self-end pb-3 text-sm text-fg-muted">
              <input id={ids.beta} type="checkbox" checked={beta} onChange={(e) => setBeta(e.target.checked)} />
              {t.issue.beta}
            </label>
          </div>
          <button type="submit" className={btn + " control-primary self-start"} disabled={!keys}>
            {t.issue.sign}
          </button>
          {issued && (
            <div className="flex flex-col gap-2">
              <CopyButton text={issued} />
              <div className="break-all">
                <CodeBlock title={t.issue.result} code={issued} />
              </div>
            </div>
          )}
        </form>
      </Block>

      <Block label={t.verify.label} title={t.verify.title} sub={t.verify.sub} lede={<p>{t.verify.lede}</p>}>
        <div className="flex flex-col gap-8">
          <Field label={t.verify.input} id={ids.input}>
            <textarea
              id={ids.input}
              value={input}
              rows={4}
              spellCheck={false}
              onChange={(e) => setInput(e.target.value)}
              className="well w-full min-w-0 break-all px-3 py-2 font-mono text-xs text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
            />
          </Field>
          <div className="flex flex-wrap gap-2">
            <button type="button" className={btn} onClick={() => setInput(tamper(issued))} disabled={!issued}>
              {t.verify.tamper}
            </button>
            <button type="button" className={btn} onClick={() => void signWithStranger()} disabled={!issued}>
              {t.verify.foreign}
            </button>
            <button type="button" className={btn} onClick={() => setInput(issued)} disabled={!issued || input === issued}>
              {t.verify.reset}
            </button>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <Field label={t.verify.today} id={ids.today}>
              <input id={ids.today} type="date" value={today} onChange={(e) => setToday(e.target.value)} className={field} />
            </Field>
            <Field label={t.verify.release} id={ids.release}>
              <input id={ids.release} type="date" value={release} onChange={(e) => setRelease(e.target.value)} className={field} />
            </Field>
          </div>
          <div className="well flex flex-col gap-2 px-5 py-4" role="status" aria-live="polite">
            {result && (
              <p className="text-sm font-medium text-fg">
                {result.valid ? t.verify.valid : t.verify.invalid(t.verify.reasons[result.reason] ?? result.reason)}
              </p>
            )}
            {result?.valid && <p className="text-sm text-fg-muted">{covered ? t.verify.covered : t.verify.notCovered}</p>}
          </div>
          {decoded && <CodeBlock title={t.verify.payload} code={JSON.stringify(decoded, null, 2)} />}
        </div>
      </Block>

      <Block label={t.app.label} title={t.app.title} sub={t.app.sub} lede={<p>{t.app.lede}</p>}>
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <p className="text-base font-medium text-fg">{t.app.plan(entitlements.plan.label)}</p>
            <ul className="flex flex-col gap-2">
              {FEATURES.map((feature) => {
                const on = entitlements.has(feature)
                const where = planFor(plans, feature)
                return (
                  <li key={feature} className="well flex items-center justify-between gap-4 px-4 py-3 text-sm">
                    <span className={on ? "text-fg" : "text-fg-muted"}>{t.app.features[feature]}</span>
                    <span className="inline-flex items-center gap-1.5 text-xs text-fg-muted">
                      {on ? (
                        <>
                          <Check className="h-3.5 w-3.5" aria-hidden="true" />
                          {t.app.included}
                        </>
                      ) : (
                        <>
                          <Lock className="h-3.5 w-3.5" aria-hidden="true" />
                          {where ? t.app.locked(where.label) : t.app.lockedNoPlan}
                        </>
                      )}
                    </span>
                  </li>
                )
              })}
            </ul>
            <div className="flex flex-col gap-3">
              <p className="annotate">{t.app.projects}</p>
              <p className="text-sm text-fg" aria-live="polite">
                {t.app.usage(used, projectCheck.limit)}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={btn}
                  disabled={!entitlements.check("projects", used).allowed}
                  onClick={() => setUsed((n) => n + 1)}
                >
                  {t.app.add}
                </button>
                <button type="button" className={btn} disabled={used === 0} onClick={() => setUsed((n) => Math.max(0, n - 1))}>
                  {t.app.remove}
                </button>
              </div>
              {!projectCheck.allowed && <p className="text-sm text-fg-muted">{t.app.limitReached}</p>}
            </div>
          </div>
          <CodeBlock title={t.app.definition} code={PLANS_SOURCE} />
        </div>
      </Block>

      <Block label={t.pro.label} title={t.pro.title} sub={t.pro.sub} lede={<p>{t.pro.lede}</p>}>
        {keys && <ProSimulator keys={keys} />}
      </Block>
    </>
  )
}
