import { PHYSIO_ORIGIN } from "@/lib/physio/urls"

/**
 * Absolute link into the physio site for mails and redirects built on the server.
 *
 * Production: PHYSIO_ORIGIN (never the Host header, which a client can forge).
 * Without it (local dev, Vercel previews) the pages live at /physio on the
 * origin of the current request.
 */
export function physioLink(req: Request, path = "/"): string {
  const rest = path === "/" ? "" : path
  if (PHYSIO_ORIGIN) return `${PHYSIO_ORIGIN}${rest}` || PHYSIO_ORIGIN
  return `${new URL(req.url).origin}/physio${rest}`
}

/**
 * Accepts only a relative physio path for `?next=` style redirects: starts with
 * a single slash, no protocol-relative or backslash tricks, no control characters.
 * Returns a path as written in the physio route space (e.g. "/konto").
 */
export function safeNextPath(raw: string | null | undefined, fallback = "/konto"): string {
  if (!raw) return fallback
  if (raw.length > 300) return fallback
  if (!raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) return fallback
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(raw)) return fallback
  // The value is a physio-space path; strip a leading /physio used by dev links.
  const path = raw === "/physio" || raw.startsWith("/physio/") || raw.startsWith("/physio?") ? raw.slice("/physio".length) || "/" : raw
  try {
    const url = new URL(path, "http://physio.invalid")
    if (url.origin !== "http://physio.invalid") return fallback
    return `${url.pathname}${url.search}`
  } catch {
    return fallback
  }
}
