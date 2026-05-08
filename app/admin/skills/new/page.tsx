"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import FormField from "@/components/admin/FormField"

export default function NewSkillPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    category: "",
    name: "",
    detail: "",
    level: "",
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
      const res = await fetch("/api/admin/skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          sortOrder: parseInt(form.sortOrder) || 0,
        }),
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to create skill")
        return
      }
      router.push("/admin/skills")
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
          New Skill
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add a skill or competency.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-5">
        <FormField
          label="Category"
          name="category"
          value={form.category}
          onChange={(e) => updateField("category", e.target.value)}
          placeholder="Development"
          required
          hint="Skills with the same category are grouped on the public Skills page. Common: Development, Project Management, Tools & Platforms, Languages."
        />
        <FormField
          label="Name"
          name="name"
          value={form.name}
          onChange={(e) => updateField("name", e.target.value)}
          placeholder="TypeScript"
          required
        />
        <FormField
          label="Detail"
          name="detail"
          value={form.detail}
          onChange={(e) => updateField("detail", e.target.value)}
          placeholder="What you actually use this for"
          multiline
          rows={2}
          hint="Short use-case sentence. Beats a bare list and helps the reader judge depth."
        />
        <FormField
          label="Level"
          name="level"
          value={form.level}
          onChange={(e) => updateField("level", e.target.value)}
          placeholder="C1 Advanced / Comfortable / Expert"
          hint="Optional. Use CEFR for languages, free-form for tech."
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
            {loading ? "Creating..." : "Create Skill"}
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
