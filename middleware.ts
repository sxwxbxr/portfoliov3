import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // Only protect /admin routes
  if (request.nextUrl.pathname.startsWith("/admin")) {
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
  matcher: ["/admin/:path*"],
}
