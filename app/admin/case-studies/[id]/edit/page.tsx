"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import FormField from "@/components/admin/FormField"

export default function EditCaseStudyPage({
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

  useEffect(() => {
    fetch(`/api/admin/case-studies/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          title: data.title || "",
          slug: data.slug || "",
          client: data.client || "",
          industry: data.industry || "",
          duration: data.duration || "",
          team: data.team || "",
          challenge: data.challenge || "",
          solution: data.solution || "",
          results: (data.results || []).join("\n"),
          technologies: (data.technologies || []).join(", "),
          image: data.image || "",
          testimonialQuote: data.testimonialQuote || "",
          testimonialAuthor: data.testimonialAuthor || "",
          testimonialCompany: data.testimonialCompany || "",
        })
        setFetching(false)
      })
      .catch(() => {
        setError("Failed to load case study")
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
      const res = await fetch(`/api/admin/case-studies/${id}`, {
        method: "PUT",
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
        setError(data.error || "Failed to update case study")
        return
      }

      router.push("/admin/case-studies")
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
          Edit Case Study
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Update case study details.
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
          label="Slug"
          name="slug"
          value={form.slug}
          onChange={(e) => updateField("slug", e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Client"
            name="client"
            value={form.client}
            onChange={(e) => updateField("client", e.target.value)}
          />
          <FormField
            label="Industry"
            name="industry"
            value={form.industry}
            onChange={(e) => updateField("industry", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Duration"
            name="duration"
            value={form.duration}
            onChange={(e) => updateField("duration", e.target.value)}
          />
          <FormField
            label="Team"
            name="team"
            value={form.team}
            onChange={(e) => updateField("team", e.target.value)}
          />
        </div>
        <FormField
          label="Challenge"
          name="challenge"
          value={form.challenge}
          onChange={(e) => updateField("challenge", e.target.value)}
          multiline
          rows={4}
        />
        <FormField
          label="Solution"
          name="solution"
          value={form.solution}
          onChange={(e) => updateField("solution", e.target.value)}
          multiline
          rows={4}
        />
        <FormField
          label="Results (one per line)"
          name="results"
          value={form.results}
          onChange={(e) => updateField("results", e.target.value)}
          multiline
          rows={4}
        />
        <FormField
          label="Technologies (comma-separated)"
          name="technologies"
          value={form.technologies}
          onChange={(e) => updateField("technologies", e.target.value)}
        />
        <FormField
          label="Image URL"
          name="image"
          value={form.image}
          onChange={(e) => updateField("image", e.target.value)}
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
            multiline
            rows={3}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Author"
              name="testimonialAuthor"
              value={form.testimonialAuthor}
              onChange={(e) =>
                updateField("testimonialAuthor", e.target.value)
              }
            />
            <FormField
              label="Company"
              name="testimonialCompany"
              value={form.testimonialCompany}
              onChange={(e) =>
                updateField("testimonialCompany", e.target.value)
              }
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
