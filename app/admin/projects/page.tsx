export const dynamic = "force-dynamic"

import Link from "next/link"
import { db } from "@/lib/db"
import { projects } from "@/lib/schema"
import { asc } from "drizzle-orm"
import ContentTable from "@/components/admin/ContentTable"

export default async function AdminProjectsPage() {
  const data = await db
    .select()
    .from(projects)
    .orderBy(asc(projects.sortOrder))

  const columns = [
    { name: "Title", accessor: "title" },
    { name: "Slug", accessor: "slug" },
    { name: "Tags", accessor: "tags", type: "tags" as const },
    { name: "Order", accessor: "sortOrder", type: "mono" as const },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Projects
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {data.length} project{data.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Add Project
        </Link>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <ContentTable
          columns={columns}
          data={data as unknown as Record<string, unknown>[]}
          editPattern="/admin/projects/{id}/edit"
          deletePattern="/api/admin/projects/{id}"
        />
      </div>
    </div>
  )
}
