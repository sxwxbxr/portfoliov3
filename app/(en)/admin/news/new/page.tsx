export const dynamic = "force-dynamic"

import NewsPostForm from "@/components/admin/NewsPostForm"
import { getPackages } from "@/lib/packages"

export default function NewNewsPostPage() {
  const packageOptions = getPackages().map((p) => ({ slug: p.slug, name: p.name }))

  return (
    <div className="max-w-6xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">New Post</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Write a news post for the package site.
        </p>
      </div>
      <NewsPostForm packageOptions={packageOptions} />
    </div>
  )
}
