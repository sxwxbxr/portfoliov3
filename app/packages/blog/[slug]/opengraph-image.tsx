import { notFound } from "next/navigation"
import { blog } from "@/lib/blog"
import { OG_SIZE, ogImage } from "@/lib/packages/og"
import { formatDate } from "../PostCard"
import { copy } from "@/lib/copy"

export const runtime = "nodejs"
export const alt = "Blog post by Seya Weber"
export const size = OG_SIZE
export const contentType = "image/png"

export async function generateStaticParams() {
  return (await blog.getPosts()).map((p) => ({ slug: p.slug }))
}

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await blog.getPost(slug)
  if (!post) notFound()

  return ogImage({
    eyebrow: `packages.sweber.dev · ${copy.pkgBlog.types[post.type]}`,
    title: post.title,
    footerLeft: formatDate(post.publishedAt),
    footerRight: post.author,
  })
}
