/**
 * Where the package site lives.
 *
 * The routes are built under app/packages. The canonical address is the
 * subdomain packages.sweber.dev: in production, middleware.ts rewrites that
 * host onto /packages/* and redirects sweber.dev/packages/* to it, and every
 * canonical URL, feed link and sitemap entry points at the subdomain.
 *
 * Local dev and Vercel previews have no subdomain, so there the same pages
 * are served at /packages/*. `NEXT_PUBLIC_PACKAGES_URL` overrides the origin
 * in any environment (e.g. to test the subdomain mode on a preview domain).
 */
export const MAIN_ORIGIN = "https://sweber.dev"

export const PACKAGES_ORIGIN: string | null =
  process.env.NEXT_PUBLIC_PACKAGES_URL?.replace(/\/$/, "") ||
  (process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
    ? "https://packages.sweber.dev"
    : null)

const strip = (p: string) => (p === "/" ? "" : p)

/** Href for a link between package pages. `pkgPath("/permito")`. */
export function pkgPath(p = "/"): string {
  return PACKAGES_ORIGIN ? p || "/" : `/packages${strip(p)}`
}

/** Absolute, canonical URL for a package page, feed or image. */
export function pkgUrl(p = "/"): string {
  return PACKAGES_ORIGIN
    ? `${PACKAGES_ORIGIN}${strip(p)}` || PACKAGES_ORIGIN
    : `${MAIN_ORIGIN}/packages${strip(p)}`
}

/** Entry link from the portfolio (nav, footer, project page). */
export const PACKAGES_ENTRY = PACKAGES_ORIGIN ?? "/packages"
