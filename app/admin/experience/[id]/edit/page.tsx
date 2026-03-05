"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import FormField from "@/components/admin/FormField"
import CheckboxField from "@/components/admin/CheckboxField"

export default function EditExperiencePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    company: "",
    role: "",
    period: "",
    current: false,
    description: "",
    responsibilities: "",
    sortOrder: "0",
  })

  useEffect(() => {
    fetch(`/api/admin/experience/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          company: data.company || "",
          role: data.role || "",
          period: data.period || "",
          current: data.current || false,
          description: data.description || "",
          responsibilities: (data.responsibilities || []).join("\n"),
          sortOrder: String(data.sortOrder ?? 0),
        })
        setFetching(false)
      })
      .catch(() => {
        setError("Failed to load entry")
        setFetching(false)
      })
  }, [id])

  function updateField(field: string, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/experience/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          responsibilities: form.responsibilities
            ? form.responsibilities.split("\n").map((r) => r.trim()).filter(Boolean)
            : [],
          sortOrder: parseInt(form.sortOrder) || 0,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to update entry")
        return
      }

      router.push("/admin/experience")
    } catch {
      setError("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        Loading...
      </div>
    )
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Edit Experience
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Update experience entry.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-5">
        <FormField
          label="Company"
          name="company"
          value={form.company}
          onChange={(e) => updateField("company", e.target.value)}
          required
        />
        <FormField
          label="Role"
          name="role"
          value={form.role}
          onChange={(e) => updateField("role", e.target.value)}
          required
        />
        <FormField
          label="Period"
          name="period"
          value={form.period}
          onChange={(e) => updateField("period", e.target.value)}
          required
        />
        <CheckboxField
          label="Currently working here"
          name="current"
          checked={form.current}
          onChange={(e) => updateField("current", e.target.checked)}
        />
        <FormField
          label="Description"
          name="description"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          multiline
          rows={3}
        />
        <FormField
          label="Responsibilities (one per line)"
          name="responsibilities"
          value={form.responsibilities}
          onChange={(e) => updateField("responsibilities", e.target.value)}
          multiline
          rows={5}
        />
        <FormField
          label="Sort Order"
          name="sortOrder"
          type="number"
          value={form.sortOrder}
          onChange={(e) => updateField("sortOrder", e.target.value)}
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
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
