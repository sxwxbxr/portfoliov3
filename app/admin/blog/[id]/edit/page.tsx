"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import FormField from "@/components/admin/FormField"
import CheckboxField from "@/components/admin/CheckboxField"

export default function EditBlogPostPage({
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
    excerpt: "",
    content: "",
    publishedAt: "",
    readTime: "",
    author: "",
    tags: "",
    image: "",
    featured: false,
  })

  useEffect(() => {
    fetch(`/api/admin/blog/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setForm({
          title: data.title || "",
          slug: data.slug || "",
          excerpt: data.excerpt || "",
          content: data.content || "",
          publishedAt: data.publishedAt || "",
          readTime: data.readTime || "",
          author: data.author || "",
          tags: (data.tags || []).join(", "),
          image: data.image || "",
          featured: Boolean(data.featured),
        })
        setFetching(false)
      })
      .catch(() => {
        setError("Failed to load post")
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
      const res = await fetch(`/api/admin/blog/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags
            ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
            : [],
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || "Failed to update post")
        return
      }

      router.push("/admin/blog")
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
          Edit Blog Post
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Update blog post details.
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
        <FormField
          label="Excerpt"
          name="excerpt"
          value={form.excerpt}
          onChange={(e) => updateField("excerpt", e.target.value)}
          multiline
          rows={3}
        />
        <FormField
          label="Content (Markdown)"
          name="content"
          value={form.content}
          onChange={(e) => updateField("content", e.target.value)}
          multiline
          rows={15}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Published Date"
            name="publishedAt"
            type="date"
            value={form.publishedAt}
            onChange={(e) => updateField("publishedAt", e.target.value)}
            required
          />
          <FormField
            label="Read Time"
            name="readTime"
            value={form.readTime}
            onChange={(e) => updateField("readTime", e.target.value)}
          />
        </div>
        <FormField
          label="Author"
          name="author"
          value={form.author}
          onChange={(e) => updateField("author", e.target.value)}
        />
        <FormField
          label="Tags (comma-separated)"
          name="tags"
          value={form.tags}
          onChange={(e) => updateField("tags", e.target.value)}
        />
        <FormField
          label="Image URL"
          name="image"
          value={form.image}
          onChange={(e) => updateField("image", e.target.value)}
        />
        <CheckboxField
          label="Feature on homepage (overrides recency check)"
          name="featured"
          checked={form.featured}
          onChange={(e) => updateField("featured", e.target.checked)}
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
