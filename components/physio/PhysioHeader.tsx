"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { siteCopy } from "@/lib/physio/copy/site"
import { physioPath } from "@/lib/physio/urls"

const c = siteCopy

type Me = { user: { email: string } | null; hasAccess: boolean }

/**
 * Brand and navigation. Login state comes from GET /api/physio/me after mount,
 * so the pages around it can stay static. Until it arrives the last item is
 * invisible but keeps its space, so nothing shifts.
 */
export function PhysioHeader() {
  const [me, setMe] = useState<Me | null>(null)
  const pathname = usePathname()
  const here = pathname.replace(/^\/physio(?=\/|$)/, "") || "/"

  useEffect(() => {
    let alive = true
    fetch("/api/physio/me", { cache: "no-store", credentials: "same-origin" })
      .then((r) => (r.ok ? (r.json() as Promise<Me>) : { user: null, hasAccess: false }))
      .catch(() => ({ user: null, hasAccess: false }))
      .then((data) => alive && setMe(data))
    return () => {
      alive = false
    }
  }, [pathname])

  const items = [
    { href: `${physioPath("/")}#tools`, label: c.nav.tools, active: false },
    { href: physioPath("/vorschlaege"), label: c.nav.suggestions, active: here.startsWith("/vorschlaege") },
    { href: physioPath("/abo"), label: c.nav.plans, active: here.startsWith("/abo") },
  ]
  const account = me?.user
    ? { href: physioPath("/konto"), label: c.nav.account, active: here.startsWith("/konto") }
    : { href: physioPath("/anmelden"), label: c.nav.login, active: here.startsWith("/anmelden") }

  const link = (active: boolean) =>
    "control control-ghost inline-flex min-h-11 items-center px-4 py-2 text-sm " + (active ? "text-fg" : "text-fg-muted hover:text-fg")

  return (
    <header className="border-b border-edge-soft">
      <div className="sheet flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-2">
        <Link href={physioPath("/")} className="flex min-h-11 items-baseline gap-2.5">
          <span className="text-lg tracking-tight text-fg">{c.brand.name}</span>
          <span className="annotate text-fg-muted">{c.brand.byline}</span>
        </Link>
        <nav aria-label={c.nav.label} className="-mx-4 flex flex-wrap items-center sm:mx-0">
          {items.map((i) => (
            <Link key={i.label} href={i.href} className={link(i.active)} aria-current={i.active ? "page" : undefined}>
              {i.label}
            </Link>
          ))}
          <Link
            href={account.href}
            className={link(account.active)}
            aria-current={account.active ? "page" : undefined}
            style={me ? undefined : { visibility: "hidden" }}
            tabIndex={me ? undefined : -1}
            aria-hidden={me ? undefined : true}
          >
            {account.label}
          </Link>
        </nav>
      </div>
    </header>
  )
}
