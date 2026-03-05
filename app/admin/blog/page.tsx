export const dynamic = "force-dynamic"

import Link from "next/link"
import { db } from "@/lib/db"
import { blogPosts } from "@/lib/schema"
import ContentTable from "@/components/admin/ContentTable"

export default async function AdminBlogPage() {
  const data = await db.select().from(blogPosts)

  const columns = [
    { name: "Title", accessor: "title" },
    { name: "Slug", accessor: "slug" },
    {
      name: "Published",
      accessor: "publishedAt",
      render: (value: unknown) => (
        <span className="font-mono text-xs">{String(value)}</span>
      ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Blog Posts
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {data.length} post{data.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Add Blog Post
        </Link>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <ContentTable
          columns={columns}
          data={data as unknown as Record<string, unknown>[]}
          editHref={(row) => `/admin/blog/${row.id}/edit`}
          deleteEndpoint={(row) => `/api/admin/blog/${row.id}`}
        />
      </div>
    </div>
  )
}
