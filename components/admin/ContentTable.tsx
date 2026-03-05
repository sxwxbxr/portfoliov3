"use client"

import Link from "next/link"
import DeleteButton from "./DeleteButton"

interface Column {
  name: string
  accessor: string
  render?: (value: unknown, row: Record<string, unknown>) => React.ReactNode
}

interface ContentTableProps {
  columns: Column[]
  data: Record<string, unknown>[]
  editHref: (row: Record<string, unknown>) => string
  deleteEndpoint: (row: Record<string, unknown>) => string
}

export default function ContentTable({
  columns,
  data,
  editHref,
  deleteEndpoint,
}: ContentTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground text-sm">
        No entries yet. Create your first one.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border">
            {columns.map((col) => (
              <th
                key={col.accessor}
                className="text-left py-3 px-4 font-medium text-muted-foreground"
              >
                {col.name}
              </th>
            ))}
            <th className="text-right py-3 px-4 font-medium text-muted-foreground">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={(row.id as number) ?? i}
              className="border-b border-border/50 hover:bg-accent/50 transition-colors"
            >
              {columns.map((col) => (
                <td key={col.accessor} className="py-3 px-4">
                  {col.render
                    ? col.render(row[col.accessor], row)
                    : String(row[col.accessor] ?? "")}
                </td>
              ))}
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={editHref(row)}
                    className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-accent transition-colors"
                  >
                    Edit
                  </Link>
                  <DeleteButton endpoint={deleteEndpoint(row)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
