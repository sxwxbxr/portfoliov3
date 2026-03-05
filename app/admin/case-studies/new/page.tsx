"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import FormField from "@/components/admin/FormField"

export default function NewCaseStudyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    title: "",
    slug: "",
    client: "",
    industry: "",
    duration: "",
    team: "",
    challenge: "",
    solution: "",
    results: "",
    technologies: "",
    image: "",
    testimonialQuote: "",
    testimonialAuthor: "",
    testimonialCompany: "",
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
      const res = await fetch("/api/admin/case-studies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          results: form.results
            ? form.results.split("\n").map((r) => r.trim()).filter(Boolean)
            : [],
          technologies: form.technologies
            ? form.technologies.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to create case study")
        return
      }

      router.push("/admin/case-studies")
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
          New Case Study
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Create a new case study.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-5">
        <FormField
          label="Title"
          name="title"
          value={form.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="Project Title"
          required
        />
        <FormField
          label="Slug"
          name="slug"
          value={form.slug}
          onChange={(e) => updateField("slug", e.target.value)}
          placeholder="project-title"
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Client"
            name="client"
            value={form.client}
            onChange={(e) => updateField("client", e.target.value)}
            placeholder="Client Name"
          />
          <FormField
            label="Industry"
            name="industry"
            value={form.industry}
            onChange={(e) => updateField("industry", e.target.value)}
            placeholder="Technology"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Duration"
            name="duration"
            value={form.duration}
            onChange={(e) => updateField("duration", e.target.value)}
            placeholder="3 months"
          />
          <FormField
            label="Team"
            name="team"
            value={form.team}
            onChange={(e) => updateField("team", e.target.value)}
            placeholder="4 developers"
          />
        </div>
        <FormField
          label="Challenge"
          name="challenge"
          value={form.challenge}
          onChange={(e) => updateField("challenge", e.target.value)}
          placeholder="Describe the challenge..."
          multiline
          rows={4}
        />
        <FormField
          label="Solution"
          name="solution"
          value={form.solution}
          onChange={(e) => updateField("solution", e.target.value)}
          placeholder="Describe the solution..."
          multiline
          rows={4}
        />
        <FormField
          label="Results (one per line)"
          name="results"
          value={form.results}
          onChange={(e) => updateField("results", e.target.value)}
          placeholder={"50% increase in performance\n30% reduction in costs\nImproved user satisfaction"}
          multiline
          rows={4}
        />
        <FormField
          label="Technologies (comma-separated)"
          name="technologies"
          value={form.technologies}
          onChange={(e) => updateField("technologies", e.target.value)}
          placeholder="React, Node.js, PostgreSQL"
        />
        <FormField
          label="Image URL"
          name="image"
          value={form.image}
          onChange={(e) => updateField("image", e.target.value)}
          placeholder="/images/case-study.png"
        />

        <div className="border-t border-border pt-5 mt-5 space-y-5">
          <p className="text-sm font-medium text-muted-foreground">
            Testimonial (optional)
          </p>
          <FormField
            label="Quote"
            name="testimonialQuote"
            value={form.testimonialQuote}
            onChange={(e) => updateField("testimonialQuote", e.target.value)}
            placeholder="Working with them was an incredible experience..."
            multiline
            rows={3}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Author"
              name="testimonialAuthor"
              value={form.testimonialAuthor}
              onChange={(e) => updateField("testimonialAuthor", e.target.value)}
              placeholder="John Doe"
            />
            <FormField
              label="Company"
              name="testimonialCompany"
              value={form.testimonialCompany}
              onChange={(e) =>
                updateField("testimonialCompany", e.target.value)
              }
              placeholder="Acme Inc."
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={loading}
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {loading ? "Creating..." : "Create Case Study"}
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
