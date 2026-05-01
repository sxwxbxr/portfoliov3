export const dynamic = "force-dynamic"

import Link from "next/link"
import { db } from "@/lib/db"
import { skills } from "@/lib/schema"
import { asc } from "drizzle-orm"
import ContentTable from "@/components/admin/ContentTable"

export default async function AdminSkillsPage() {
  const data = await db.select().from(skills).orderBy(asc(skills.sortOrder))

  const columns = [
    { name: "Category", accessor: "category" },
    { name: "Name", accessor: "name" },
    { name: "Detail", accessor: "detail" },
    { name: "Level", accessor: "level", type: "mono" as const },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold tracking-tight">
            Skills
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            {data.length} entr{data.length !== 1 ? "ies" : "y"}
          </p>
        </div>
        <Link
          href="/admin/skills/new"
          className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Add Skill
        </Link>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <ContentTable
          columns={columns}
          data={data as unknown as Record<string, unknown>[]}
          editPattern="/admin/skills/{id}/edit"
          deletePattern="/api/admin/skills/{id}"
        />
      </div>
    </div>
  )
}
