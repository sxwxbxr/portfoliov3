import { NextResponse } from "next/server"
import { blog } from "@/lib/blog"
import { pkgUrl } from "@/lib/packages/urls"

export const revalidate = 60

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
