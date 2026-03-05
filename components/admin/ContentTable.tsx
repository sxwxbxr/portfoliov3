"use client"

import Link from "next/link"
import DeleteButton from "./DeleteButton"

interface Column {
  name: string
  accessor: string
  type?: "tags" | "mono" | "boolean"
}

interface ContentTableProps {
  columns: Column[]
  data: Record<string, unknown>[]
  editPattern: string
  deletePattern: string
}

function interpolate(pattern: string, row: Record<string, unknown>) {
  return pattern.replace(/\{(\w+)\}/g, (_, key) => String(row[key] ?? ""))
}

function renderCell(value: unknown, type?: string) {
  if (type === "tags" && Array.isArray(value)) {
    return (
      <div className="flex flex-wrap gap-1">
        {(value as string[]).map((tag) => (
          <span key={tag} className="px-2 py-0.5 text-xs bg-accent rounded-full">
            {tag}
          </span>
        ))}
      </div>
    )
  }
  if (type === "mono") {
    return <span className="font-mono text-xs">{String(value ?? "")}</span>
  }
  if (type === "boolean") {
    return value ? (
      <span className="px-2 py-0.5 text-xs bg-primary/10 text-primary rounded-full font-medium">
        Yes
      </span>
    ) : (
      <span className="text-muted-foreground text-xs">--</span>
    )
  }
  return String(value ?? "")
}

export default function ContentTable({
  columns,
  data,
  editPattern,
  deletePattern,
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
                  {renderCell(row[col.accessor], col.type)}
                </td>
              ))}
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Link
                    href={interpolate(editPattern, row)}
                    className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-accent transition-colors"
                  >
                    Edit
                  </Link>
                  <DeleteButton endpoint={interpolate(deletePattern, row)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
