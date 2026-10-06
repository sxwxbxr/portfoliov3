import type { Metadata } from "next"
import Link from "next/link"
import type { ReactNode } from "react"
import { ManageSubscription } from "@/components/physio/account/AccountActions"
import { PlanPicker, type PlanOption } from "@/components/physio/account/PlanPicker"
import { accountCopy } from "@/lib/physio/copy/account"
import { availablePlans } from "@/lib/physio/polar"
import { getPhysioUser, hasActiveSubscription } from "@/lib/physio/session"
import { PHYSIO_TOOLS } from "@/lib/physio/tools"
import { physioPath, physioUrl } from "@/lib/physio/urls"

export const dynamic = "force-dynamic"

const c = accountCopy.plans

export const metadata: Metadata = {
  title: c.metaTitle,
  description: c.lede,
  alternates: { canonical: physioUrl("/abo") },
}

/** Price texts are plain env strings ("3 CHF pro Monat"): the amount itself is set in Polar and shown again at checkout. */
const PRICE_LABELS = {
  monthly: () => process.env.PHYSIO_PRICE_MONTHLY_LABEL?.trim() ?? "",
  yearly: () => process.env.PHYSIO_PRICE_YEARLY_LABEL?.trim() ?? "",
}

const btn = "control inline-flex min-h-11 items-center px-5 py-2.5 text-sm"

function List({ heading, items }: { heading: string; items: string[] }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg tracking-tight">{heading}</h2>
      <ul className="flex flex-col gap-2.5">
        {items.map((t) => (
          <li key={t} className="measure leading-relaxed text-fg-muted">
            {t}
          </li>
        ))}
      </ul>
    </section>
  )
}

function Panel({ children }: { children: ReactNode }) {
  return <div className="well flex max-w-xl flex-col items-start gap-5 p-6 md:p-8">{children}</div>
}

export default async function PlansPage() {
  const user = await getPhysioUser()
  const plans = availablePlans()
  const options: PlanOption[] = plans.map((plan) => ({ plan, label: PRICE_LABELS[plan]() }))
  const demo = PHYSIO_TOOLS.find((t) => t.status === "live" && t.demoPath)
  const nextAfterLogin = encodeURIComponent("/abo")

  let action: ReactNode
  if (plans.length === 0) {
    action = (
      <Panel>
        <h2 className="text-xl tracking-tight">{c.soon.title}</h2>
        <p className="measure leading-relaxed text-fg-muted">{c.soon.text}</p>
        <div className="flex flex-wrap gap-3">
          {demo?.demoPath && (
            <Link href={physioPath(demo.demoPath)} className={`${btn} control-primary`}>
              {c.soon.demo}
            </Link>
          )}
          <Link href={physioPath("/vorschlaege")} className={btn}>
            {c.soon.suggest}
          </Link>
        </div>
      </Panel>
    )
  } else if (!user) {
    action = (
      <div className="flex max-w-xl flex-col gap-6">
        <ul className="flex flex-col gap-1 text-fg-muted">
          {options.map((o) => (
            <li key={o.plan}>
              <span className="text-fg">{c[o.plan].title}</span>
              {o.label ? `: ${o.label}` : ""}
            </li>
          ))}
        </ul>
        <Panel>
          <p className="measure leading-relaxed text-fg-muted">{c.needAccount.text}</p>
          <div className="flex flex-wrap gap-3">
            <Link href={physioPath("/registrieren")} className={`${btn} control-primary`}>
              {c.needAccount.register}
            </Link>
            <Link href={`${physioPath("/anmelden")}?next=${nextAfterLogin}`} className={btn}>
              {c.needAccount.login}
            </Link>
          </div>
        </Panel>
      </div>
    )
  } else if (hasActiveSubscription(user.subscriptionStatus) && !user.cancelAtPeriodEnd) {
    action = (
      <Panel>
        <p className="leading-relaxed">{c.already.text}</p>
        <ManageSubscription />
      </Panel>
    )
  } else if (!user.emailVerified) {
    action = (
      <Panel>
        <p className="measure leading-relaxed text-fg-muted">{c.needVerify.text}</p>
        <Link href={physioPath("/konto")} className={`${btn} control-primary`}>
          {c.needVerify.action}
        </Link>
      </Panel>
    )
  } else {
    action = (
      <div className="max-w-xl">
        <PlanPicker options={options} />
      </div>
    )
  }

  return (
    <div className="sheet pt-10 pb-24 md:pt-16 md:pb-32">
      <header className="mb-12 flex flex-col gap-4">
        <h1 className="display text-balance">{c.title}</h1>
        <p className="lede">{c.lede}</p>
      </header>

      <div className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16">
        <div className="flex flex-col gap-10">
          <List heading={c.includes.heading} items={c.includes.items} />
          <List heading={c.billing.heading} items={c.billing.items} />
        </div>
        <div className="flex flex-col gap-4">{action}</div>
      </div>
    </div>
  )
}
