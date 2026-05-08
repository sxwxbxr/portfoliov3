"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import FormField from "@/components/admin/FormField"

export default function NewProjectPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    title: "",
    slug: "",
    shortDescription: "",
    description: "",
    image: "",
    tags: "",
    github: "",
    demo: "",
    sortOrder: "0",
    client: "",
    duration: "",
    challenge: "",
    solution: "",
    results: "",
  })

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
    if (field === "title" && !form.slug) {
      setForm((prev) => ({
        ...prev,
        [field]: value,
        slug: value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, ""),
      }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags
            ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
          results: form.results
            ? form.results.split("\n").map((r) => r.trim()).filter(Boolean)
            : [],
          sortOrder: parseInt(form.sortOrder) || 0,
          github: form.github || "#",
          demo: form.demo || "#",
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to create project")
        return
      }

      router.push("/admin/projects")
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
          New Project
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Create a new portfolio project.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-5">
        <FormField
          label="Title"
          name="title"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="My Awesome Project"
          required
        />
        <FormField
          label="Slug"
          name="slug"
          value={form.slug}
          onChange={(e) => updateField("slug", e.target.value)}
          placeholder="my-awesome-project"
          required
        />
        <FormField
          label="Short Description"
          name="shortDescription"
          value={form.shortDescription}
          onChange={(e) => updateField("shortDescription", e.target.value)}
          placeholder="A brief one-liner..."
          required
        />
        <FormField
          label="Description"
          name="description"
          value={form.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="Full project description..."
          required
          multiline
          rows={6}
        />
        <FormField
          label="Image URL"
          name="image"
          value={form.image}
          onChange={(e) => updateField("image", e.target.value)}
          placeholder="/images/project.png"
        />
        <FormField
          label="Tags (comma-separated)"
          name="tags"
          value={form.tags}
          onChange={(e) => updateField("tags", e.target.value)}
          placeholder="React, TypeScript, Next.js"
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="GitHub URL"
            name="github"
            value={form.github}
            onChange={(e) => updateField("github", e.target.value)}
            placeholder="https://github.com/..."
          />
          <FormField
            label="Demo URL"
            name="demo"
            value={form.demo}
            onChange={(e) => updateField("demo", e.target.value)}
            placeholder="https://..."
          />
        </div>
        <FormField
          label="Sort Order"
          name="sortOrder"
          type="number"
          value={form.sortOrder}
          onChange={(e) => updateField("sortOrder", e.target.value)}
          placeholder="0"
        />

        <div className="pt-4 border-t border-border space-y-5">
          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Case study (optional)
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Fill these in to render a richer Challenge / Solution / Results
              layout on the project detail page.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Client"
              name="client"
              value={form.client}
              onChange={(e) => updateField("client", e.target.value)}
              placeholder="ACME Corp"
            />
            <FormField
              label="Duration"
              name="duration"
              value={form.duration}
              onChange={(e) => updateField("duration", e.target.value)}
              placeholder="Mar 2024 - Jul 2024"
            />
          </div>
          <FormField
            label="Challenge"
            name="challenge"
            value={form.challenge}
            onChange={(e) => updateField("challenge", e.target.value)}
            placeholder="What problem we set out to solve."
            multiline
            rows={4}
          />
          <FormField
            label="Solution"
            name="solution"
            value={form.solution}
            onChange={(e) => updateField("solution", e.target.value)}
            placeholder="How we solved it."
            multiline
            rows={4}
          />
          <FormField
            label="Results (one per line)"
            name="results"
            value={form.results}
            onChange={(e) => updateField("results", e.target.value)}
            placeholder={"40% latency reduction\nZero downtime cutover"}
            multiline
            rows={5}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Project"}
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
