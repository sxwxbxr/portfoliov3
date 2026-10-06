"use client"

import { useSearchParams } from "next/navigation"
import { Check } from "lucide-react"
import { copy } from "@/lib/copy"
import { POLAR_PORTAL_URL } from "@/lib/packages/polar"

/**
 * Shown after a Polar checkout, which returns to the package page with
 * `?checkout=success`. Polar sends no thank-you page of its own, so this is
 * where a buyer learns how to get from the order to the private repository.
 */
export function CheckoutSuccess({ name, docsHref }: { name: string; docsHref?: string }) {
  const params = useSearchParams()
  if (params.get("checkout") !== "success") return null
  const t = copy.packages.checkoutSuccess

  return (
    <div role="status" className="well flex w-full flex-col gap-4 px-5 py-5 md:px-6">
      <p className="flex items-center gap-2 text-lg tracking-tight text-fg">
        <Check className="h-4 w-4 shrink-0" aria-hidden="true" />
        {t.title(name)}
      </p>
      <ol className="flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed text-fg-muted marker:text-fg-subtle">
        <li>
          {t.portal}{" "}
          <a
            href={POLAR_PORTAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-fg underline underline-offset-2 hover:text-fg-muted"
          >
            {t.portalLink}
          </a>
        </li>
        <li>{t.seats}</li>
        <li>{t.github}</li>
        <li>
          {t.install}
          {docsHref && (
            <>
              {" "}
              <a href={docsHref} className="text-fg underline underline-offset-2 hover:text-fg-muted">
                {t.docsLink}
              </a>
            </>
          )}
        </li>
      </ol>
      <p className="text-sm text-fg-muted">
        {t.help}{" "}
        <a href="mailto:info@sweber.dev" className="text-fg underline underline-offset-2 hover:text-fg-muted">
          info@sweber.dev
        </a>
      </p>
    </div>
  )
}
