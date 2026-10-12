import { NextResponse } from "next/server"
import { blog } from "@/lib/blog"
import { pkgUrl } from "@/lib/packages/urls"

// Rendered per request: these list package posts, and a post published in
// /admin/news or through the ingest API must appear here immediately. A
// cached route handler did not pick up revalidatePath/revalidateTag.
export const dynamic = "force-dynamic"

export async function GET() {
  const posts = await blog.getPosts()
  return NextResponse.json(
    posts.map(({ body: _body, ...p }) => ({
      ...p,
      url: p.canonicalUrl ?? pkgUrl(`/blog/${p.slug}`),
    })),
    { headers: { "Access-Control-Allow-Origin": "*" } }
  )
}
