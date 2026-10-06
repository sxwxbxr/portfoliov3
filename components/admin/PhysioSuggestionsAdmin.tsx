"use client"

import { useMemo, useState } from "react"
import {
  SUGGESTION_STATUSES,
  suggestionCategoryLabel,
  suggestionsAdminCopy,
  type SuggestionStatus,
} from "@/lib/physio/copy/suggestions"

export type AdminSuggestion = {
  id: number
  title: string
  description: string
  category: string
  contactEmail: string
  userEmail: string | null
  status: string
  adminNote: string
  createdAt: string
}

type Filter = "all" | SuggestionStatus

const labels = suggestionsAdminCopy.statusLabels
const badge = "text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-border"

function statusLabel(status: string) {
  return labels[status as SuggestionStatus] ?? status
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("de-CH", { dateStyle: "medium", timeStyle: "short" })
}

function Row({
  item,
  onChange,
  onDelete,
}: {
  item: AdminSuggestion
  onChange: (next: AdminSuggestion) => void
  onDelete: (id: number) => void
}) {
  const [note, setNote] = useState(item.adminNote)
  const [busy, setBusy] = useState<"status" | "note" | "delete" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  async function patch(body: { status?: string; adminNote?: string }, kind: "status" | "note") {
    setBusy(kind)
    setError(null)
    setSaved(false)
    try {
      const res = await fetch(`/api/admin/physio-suggestions/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error || "Failed to save")
        return
      }
      onChange({ ...item, status: data.status, adminNote: data.adminNote })
      if (kind === "note") setSaved(true)
    } catch {
      setError("Failed to save")
    } finally {
      setBusy(null)
    }
  }

  async function remove() {
    if (!confirm(`Delete "${item.title}"?`)) return
    setBusy("delete")
    setError(null)
    try {
      const res = await fetch(`/api/admin/physio-suggestions/${item.id}`, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "Failed to delete")
        return
      }
      onDelete(item.id)
    } catch {
      setError("Failed to delete")
    } finally {
      setBusy(null)
    }
  }

  const noteDirty = note !== item.adminNote

  return (
    <li className="glass rounded-xl p-5 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="font-medium break-words">{item.title}</h3>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span className={`${badge} bg-muted/60`}>{suggestionCategoryLabel(item.category) || "-"}</span>
            <span className="font-mono">{formatDate(item.createdAt)}</span>
            {item.contactEmail ? (
              <a href={`mailto:${item.contactEmail}`} className="underline underline-offset-2">
                {item.contactEmail}
              </a>
            ) : (
              <span>no reply address</span>
            )}
            {item.userEmail && <span>account: {item.userEmail}</span>}
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          Status
          <select
            value={item.status}
            disabled={busy !== null}
            onChange={(e) => patch({ status: e.target.value }, "status")}
            className="rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-foreground disabled:opacity-50"
          >
            {SUGGESTION_STATUSES.map((s) => (
              <option key={s} value={s}>
                {labels[s]}
              </option>
            ))}
          </select>
        </label>
      </div>

      <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">{item.description}</p>

      <div className="space-y-2">
        <label htmlFor={`note-${item.id}`} className="text-xs text-muted-foreground">
          Admin note (not shown to the student)
        </label>
        <textarea
          id={`note-${item.id}`}
          value={note}
          onChange={(e) => {
            setNote(e.target.value)
            setSaved(false)
          }}
          rows={2}
          maxLength={4000}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm resize-y"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => patch({ adminNote: note }, "note")}
            disabled={busy !== null || !noteDirty}
            className="px-3 py-1.5 text-xs font-medium border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
          >
            {busy === "note" ? "Saving..." : "Save note"}
          </button>
          <button
            type="button"
            onClick={remove}
            disabled={busy !== null}
            className="px-3 py-1.5 text-xs font-medium bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {busy === "delete" ? "..." : "Delete"}
          </button>
          <span role="status" className="text-xs text-muted-foreground">
            {saved ? "Saved" : ""}
          </span>
          {error && (
            <span role="alert" className="text-xs text-destructive">
              {error}
            </span>
          )}
        </div>
      </div>
    </li>
  )
}

export default function PhysioSuggestionsAdmin({ initial }: { initial: AdminSuggestion[] }) {
  const [items, setItems] = useState(initial)
  const [filter, setFilter] = useState<Filter>("all")

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: items.length }
    for (const s of SUGGESTION_STATUSES) c[s] = 0
    for (const i of items) c[i.status] = (c[i.status] ?? 0) + 1
    return c
  }, [items])

  const visible = filter === "all" ? items : items.filter((i) => i.status === filter)
  const tabs: { key: Filter; label: string }[] = [
    { key: "all", label: suggestionsAdminCopy.filterAll },
    ...SUGGESTION_STATUSES.map((s) => ({ key: s as Filter, label: labels[s] })),
  ]

  return (
    <div className="space-y-4">
      <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            aria-pressed={filter === t.key}
            onClick={() => setFilter(t.key)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
              filter === t.key
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
            }`}
          >
            {t.label} <span className="font-mono opacity-70">{counts[t.key] ?? 0}</span>
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="glass rounded-xl text-center py-12 text-muted-foreground text-sm">
          {items.length === 0
            ? "No suggestions yet. They show up here once a student sends one via /vorschlaege."
            : `No suggestions with status "${filter === "all" ? "" : statusLabel(filter)}".`}
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((item) => (
            <Row
              key={item.id}
              item={item}
              onChange={(next) => setItems((prev) => prev.map((p) => (p.id === next.id ? next : p)))}
              onDelete={(id) => setItems((prev) => prev.filter((p) => p.id !== id))}
            />
          ))}
        </ul>
      )}
    </div>
  )
}
