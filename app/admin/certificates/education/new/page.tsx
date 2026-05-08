"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import FormField from "@/components/admin/FormField"

export default function NewEducationEntryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    title: "",
    institution: "",
    period: "",
    description: "",
    sortOrder: "0",
  })

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/admin/certificates/education", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          sortOrder: parseInt(form.sortOrder) || 0,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to create education entry")
        return
      }

      router.push("/admin/certificates")
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          New Education Entry
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add an academic background entry shown on the Education page.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-5">
        <FormField
          label="Title"
          name="title"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="EFZ in Computer Science"
          required
        />
        <FormField
          label="Institution"
          name="institution"
          value={form.institution}
          onChange={(e) => updateField("institution", e.target.value)}
          placeholder="Application Development -- WISS St. Gallen"
        />
        <FormField
          label="Period"
          name="period"
          value={form.period}
          onChange={(e) => updateField("period", e.target.value)}
          placeholder="2022 -- 2024"
        />
        <FormField
          label="Description"
          name="description"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="What this education covered, focus areas..."
          multiline
          rows={5}
        />
        <FormField
          label="Sort Order"
          name="sortOrder"
          type="number"
          value={form.sortOrder}
          onChange={(e) => updateField("sortOrder", e.target.value)}
          placeholder="0"
          hint="Lower numbers appear first."
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Entry"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
