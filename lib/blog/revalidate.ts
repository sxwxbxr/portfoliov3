import { revalidatePath, revalidateTag } from "next/cache"
import { POSTS_TAG } from "./db"

/**
 * Everything that lists or renders package posts. Called after every write
 * (admin form, ingest API, revalidation webhook) so a published post is
 * visible on the next request instead of after the ISR window. The feed,
 * JSON and sitemap are cached route handlers; they are listed too, and also
 * hang on POSTS_TAG, in case one of the two paths misses them.
 */
export function revalidatePackagePosts(slug?: string) {
  revalidateTag(POSTS_TAG)
  revalidatePath("/packages", "layout")
  revalidatePath("/packages/blog")
  revalidatePath("/packages/blog/feed.xml")
  revalidatePath("/packages/blog/posts.json")
  revalidatePath("/packages/sitemap.xml")
  revalidatePath("/packages/blog/[slug]", "page")
  if (slug) revalidatePath(`/packages/blog/${slug}`)
}
