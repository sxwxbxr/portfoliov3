import type { CardData } from "./PostCardView"

export const PAGE_SIZE = 10

/** A post as the list pages need it: card data plus the package slugs to filter by. */
export type IndexPost = CardData & { slug: string; type: string; packages: string[] }

export function filterIndex(
  posts: IndexPost[],
  f: { pkg?: string; type?: string; page?: number }
): { pagePosts: IndexPost[]; pages: number; page: number } {
  const all = posts.filter(
    (p) => (!f.pkg || p.packages.includes(f.pkg)) && (!f.type || p.type === f.type)
  )
  const pages = Math.max(1, Math.ceil(all.length / PAGE_SIZE))
  const page = Math.min(Math.max(1, f.page || 1), pages)
  return { pagePosts: all.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), pages, page }
}
