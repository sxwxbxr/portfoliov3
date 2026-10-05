import { revalidatePath } from "next/cache"

/**
 * Everything that lists or renders package posts. Called after every write
 * (admin form, ingest API, revalidation webhook) so a published post is
 * visible on the next request instead of after the ISR window.
 */
export function revalidatePackagePosts(slug?: string) {
  revalidatePath("/packages", "layout")
  revalidatePath("/packages/blog")
  revalidatePath("/packages/blog/[slug]", "page")
  if (slug) revalidatePath(`/packages/blog/${slug}`)
  revalidatePath("/packages/blog/feed.xml")
  revalidatePath("/packages/blog/posts.json")
  revalidatePath("/packages/feed.xml")
  revalidatePath("/packages/packages.json")
  revalidatePath("/packages/sitemap.xml")
}
