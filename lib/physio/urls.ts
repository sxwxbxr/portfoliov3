/**
 * Where the physio tool platform lives.
 *
 * Same scheme as lib/packages/urls.ts: routes are built under app/physio, the
 * canonical address is physio.sweber.dev. In production middleware.ts rewrites
 * that host onto /physio/* and redirects sweber.dev/physio/* to it. Local dev
 * and Vercel previews serve the pages at /physio/*. `NEXT_PUBLIC_PHYSIO_URL`
 * overrides the origin in any environment.
 */
import { MAIN_ORIGIN } from "@/lib/packages/urls"

export const PHYSIO_ORIGIN: string | null =
  process.env.NEXT_PUBLIC_PHYSIO_URL?.replace(/\/$/, "") ||
  (process.env.NEXT_PUBLIC_VERCEL_ENV === "production" ? "https://physio.sweber.dev" : null)

const strip = (p: string) => (p === "/" ? "" : p)

/** Href for a link between physio pages. `physioPath("/vorschlaege")`. */
export function physioPath(p = "/"): string {
  return PHYSIO_ORIGIN ? p || "/" : `/physio${strip(p)}`
}

/** Absolute, canonical URL for a physio page (metadata, sitemap, mails). */
export function physioUrl(p = "/"): string {
  return PHYSIO_ORIGIN ? `${PHYSIO_ORIGIN}${strip(p)}` || PHYSIO_ORIGIN : `${MAIN_ORIGIN}/physio${strip(p)}`
}

/** Entry link from the portfolio (footer). */
export const PHYSIO_ENTRY = PHYSIO_ORIGIN ?? "/physio"
