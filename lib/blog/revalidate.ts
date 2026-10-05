import { revalidatePath, revalidateTag } from "next/cache"
import { POSTS_TAG } from "./db"

/**
 * Everything that lists or renders package posts. Called after every write
 * (admin form, ingest API, revalidation webhook) so a published post is
 * visible on the next request instead of after the ISR window. Feeds,
 * JSON and the sitemap are rendered per request and need no entry here.
 */
export function revalidatePackagePosts(slug?: string) {
  revalidateTag(POSTS_TAG)
  revalidatePath("/packages", "layout")
  revalidatePath("/packages/blog")
  revalidatePath("/packages/blog/[slug]", "page")
  if (slug) revalidatePath(`/packages/blog/${slug}`)
}
