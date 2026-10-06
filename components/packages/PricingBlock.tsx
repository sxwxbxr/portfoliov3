"use client"

import { useState } from "react"
import Link from "next/link"
import { Check, Minus } from "lucide-react"
import { track } from "@vercel/analytics"
import type { Package, PriceTier } from "@/lib/packages/schema"
import { pkgPath } from "@/lib/packages/urls"
import { copy } from "@/lib/copy"

type Period = "monthly" | "yearly"

// Grouped by hand: Intl's de-CH separator differs between Node (') and browsers (’),
// which made every price a hydration mismatch.
const money = (amount: number) =>
  `CHF ${Math.round(amount).toString().replace(/\B(?=(\d{3})+(?!\d))/g, "\u2019")}`

/** Whole months saved when paying yearly, or 0 when there is no saving. */
function monthsFree(tier: PriceTier): number {
  if (!tier.monthly || !tier.yearly) return 0
  return Math.max(0, Math.round(12 - tier.yearly / tier.monthly))
}

export function PricingBlock({
  pkg,
}: {
  pkg: Pick<Package, "slug" | "name" | "pricing" | "pro">
}) {
  const [period, setPeriod] = useState<Period>("yearly")
  const { pricing, pro } = pkg
  if (!pricing) return null

  const comingSoon = !pro || pro.availability !== "available"
  const waitlist = pro?.waitlistUrl ?? "mailto:info@sweber.dev"
  const hasSubscription = pricing.tiers.some((t) => t.monthly || t.yearly)

  return (
    <div className="flex flex-col gap-8">
      {comingSoon && (
        <div className="well flex flex-col gap-1 px-5 py-4" role="note">
          <p className="text-base text-fg">
            {copy.packages.proComingSoon(pro?.name ?? pkg.name)}
          </p>
          <p className="text-sm leading-relaxed text-fg-muted">
            {copy.packages.proComingSoonBody}
          </p>
        </div>
      )}

      {hasSubscription && (
        <div
          role="group"
          aria-label={copy.packages.billingLabel}
          className="well flex w-fit items-center gap-0.5 rounded-full p-1"
        >
          {(["monthly", "yearly"] as const).map((p) => (
            <button
              key={p}
              type="button"
              aria-pressed={period === p}
              onClick={() => setPeriod(p)}
              className={
                "rounded-full px-4 py-1.5 text-sm transition-colors duration-150 " +
                (period === p
                  ? "bg-plate-hi text-fg"
                  : "text-fg-muted hover:text-fg")
              }
            >
              {copy.packages[p]}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        {pricing.tiers.map((tier) => {
          const isOneTime = tier.oneTime !== undefined
          const activePeriod: Period | "oneTime" = isOneTime ? "oneTime" : period
          const amount = isOneTime ? tier.oneTime : tier[period]
          const saved = !isOneTime && period === "yearly" ? monthsFree(tier) : 0
          const checkout = comingSoon ? undefined : tier.checkout[activePeriod]
          const href = checkout ?? waitlist
          const label = checkout
            ? isOneTime
              ? copy.packages.buyLifetime
              : copy.packages.subscribe
            : copy.packages.joinWaitlist

          return (
            <div
              key={tier.id}
              className={
                "cast flex flex-col gap-5 p-6 md:p-7"
              }
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="text-lg tracking-tight text-fg">
                    {tier.name}
                  </h3>
                  {tier.highlighted && (
                    <span className="tab text-xs text-fg-muted">
                      {copy.packages.recommended}
                    </span>
                  )}
                </div>
                {tier.description && (
                  <p className="text-sm leading-relaxed text-fg-muted">
                    {tier.description}
                  </p>
                )}
              </div>

              <div>
                {amount !== undefined ? (
                  <>
                    <p className="text-4xl tracking-tight tabular text-fg">
                      {money(amount)}
                    </p>
                    <p className="annotate mt-1">
                      {tier.perSeat
                        ? isOneTime
                          ? copy.packages.perSeatOneTime
                          : period === "monthly"
                            ? copy.packages.perSeatMonth
                            : copy.packages.perSeatYear
                        : isOneTime
                          ? copy.packages.oneTime
                          : period === "monthly"
                            ? copy.packages.perMonth
                            : copy.packages.perYear}
                    </p>
                    {saved > 0 && (
                      <p className="mt-2 text-sm text-fg-muted">
                        {copy.packages.saving(saved)}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-fg-muted">&nbsp;</p>
                )}
              </div>

              <ul className="flex flex-col gap-2.5 text-sm text-fg-muted">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 shrink-0 text-fg-muted" aria-hidden="true" />
                  {tier.perSeat
                    ? copy.packages.seatRange(tier.seats)
                    : copy.packages.seats(tier.seats)}
                </li>
                <li className="flex items-center gap-2">
                  {tier.support ? (
                    <Check className="h-3.5 w-3.5 shrink-0 text-fg-muted" aria-hidden="true" />
                  ) : (
                    <Minus className="h-3.5 w-3.5 shrink-0 text-fg-subtle" aria-hidden="true" />
                  )}
                  {tier.support
                    ? copy.packages.supportIncluded
                    : copy.packages.supportExcluded}
                </li>
              </ul>

              <a
                href={href}
                {...(checkout ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                onClick={() =>
                  track(checkout ? "checkout_click" : "waitlist_click", {
                    package: pkg.slug,
                    tier: tier.id,
                    period: activePeriod,
                  })
                }
                className={
                  "control mt-auto inline-flex items-center justify-center px-5 py-2.5 text-sm " +
                  (tier.highlighted ? "control-primary" : "")
                }
              >
                {label}
              </a>
            </div>
          )
        })}
      </div>

      <div className="flex flex-col gap-4">
        {pricing.custom && (
          <p className="text-sm text-fg-muted">
            <a
              href={`mailto:${pricing.custom.email}`}
              className="text-fg underline underline-offset-2 hover:text-fg-muted"
            >
              {copy.packages.customLine(pricing.custom.label)}
            </a>
          </p>
        )}
        {pricing.notes.length > 0 && (
          <ul className="flex list-disc flex-col gap-2 pl-5 text-sm leading-relaxed text-fg-muted marker:text-fg-subtle">
            {pricing.notes.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        )}
        <Link
          href={pkgPath("/license")}
          className="w-fit text-sm text-fg underline underline-offset-2 hover:text-fg-muted"
        >
          {copy.packages.licenseLink}
        </Link>
      </div>
    </div>
  )
}
