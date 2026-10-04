import Link from "next/link"
import type { Post } from "@/lib/blog/types"
import { getPackage } from "@/lib/packages"
import { pkgPath } from "@/lib/packages/urls"
import { copy } from "@/lib/copy"

export function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-GB", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  })
}

export function PostCard({ post }: { post: Post }) {
  const href = pkgPath(`/blog/${post.slug}`)
  return (
    <article className="relative flex flex-col gap-3 border-b border-edge-soft py-6 md:py-7">
      <div className="flex flex-wrap items-center gap-2">
        <span className="tab text-xs text-fg-muted">{copy.pkgBlog.types[post.type]}</span>
        <time dateTime={post.publishedAt} className="annotate">
          {formatDate(post.publishedAt)}
        </time>
      </div>
      <h2 className="text-lg tracking-tight text-balance md:text-xl">
        <Link href={href} className="text-fg transition-colors duration-150 hover:text-fg-muted after:absolute after:inset-0 after:content-['']">
          {post.title}
        </Link>
      </h2>
      <p className="measure text-sm leading-relaxed text-fg-muted">{post.excerpt}</p>
      {post.packages.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {post.packages.map((slug) => (
            <span key={slug} className="tab text-xs text-fg-muted">
              {getPackage(slug)?.name ?? slug}
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
