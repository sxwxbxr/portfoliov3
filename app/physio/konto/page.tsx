import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import type { ReactNode } from "react"
import {
  ChangePasswordForm,
  DeleteAccount,
  LogoutButton,
  ManageSubscription,
  ResendVerification,
} from "@/components/physio/account/AccountActions"
import { accountCopy } from "@/lib/physio/copy/account"
import { getPhysioUser, hasActiveSubscription } from "@/lib/physio/session"
import { physioPath } from "@/lib/physio/urls"

export const dynamic = "force-dynamic"

const c = accountCopy.account

export const metadata: Metadata = {
  title: c.metaTitle,
  robots: { index: false, follow: false },
}

const formatDate = (d: Date) =>
  d.toLocaleDateString("de-CH", { timeZone: "Europe/Zurich", day: "numeric", month: "long", year: "numeric" })

/** One account topic: hairline, label column left, content right. */
function Row({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="grid gap-4 border-t border-edge-soft py-8 md:grid-cols-[14rem_1fr] md:gap-10">
      <h2 className="text-lg tracking-tight">{title}</h2>
      <div className="flex min-w-0 flex-col items-start gap-4">{children}</div>
    </section>
  )
}

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ checkout?: string }> }) {
  const user = await getPhysioUser()
  if (!user) redirect(`${physioPath("/anmelden")}?next=${encodeURIComponent("/konto")}`)

  const { checkout } = await searchParams
  const s = c.subscription
  const active = hasActiveSubscription(user.subscriptionStatus)
  const pastDue = user.subscriptionStatus === "past_due"
  const hasSubscriptionHistory = user.subscriptionStatus !== "none"
  const end = user.currentPeriodEnd
  const billing = (active || pastDue) && !user.cancelAtPeriodEnd

  return (
    <div className="sheet pt-10 pb-24 md:pt-16 md:pb-32">
      <header className="mb-10">
        <h1 className="display text-balance">{c.title}</h1>
      </header>

      {checkout === "success" && (
        <p role="status" className="well measure mb-10 p-5 text-sm leading-relaxed text-fg-muted">
          {c.checkoutSuccess}
        </p>
      )}

      <Row title={c.email.heading}>
        <p className="flex flex-wrap items-center gap-3">
          <span className="break-all">{user.email}</span>
          <span className="tab text-xs text-fg-muted">{user.emailVerified ? c.email.verified : c.email.unverified}</span>
        </p>
        {!user.emailVerified && (
          <>
            <p className="measure text-sm leading-relaxed text-fg-muted">{c.email.unverifiedHint}</p>
            <ResendVerification />
          </>
        )}
      </Row>

      <Row title={s.heading}>
        <p className="flex flex-wrap items-center gap-3">
          <span className="tab text-sm text-fg">{s.status[user.subscriptionStatus] ?? s.statusUnknown}</span>
        </p>
        {active && end && (
          <p className="measure leading-relaxed text-fg-muted">
            {user.cancelAtPeriodEnd ? s.endsOn(formatDate(end)) : s.renews(formatDate(end))}
          </p>
        )}
        {pastDue && <p className="measure leading-relaxed text-fg-muted">{s.pastDue}</p>}
        {!active && !pastDue && <p className="measure leading-relaxed text-fg-muted">{s.noneText}</p>}
        <div className="flex flex-wrap items-start gap-3">
          {!active && !pastDue && (
            <Link href={physioPath("/abo")} className="control control-primary inline-flex min-h-11 items-center px-5 py-2.5 text-sm">
              {s.subscribe}
            </Link>
          )}
          {hasSubscriptionHistory && <ManageSubscription />}
        </div>
        {hasSubscriptionHistory && <p className="measure text-sm leading-relaxed text-fg-muted">{s.manageHint}</p>}
      </Row>

      <Row title={c.password.heading}>
        <ChangePasswordForm />
      </Row>

      <Row title={c.session.heading}>
        <p className="measure text-sm leading-relaxed text-fg-muted">{c.session.text}</p>
        <LogoutButton />
      </Row>

      <Row title={c.delete.heading}>
        <p className="measure text-sm leading-relaxed text-fg-muted">{c.delete.text}</p>
        <DeleteAccount blocked={billing} />
      </Row>
    </div>
  )
}
