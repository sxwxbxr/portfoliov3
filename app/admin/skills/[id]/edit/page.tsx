"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import FormField from "@/components/admin/FormField"

export default function EditSkillPage({
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
    category: "",
    name: "",
    detail: "",
    level: "",
    sortOrder: "0",
  })

  useEffect(() => {
    fetch(`/api/admin/skills/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          category: data.category || "",
          name: data.name || "",
          detail: data.detail || "",
          level: data.level || "",
          sortOrder: String(data.sortOrder ?? 0),
        })
        setFetching(false)
      })
      .catch(() => {
        setError("Failed to load skill")
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
      const res = await fetch(`/api/admin/skills/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          sortOrder: parseInt(form.sortOrder) || 0,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to update skill")
        return
      }
      router.push("/admin/skills")
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
          Edit Skill
        </h2>
        <p className="text-sm text-muted-foreground mt-1">Update skill details.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-5">
        <FormField
          label="Category"
          name="category"
          value={form.category}
          onChange={(e) => updateField("category", e.target.value)}
          required
        />
        <FormField
          label="Name"
          name="name"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          required
        />
        <FormField
          label="Detail"
          name="detail"
          value={form.detail}
          onChange={(e) => updateField("detail", e.target.value)}
          multiline
          rows={2}
        />
        <FormField
          label="Level"
          name="level"
          value={form.level}
          onChange={(e) => updateField("level", e.target.value)}
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
