import { clearSessionCookie } from "@/lib/physio/auth"
import { crossSite, fail, ok } from "@/lib/physio/http"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  if (crossSite(req)) return fail(403, "forbidden")
  await clearSessionCookie()
  return ok()
}
