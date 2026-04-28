"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import FormField from "@/components/admin/FormField"

const STATUS_OPTIONS = [
  { value: "planned", label: "Planned" },
  { value: "in-progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
]

export default function EditCertificatePage({
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
    name: "",
    fullTitle: "",
    provider: "",
    category: "",
    status: "planned",
    description: "",
    credentialUrl: "",
    credentialId: "",
    issueDate: "",
    expiryDate: "",
    plannedStart: "",
    plannedEnd: "",
    estimatedHours: "0",
    estimatedCost: "",
    difficulty: "0",
    skills: "",
    whyPoints: "",
    accentColor: "",
    sortOrder: "0",
  })

  useEffect(() => {
    fetch(`/api/admin/certificates/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch certificate")
        return res.json()
      })
      .then((data) => {
        setForm({
          name: data.name || "",
          fullTitle: data.fullTitle || "",
          provider: data.provider || "",
          category: data.category || "",
          status: data.status || "planned",
          description: data.description || "",
          credentialUrl: data.credentialUrl || "",
          credentialId: data.credentialId || "",
          issueDate: data.issueDate || "",
          expiryDate: data.expiryDate || "",
          plannedStart: data.plannedStart || "",
          plannedEnd: data.plannedEnd || "",
          estimatedHours: String(data.estimatedHours ?? 0),
          estimatedCost: data.estimatedCost || "",
          difficulty: String(data.difficulty ?? 0),
          skills: (data.skills || []).join(", "),
          whyPoints: (data.whyPoints || []).join("\n"),
          accentColor: data.accentColor || "",
          sortOrder: String(data.sortOrder ?? 0),
        })
        setFetching(false)
      })
      .catch(() => {
        setError("Failed to load certificate")
        setFetching(false)
      })
  }, [id])

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch(`/api/admin/certificates/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          skills: form.skills
            ? form.skills.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
          whyPoints: form.whyPoints
            ? form.whyPoints.split("\n").map((t) => t.trim()).filter(Boolean)
            : [],
          estimatedHours: parseInt(form.estimatedHours) || 0,
          difficulty: parseInt(form.difficulty) || 0,
          sortOrder: parseInt(form.sortOrder) || 0,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to update certificate")
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
          Edit Certificate
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Update certificate details.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-5">
        <FormField
          label="Name (short)"
          name="name"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          required
        />
        <FormField
          label="Full Title"
          name="fullTitle"
          value={form.fullTitle}
          onChange={(e) => updateField("fullTitle", e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Provider"
            name="provider"
            value={form.provider}
            onChange={(e) => updateField("provider", e.target.value)}
          />
          <FormField
            label="Category"
            name="category"
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium text-foreground">
            Status<span className="text-destructive ml-1">*</span>
          </label>
          <select
            id="status"
            name="status"
            value={form.status}
            onChange={(e) => updateField("status", e.target.value)}
            className="w-full px-4 py-2.5 bg-transparent border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <FormField
          label="Description"
          name="description"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          multiline
          rows={5}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Credential URL"
            name="credentialUrl"
            value={form.credentialUrl}
            onChange={(e) => updateField("credentialUrl", e.target.value)}
          />
          <FormField
            label="Credential ID"
            name="credentialId"
            value={form.credentialId}
            onChange={(e) => updateField("credentialId", e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
            Completed certificates
          </p>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Issue Date"
              name="issueDate"
              value={form.issueDate}
              onChange={(e) => updateField("issueDate", e.target.value)}
              placeholder="2026-06"
            />
            <FormField
              label="Expiry Date (empty = lifetime)"
              name="expiryDate"
              value={form.expiryDate}
              onChange={(e) => updateField("expiryDate", e.target.value)}
              placeholder="2029-06"
            />
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
            Roadmap (planned / in-progress)
          </p>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Planned Start"
              name="plannedStart"
              value={form.plannedStart}
              onChange={(e) => updateField("plannedStart", e.target.value)}
              placeholder="2026-05"
            />
            <FormField
              label="Planned End"
              name="plannedEnd"
              value={form.plannedEnd}
              onChange={(e) => updateField("plannedEnd", e.target.value)}
              placeholder="2026-06"
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <FormField
              label="Estimated Hours"
              name="estimatedHours"
              type="number"
              value={form.estimatedHours}
              onChange={(e) => updateField("estimatedHours", e.target.value)}
            />
            <FormField
              label="Estimated Cost"
              name="estimatedCost"
              value={form.estimatedCost}
              onChange={(e) => updateField("estimatedCost", e.target.value)}
            />
            <FormField
              label="Difficulty (0-5)"
              name="difficulty"
              type="number"
              value={form.difficulty}
              onChange={(e) => updateField("difficulty", e.target.value)}
            />
          </div>
        </div>

        <FormField
          label="Skills (comma-separated)"
          name="skills"
          value={form.skills}
          onChange={(e) => updateField("skills", e.target.value)}
        />
        <FormField
          label="Why Points (one per line)"
          name="whyPoints"
          value={form.whyPoints}
          onChange={(e) => updateField("whyPoints", e.target.value)}
          multiline
          rows={4}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Accent Color (hex)"
            name="accentColor"
            value={form.accentColor}
            onChange={(e) => updateField("accentColor", e.target.value)}
          />
          <FormField
            label="Sort Order"
            name="sortOrder"
            type="number"
            value={form.sortOrder}
            onChange={(e) => updateField("sortOrder", e.target.value)}
          />
        </div>

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
