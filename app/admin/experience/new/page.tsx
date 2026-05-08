"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import FormField from "@/components/admin/FormField"
import { deriveExperiencePeriod } from "@/lib/experience-period"

export default function NewExperiencePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    company: "",
    role: "",
    startDate: "",
    endDate: "",
    description: "",
    responsibilities: "",
    sortOrder: "0",
  })

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const { period: previewPeriod, current: previewCurrent } =
    deriveExperiencePeriod(form.startDate, form.endDate)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (form.endDate && form.startDate && form.endDate < form.startDate) {
      setError("End date cannot be before start date.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/admin/experience", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: form.company,
          role: form.role,
          startDate: form.startDate,
          endDate: form.endDate,
          description: form.description,
          responsibilities: form.responsibilities
            ? form.responsibilities.split("\n").map((r) => r.trim()).filter(Boolean)
            : [],
          sortOrder: parseInt(form.sortOrder) || 0,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to create entry")
        return
      }

      router.push("/admin/experience")
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
          New Experience
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add a new work experience entry.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-5">
        <FormField
          label="Company"
          name="company"
          value={form.company}
          onChange={(e) => updateField("company", e.target.value)}
          placeholder="Acme Inc."
          required
        />
        <FormField
          label="Role"
          name="role"
          value={form.role}
          onChange={(e) => updateField("role", e.target.value)}
          placeholder="Senior Developer"
          required
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Start (month)"
            name="startDate"
            type="month"
            value={form.startDate}
            onChange={(e) => updateField("startDate", e.target.value)}
            required
          />
          <FormField
            label="End (month)"
            name="endDate"
            type="month"
            value={form.endDate}
            onChange={(e) => updateField("endDate", e.target.value)}
            hint="Leave empty (or pick a future month) to mark this role as current."
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Preview:{" "}
          <span className="font-mono">
            {previewPeriod || "(set start month)"}
          </span>
          {previewCurrent && form.startDate && (
            <span className="ml-2 inline-flex items-center gap-1.5 text-primary">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              current
            </span>
          )}
        </p>
        <FormField
          label="Description"
          name="description"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Brief description of the role..."
          multiline
          rows={3}
        />
        <FormField
          label="Responsibilities (one per line)"
          name="responsibilities"
          value={form.responsibilities}
          onChange={(e) => updateField("responsibilities", e.target.value)}
          placeholder={"Led a team of 5 developers\nBuilt CI/CD pipeline\nDesigned API architecture"}
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
        />

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Experience"}
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
