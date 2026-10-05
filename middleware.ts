import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { PACKAGES_ORIGIN } from "@/lib/packages/urls"

/** Hosts that redirect /packages/* to the canonical subdomain. */
const MAIN_HOSTS = new Set(["sweber.dev", "www.sweber.dev"])

/**
 * Machine-readable package routes that carry a file extension. Every other
 * path with an extension on the packages host is a public asset (favicon,
 * manifest, robots.txt) and is served from the root unchanged.
 */
const PACKAGE_FILES = new Set([
  "/feed.xml",
  "/packages.json",
  "/sitemap.xml",
  "/blog/feed.xml",
  "/blog/posts.json",
  "/releasenotes/feed.xml",
])

/**
 * First path segments of portfolio pages. On the packages host these are nav
 * or footer links back into the portfolio, so they are sent to the main
 * domain instead of 404ing under /packages. Everything else is package site.
 */
const PORTFOLIO_SEGMENTS = new Set([
  "about",
  "admin",
  "career",
  "case-studies",
  "contact",
  "design",
  "education",
  "experience",
  "imprint",
  "login",
  "pitch",
  "privacy",
  "projects",
  "services",
  "signup",
  "skills",
])

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl
  const host = (request.headers.get("host") ?? "").toLowerCase()

  // packages.sweber.dev (and packages.localhost:3000 for local testing).
  if (host.startsWith("packages.")) {
    if (pathname.startsWith("/_next") || pathname.startsWith("/api")) {
      return NextResponse.next()
    }

    if (pathname === "/packages" || pathname.startsWith("/packages/")) {
      const rest = pathname.slice("/packages".length) || "/"
      return NextResponse.redirect(
        new URL(`${rest}${search}`, `${request.nextUrl.protocol}//${host}`),
        308
      )
    }

    const first = pathname.split("/")[1] ?? ""
    if (PORTFOLIO_SEGMENTS.has(first)) {
      // The apex redirects to www in Vercel, so skip that extra hop.
      const mainHost =
        host === "packages.sweber.dev" ? "www.sweber.dev" : host.replace(/^packages\./, "")
      const proto = request.nextUrl.protocol
      return NextResponse.redirect(new URL(`${pathname}${search}`, `${proto}//${mainHost}`), 308)
    }

    const hasExtension = /\.[a-z0-9]+$/i.test(pathname)
    if (hasExtension && !PACKAGE_FILES.has(pathname)) {
      return NextResponse.next()
    }

    // Rewrite keeps the query string, so UTM parameters from video
    // descriptions survive into analytics.
    const url = request.nextUrl.clone()
    url.pathname = `/packages${pathname === "/" ? "" : pathname}`
    return NextResponse.rewrite(url)
  }

  // Once the subdomain is live there is exactly one canonical URL per page.
  if (
    PACKAGES_ORIGIN &&
    MAIN_HOSTS.has(host) &&
    (pathname === "/packages" || pathname.startsWith("/packages/"))
  ) {
    const rest = pathname.slice("/packages".length)
    return NextResponse.redirect(`${PACKAGES_ORIGIN}${rest}${search}`, 308)
  }

  // Only protect /admin routes
  if (pathname.startsWith("/admin")) {
    const token = request.cookies.get("auth_token")?.value

    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    // Verify token using jose directly (Edge-compatible)
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!)
      const { jwtVerify } = await import("jose")
      await jwtVerify(token, secret)
      return NextResponse.next()
    } catch {
      return NextResponse.redirect(new URL("/login", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  // Everything except build assets: the packages host has to be seen on every
  // route, not just /admin.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
