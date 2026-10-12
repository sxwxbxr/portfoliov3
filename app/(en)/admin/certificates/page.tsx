export const dynamic = "force-dynamic"

import Link from "next/link"
import { db } from "@/lib/db"
import { certificates, educationEntries } from "@/lib/schema"
import { asc } from "drizzle-orm"
import ContentTable from "@/components/admin/ContentTable"

export default async function AdminCertificatesPage() {
  const [certs, education] = await Promise.all([
    db.select().from(certificates).orderBy(asc(certificates.sortOrder)),
    db
      .select()
      .from(educationEntries)
      .orderBy(asc(educationEntries.sortOrder)),
  ])

  const certColumns = [
    { name: "Name", accessor: "name" },
    { name: "Provider", accessor: "provider" },
    { name: "Category", accessor: "category" },
    { name: "Status", accessor: "status", type: "mono" as const },
    { name: "Order", accessor: "sortOrder", type: "mono" as const },
  ]

  const educationColumns = [
    { name: "Title", accessor: "title" },
    { name: "Institution", accessor: "institution" },
    { name: "Period", accessor: "period", type: "mono" as const },
    { name: "Order", accessor: "sortOrder", type: "mono" as const },
  ]

  return (
    <div className="space-y-12">
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Certificates
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {certs.length} certificate{certs.length !== 1 ? "s" : ""}{" "}
              (completed, in-progress, and planned)
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
            columns={certColumns}
            data={certs as unknown as Record<string, unknown>[]}
            editPattern="/admin/certificates/{id}/edit"
            deletePattern="/api/admin/certificates/{id}"
          />
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight">
              Education
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Academic background shown on the Education page.{" "}
              {education.length} entr{education.length !== 1 ? "ies" : "y"}.
            </p>
          </div>
          <Link
            href="/admin/certificates/education/new"
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Add Education Entry
          </Link>
        </div>

        <div className="glass rounded-xl overflow-hidden">
          <ContentTable
            columns={educationColumns}
            data={education as unknown as Record<string, unknown>[]}
            editPattern="/admin/certificates/education/{id}/edit"
            deletePattern="/api/admin/certificates/education/{id}"
          />
        </div>
      </section>
    </div>
  )
}
