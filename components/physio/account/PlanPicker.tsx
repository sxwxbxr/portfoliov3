"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { accountCopy } from "@/lib/physio/copy/account"
import { postJson } from "./api"
import { FormAlert } from "./fields"

const c = accountCopy.plans

export type PlanOption = { plan: "monthly" | "yearly"; label: string }

/** One row per configured plan. A click creates the Polar checkout and sends the browser there. */
export function PlanPicker({ options }: { options: PlanOption[] }) {
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function choose(plan: PlanOption["plan"]) {
    if (busy) return
    setBusy(plan)
    setError(null)
    const res = await postJson<{ url: string }>("/api/physio/checkout", { plan })
    if (res.ok && res.data.url) return window.location.assign(res.data.url)
    setError(res.ok ? accountCopy.errors.generic : res.message)
    setBusy(null)
  }

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {options.map((o, i) => (
          <li key={o.plan} className="cast flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg tracking-tight">{c[o.plan].title}</h3>
              {o.label && <p className="text-fg">{o.label}</p>}
              <p className="text-sm text-fg-muted">{c[o.plan].note}</p>
            </div>
            <button
              type="button"
              onClick={() => choose(o.plan)}
              disabled={busy !== null}
              className={"control inline-flex min-h-11 items-center justify-center gap-2 px-5 py-2.5 text-sm " + (i === 0 ? "control-primary" : "")}
            >
              {busy === o.plan && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
              {busy === o.plan ? c.working : c[o.plan].cta}
            </button>
          </li>
        ))}
      </ul>
      <FormAlert message={error} />
    </div>
  )
}
