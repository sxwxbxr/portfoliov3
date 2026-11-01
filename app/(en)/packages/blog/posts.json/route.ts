import { NextResponse } from "next/server"
import { blog } from "@/lib/blog"
import { pkgUrl } from "@/lib/packages/urls"

// Cached for 5 min instead of rendered per request: every hit re-read all posts (and, for the
// sitemap, every docs page), which was a main source of Vercel Hobby CPU. A new post therefore
// shows up here within 5 min; revalidatePath/revalidateTag do not reach route handlers.
export const revalidate = 300

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
