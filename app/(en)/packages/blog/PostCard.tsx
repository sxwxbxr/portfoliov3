import { PostCardView, type CardData } from "@/components/packages/PostCardView"
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
  return <PostCardView {...cardData(post)} />
}

/** What the list pages hand to the card, so the client-side lists render the same markup. */
export function cardData(post: Post): CardData {
  return {
    href: pkgPath(`/blog/${post.slug}`),
    title: post.title,
    excerpt: post.excerpt,
    publishedAt: post.publishedAt,
    typeLabel: copy.pkgBlog.types[post.type],
    dateLabel: formatDate(post.publishedAt),
    packageNames: post.packages.map((slug) => getPackage(slug)?.name ?? slug),
  }
}
