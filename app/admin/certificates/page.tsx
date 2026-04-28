export const dynamic = "force-dynamic"

import Link from "next/link"
import { db } from "@/lib/db"
import { certificates } from "@/lib/schema"
import { asc } from "drizzle-orm"
import ContentTable from "@/components/admin/ContentTable"

export default async function AdminCertificatesPage() {
  const data = await db
    .select()
    .from(certificates)
    .orderBy(asc(certificates.sortOrder))

  const columns = [
    { name: "Name", accessor: "name" },
    { name: "Provider", accessor: "provider" },
    { name: "Category", accessor: "category" },
    { name: "Status", accessor: "status", type: "mono" as const },
    { name: "Order", accessor: "sortOrder", type: "mono" as const },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Certificates
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {data.length} certificate{data.length !== 1 ? "s" : ""} (completed,
            in-progress, and planned)
          </p>
        </div>
        <Link
          href="/admin/certificates/new"
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Add Certificate
        </Link>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <ContentTable
          columns={columns}
          data={data as unknown as Record<string, unknown>[]}
          editPattern="/admin/certificates/{id}/edit"
          deletePattern="/api/admin/certificates/{id}"
        />
      </div>
    </div>
  )
}
