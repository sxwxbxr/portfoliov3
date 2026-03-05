export const dynamic = "force-dynamic"

import Link from "next/link"
import { db } from "@/lib/db"
import { caseStudies } from "@/lib/schema"
import ContentTable from "@/components/admin/ContentTable"

export default async function AdminCaseStudiesPage() {
  const data = await db.select().from(caseStudies)

  const columns = [
    { name: "Title", accessor: "title" },
    { name: "Client", accessor: "client" },
    { name: "Industry", accessor: "industry" },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Case Studies
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {data.length} case stud{data.length !== 1 ? "ies" : "y"}
          </p>
        </div>
        <Link
          href="/admin/case-studies/new"
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Add Case Study
        </Link>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <ContentTable
          columns={columns}
          data={data as unknown as Record<string, unknown>[]}
          editPattern="/admin/case-studies/{id}/edit"
          deletePattern="/api/admin/case-studies/{id}"
        />
      </div>
    </div>
  )
}
