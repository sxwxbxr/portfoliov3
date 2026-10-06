import type { ReactNode } from "react"
import Link from "next/link"
import { siteCopy } from "@/lib/physio/copy/site"
import { physioPath } from "@/lib/physio/urls"
import { PhysioHeader } from "./PhysioHeader"

const c = siteCopy.footer
const MAIN_SITE = "https://www.sweber.dev"
const footerLink = "inline-flex min-h-11 items-center text-sm text-fg-muted transition-colors duration-150 hover:text-fg"

/** Own header and footer: the portfolio Navigation is deliberately not used here. */
export function PhysioShell({ children }: { children: ReactNode }) {
  return (
    <div lang="de" data-site="physio" className="bg-ground">
      <PhysioHeader />
      {children}
      <footer className="border-t border-edge-soft">
        <div className="sheet flex flex-col gap-6 py-10 md:flex-row md:items-center md:justify-between">
          <p className="measure text-sm leading-relaxed text-fg-muted">{c.note}</p>
          <nav aria-label={c.privacy} className="-mx-1 flex flex-wrap gap-x-6">
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
