export const dynamic = "force-dynamic"

import { notFound } from "next/navigation"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { packagePosts } from "@/lib/schema"
import NewsPostForm from "@/components/admin/NewsPostForm"
import { getPackages } from "@/lib/packages"

export default async function EditNewsPostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const n = Number(id)
  if (!Number.isInteger(n)) notFound()

  const [post] = await db.select().from(packagePosts).where(eq(packagePosts.id, n))
  if (!post) notFound()

  const packageOptions = getPackages().map((p) => ({ slug: p.slug, name: p.name }))

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">Edit Post</h2>
        <p className="text-sm text-muted-foreground mt-1">{post.title}</p>
      </div>

      {post.source !== "admin" && (
        <div className="glass rounded-xl p-4 border border-border text-sm text-muted-foreground">
          This post was delivered by{" "}
          <span className="font-mono text-foreground">{post.source}</span>. Its next
          delivery will overwrite your edits.
        </div>
      )}

      <NewsPostForm
        packageOptions={packageOptions}
        initial={{
          id: post.id,
          slug: post.slug,
          title: post.title,
          excerpt: post.excerpt,
          body: post.body,
          type: post.type,
          status: post.status,
          publishedAt: post.publishedAt,
          author: post.author,
          coverImage: post.coverImage,
          tags: post.tags,
          packages: post.packages,
          videos: post.videos,
          canonicalUrl: post.canonicalUrl,
          source: post.source,
        }}
      />
    </div>
  )
}
