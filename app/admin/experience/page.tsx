export const dynamic = "force-dynamic"

import Link from "next/link"
import { db } from "@/lib/db"
import { experienceEntries } from "@/lib/schema"
import { asc } from "drizzle-orm"
import ContentTable from "@/components/admin/ContentTable"

export default async function AdminExperiencePage() {
  const data = await db
    .select()
    .from(experienceEntries)
    .orderBy(asc(experienceEntries.sortOrder))

  const columns = [
    { name: "Company", accessor: "company" },
    { name: "Role", accessor: "role" },
    { name: "Period", accessor: "period" },
    {
      name: "Current",
      accessor: "current",
      render: (value: unknown) =>
        value ? (
          <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full font-medium">
            Current
          </span>
        ) : (
          <span className="text-muted-foreground text-xs">--</span>
        ),
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Experience
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {data.length} entr{data.length !== 1 ? "ies" : "y"}
          </p>
        </div>
        <Link
          href="/admin/experience/new"
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Add Experience
        </Link>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <ContentTable
          columns={columns}
          data={data as unknown as Record<string, unknown>[]}
          editHref={(row) => `/admin/experience/${row.id}/edit`}
          deleteEndpoint={(row) => `/api/admin/experience/${row.id}`}
        />
      </div>
    </div>
  )
}
