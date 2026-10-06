import type { ReactNode } from "react"
import Link from "next/link"
import { siteCopy } from "@/lib/physio/copy/site"
import { physioPath } from "@/lib/physio/urls"
import { BrandMark } from "./BrandMark"
import { PhysioHeader } from "./PhysioHeader"

const c = siteCopy.footer
const MAIN_SITE = "https://www.sweber.dev"
const footerLink =
  "inline-flex min-h-11 items-center text-sm font-medium text-fg-muted transition-colors duration-150 hover:text-signal"

/**
 * Own header and footer: the portfolio Navigation is deliberately not used here.
 * `data-site="physio"` switches the design tokens to the light theme (app/physio/physio.css).
 */
export function PhysioShell({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div lang="de" data-site="physio" className={`flex min-h-dvh flex-col bg-ground text-fg ${className}`}>
      <PhysioHeader />
      <div className="flex-1">{children}</div>
      <footer className="border-t border-edge-soft bg-plate-hi">
        <div className="sheet flex flex-col gap-8 py-10 md:flex-row md:items-start md:justify-between">
          <div className="flex max-w-md flex-col gap-3">
            <p className="flex items-center gap-2.5">
              <BrandMark size={24} />
              <span className="font-[family-name:var(--font-physio-serif)] text-lg font-semibold tracking-tight">
                {siteCopy.brand.name}
              </span>
            </p>
            <p className="text-sm leading-relaxed text-fg-muted">{c.note}</p>
          </div>
          <nav aria-label={c.privacy} className="flex flex-wrap gap-x-6 md:justify-end">
            <Link href={physioPath("/datenschutz")} className={footerLink}>
              {c.privacy}
            </Link>
            <a href={`${MAIN_SITE}/imprint`} className={footerLink}>
              {c.imprint}
            </a>
            <a href={MAIN_SITE} className={footerLink}>
              {c.main}
            </a>
          </nav>
        </div>
      </footer>
    </div>
  )
}
