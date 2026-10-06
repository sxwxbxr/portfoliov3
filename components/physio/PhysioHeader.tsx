"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { siteCopy } from "@/lib/physio/copy/site"
import { physioPath } from "@/lib/physio/urls"
import { BrandMark } from "./BrandMark"

const c = siteCopy

type Me = { user: { email: string } | null; hasAccess: boolean }

/**
 * Brand and navigation. Login state comes from GET /api/physio/me after mount,
 * so the pages around it can stay static. Until it arrives the last item is
 * invisible but keeps its space, so nothing shifts.
 *
 * Below md the links move into a menu opened by a labelled button; Escape and a
 * tap outside close it, and it closes on every navigation.
 */
export function PhysioHeader() {
  const [me, setMe] = useState<Me | null>(null)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const here = pathname.replace(/^\/physio(?=\/|$)/, "") || "/"
  const rootRef = useRef<HTMLElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

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

  useEffect(() => setOpen(false), [pathname])

  // The root layout hard-codes `theme-color` #0a0a0a and `color-scheme` dark in <head>, and
  // browsers read the first tag. Point them at the light page while this shell is mounted.
  useEffect(() => {
    const tags = [...document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"], meta[name="color-scheme"]')]
    const before = tags.map((t) => t.content)
    for (const t of tags) t.content = t.name === "theme-color" ? "#faf9f5" : "light"
    return () => tags.forEach((t, i) => (t.content = before[i]))
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return
      setOpen(false)
      buttonRef.current?.focus()
    }
    const onPointer = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("pointerdown", onPointer)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("pointerdown", onPointer)
    }
  }, [open])

  const items = [
    { href: `${physioPath("/")}#tools`, label: c.nav.tools, active: false },
    { href: physioPath("/vorschlaege"), label: c.nav.suggestions, active: here.startsWith("/vorschlaege") },
    { href: physioPath("/abo"), label: c.nav.plans, active: here.startsWith("/abo") },
  ]
  const account = me?.user
    ? { href: physioPath("/konto"), label: c.nav.account, active: here.startsWith("/konto") }
    : { href: physioPath("/anmelden"), label: c.nav.login, active: here.startsWith("/anmelden") }
  const accountHidden = me ? undefined : { visibility: "hidden" as const }

  const bar =
    "inline-flex min-h-11 items-center px-3 text-sm font-medium text-fg-muted transition-colors hover:text-fg aria-[current=page]:text-fg " +
    "underline-offset-[10px] aria-[current=page]:underline aria-[current=page]:decoration-2 aria-[current=page]:decoration-signal"
  const row =
    "flex min-h-12 items-center rounded-lg px-3 text-base font-medium text-fg hover:bg-plate-hi aria-[current=page]:bg-(--wash) aria-[current=page]:text-(--signal-hi)"

  return (
    <header ref={rootRef} className="sticky top-0 z-40 border-b border-edge-soft bg-ground">
      <div className="sheet flex items-center justify-between gap-4 py-2">
        <Link href={physioPath("/")} className="flex min-h-11 items-center gap-3" aria-label={`${c.brand.name}, Startseite`}>
          <BrandMark size={32} />
          <span className="flex items-baseline gap-2.5">
            <span className="font-[family-name:var(--font-physio-serif)] text-xl font-semibold tracking-tight text-fg">
              {c.brand.name}
            </span>
            <span className="annotate hidden text-fg-muted sm:inline">{c.brand.byline}</span>
          </span>
        </Link>

        <nav aria-label={c.nav.label} className="hidden items-center gap-1 md:flex">
          {items.map((i) => (
            <Link key={i.label} href={i.href} className={bar} aria-current={i.active ? "page" : undefined}>
              {i.label}
            </Link>
          ))}
          <Link
            href={account.href}
            className="control ml-2 inline-flex min-h-11 items-center px-4 text-sm"
            aria-current={account.active ? "page" : undefined}
            style={accountHidden}
            tabIndex={me ? undefined : -1}
            aria-hidden={me ? undefined : true}
          >
            {account.label}
          </Link>
        </nav>

        <button
          ref={buttonRef}
          type="button"
          className="control inline-flex min-h-11 items-center gap-2.5 px-4 text-sm md:hidden"
          aria-expanded={open}
          aria-controls="physio-menu"
          onClick={() => setOpen((o) => !o)}
        >
          <span aria-hidden="true" className="flex w-4 flex-col gap-[3px]">
            <span className="h-0.5 rounded-full bg-current" />
            <span className="h-0.5 rounded-full bg-current" />
            <span className="h-0.5 w-2.5 rounded-full bg-current" />
          </span>
          {open ? c.nav.menuClose : c.nav.menuOpen}
        </button>
      </div>

      {open && (
        <nav
          id="physio-menu"
          aria-label={c.nav.label}
          className="absolute inset-x-0 top-full border-b border-edge-soft bg-ground pb-3 shadow-[0_12px_24px_-12px_oklch(0.25_0.03_235/0.18)] md:hidden"
        >
          <ul className="sheet flex flex-col gap-0.5 pt-1">
            {items.map((i) => (
              <li key={i.label}>
                <Link href={i.href} className={row} aria-current={i.active ? "page" : undefined} onClick={() => setOpen(false)}>
                  {i.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={account.href}
                className={row}
                aria-current={account.active ? "page" : undefined}
                style={accountHidden}
                onClick={() => setOpen(false)}
              >
                {account.label}
              </Link>
            </li>
          </ul>
        </nav>
      )}
    </header>
  )
}
