"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import FormField from "@/components/admin/FormField"
import { derivePeriodRange } from "@/lib/period-range"

export default function EditEducationEntryPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [error, setError] = useState("")
  const [legacyPeriod, setLegacyPeriod] = useState("")
  const [form, setForm] = useState({
    title: "",
    institution: "",
    startDate: "",
    endDate: "",
    description: "",
    sortOrder: "0",
  })

  useEffect(() => {
    fetch(`/api/admin/certificates/education/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch")
        return res.json()
      })
      .then((data) => {
        setForm({
          title: data.title || "",
          institution: data.institution || "",
          startDate: data.startDate || "",
          endDate: data.endDate || "",
          description: data.description || "",
          sortOrder: String(data.sortOrder ?? 0),
        })
        if (!data.startDate && data.period) {
          setLegacyPeriod(data.period)
        }
        setFetching(false)
      })
      .catch(() => {
        setError("Failed to load entry")
        setFetching(false)
      })
  }, [id])

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const { period: previewPeriod, current: previewCurrent } =
    derivePeriodRange(form.startDate, form.endDate)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (form.endDate && form.startDate && form.endDate < form.startDate) {
      setError("End date cannot be before start date.")
      return
    }

    setLoading(true)

    try {
      const res = await fetch(`/api/admin/certificates/education/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          institution: form.institution,
          startDate: form.startDate,
          endDate: form.endDate,
          description: form.description,
          sortOrder: parseInt(form.sortOrder) || 0,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to update entry")
        return
      }

      router.push("/admin/certificates")
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
          Edit Education Entry
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Update an academic background entry shown on the Education page.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-5">
        <FormField
          label="Title"
          name="title"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          required
        />
        <FormField
          label="Institution"
          name="institution"
          value={form.institution}
          onChange={(e) => updateField("institution", e.target.value)}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField
            label="Start (month)"
            name="startDate"
            type="month"
            value={form.startDate}
            onChange={(e) => updateField("startDate", e.target.value)}
          />
          <FormField
            label="End (month)"
            name="endDate"
            type="month"
            value={form.endDate}
            onChange={(e) => updateField("endDate", e.target.value)}
            hint="Leave empty (or pick a future month) to mark this as ongoing."
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Preview:{" "}
          <span className="font-mono">
            {previewPeriod || legacyPeriod || "(set start month)"}
          </span>
          {previewCurrent && form.startDate && (
            <span className="ml-2 inline-flex items-center gap-1.5 text-primary">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-40" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              ongoing
            </span>
          )}
        </p>
        {!form.startDate && legacyPeriod && (
          <p className="text-xs text-muted-foreground/80 -mt-3">
            Legacy period text: <span className="font-mono">{legacyPeriod}</span>. Pick start/end months above to replace it.
          </p>
        )}
        <FormField
          label="Description"
          name="description"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          multiline
          rows={5}
        />
        <FormField
          label="Sort Order"
          name="sortOrder"
          type="number"
          value={form.sortOrder}
          onChange={(e) => updateField("sortOrder", e.target.value)}
          hint="Lower numbers appear first."
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
