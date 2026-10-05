"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import FormField from "@/components/admin/FormField"
import ImageField from "@/components/admin/ImageField"
import { ProseMarkdown } from "@/components/ProseMarkdown"

export interface NewsPostValues {
  id?: number
  slug: string
  title: string
  excerpt: string
  body: string
  type: string
  status: string
  publishedAt: string
  author: string
  coverImage: string
  tags: string[]
  packages: string[]
  videos: string[]
  canonicalUrl: string
  source?: string
}

export interface PackageOption {
  slug: string
  name: string
}

const today = () => new Date().toISOString().slice(0, 10)

export const EMPTY_POST: NewsPostValues = {
  slug: "",
  title: "",
  excerpt: "",
  body: "",
  type: "news",
  status: "draft",
  publishedAt: "",
  author: "Seya Weber",
  coverImage: "",
  tags: [],
  packages: [],
  videos: [],
  canonicalUrl: "",
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/, "")
}

/** Accepts a bare ID or a watch / youtu.be / shorts / embed URL. */
function youtubeId(raw: string): string {
  const s = raw.trim()
  if (!s) return ""
  try {
    const u = new URL(s)
    const host = u.hostname.replace(/^www\./, "")
    if (host === "youtu.be") return u.pathname.split("/")[1] ?? ""
    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      const v = u.searchParams.get("v")
      if (v) return v
      const m = u.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?]+)/)
      if (m) return m[1]
    }
  } catch {
    // not a URL: treat as an ID
  }
  return s
}

export default function NewsPostForm({
  initial,
  packageOptions,
}: {
  initial?: NewsPostValues
  packageOptions: PackageOption[]
}) {
  const router = useRouter()
  const isEdit = Boolean(initial?.id)
  const start = initial ?? EMPTY_POST

  const [form, setForm] = useState({
    title: start.title,
    slug: start.slug,
    type: start.type,
    publishedAt: start.publishedAt || today(),
    author: start.author,
    excerpt: start.excerpt,
    body: start.body,
    coverImage: start.coverImage,
    canonicalUrl: start.canonicalUrl,
    tags: start.tags.join(", "),
    videos: start.videos.join("\n"),
    packages: start.packages,
  })
  const [slugTouched, setSlugTouched] = useState(isEdit)
  const [preview, setPreview] = useState(false)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState("")

  function set<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((p) => ({ ...p, [key]: value }))
  }

  function onTitle(title: string) {
    setForm((p) => ({
      ...p,
      title,
      slug: slugTouched ? p.slug : slugify(title),
    }))
  }

  function togglePackage(slug: string) {
    setForm((p) => ({
      ...p,
      packages: p.packages.includes(slug)
        ? p.packages.filter((s) => s !== slug)
        : [...p.packages, slug],
    }))
  }

  async function submit(status: "draft" | "published") {
    setError("")
    setBusy(status)
    const payload = {
      title: form.title,
      slug: form.slug,
      type: form.type,
      status,
      publishedAt: form.publishedAt,
      author: form.author,
      excerpt: form.excerpt,
      body: form.body,
      coverImage: form.coverImage.trim(),
      canonicalUrl: form.canonicalUrl.trim(),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      packages: form.packages,
      videos: form.videos.split("\n").map(youtubeId).filter(Boolean),
    }
    try {
      const res = await fetch(
        isEdit ? `/api/admin/news/${initial!.id}` : "/api/admin/news",
        {
          method: isEdit ? "PUT" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      )
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "Failed to save post")
        return
      }
      router.push("/admin/news")
      router.refresh()
    } catch {
      setError("Something went wrong")
    } finally {
      setBusy(null)
    }
  }

  const published = initial?.status === "published"
  const btnPrimary =
    "bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
  const btnSecondary =
    "px-4 py-2 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50"
  const toggleBtn = (active: boolean) =>
    `px-3 py-1 text-xs font-medium rounded-md transition-colors ${
      active ? "bg-primary text-primary-foreground" : "hover:bg-accent text-muted-foreground"
    }`

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void submit(published ? "published" : "draft")
      }}
      className="glass rounded-xl p-6 space-y-5"
    >
      <FormField
        label="Title"
        name="title"
        value={form.title}
        onChange={(e) => onTitle(e.target.value)}
        required
      />
      <FormField
        label="Slug"
        name="slug"
        value={form.slug}
        onChange={(e) => {
          setSlugTouched(true)
          set("slug", e.target.value)
        }}
        required
        hint="Lowercase letters, digits and dashes. Generated from the title until you edit it."
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <label htmlFor="type" className="text-sm font-medium text-foreground">
            Type
          </label>
          <select
            id="type"
            value={form.type}
            onChange={(e) => set("type", e.target.value)}
            className="w-full px-4 py-2.5 bg-transparent border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="news">News</option>
            <option value="tutorial">Tutorial</option>
            <option value="release">Release</option>
          </select>
        </div>
        <FormField
          label="Publish date"
          name="publishedAt"
          type="date"
          value={form.publishedAt}
          onChange={(e) => set("publishedAt", e.target.value)}
          required
          hint="A future date schedules the post."
        />
        <FormField
          label="Author"
          name="author"
          value={form.author}
          onChange={(e) => set("author", e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <FormField
          label="Excerpt"
          name="excerpt"
          value={form.excerpt}
          onChange={(e) => set("excerpt", e.target.value)}
          multiline
          rows={3}
        />
        <p
          className={`text-xs font-mono text-right ${
            form.excerpt.trim().length > 500 ? "text-destructive" : "text-muted-foreground"
          }`}
        >
          {form.excerpt.trim().length}/500
        </p>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label htmlFor="body" className="text-sm font-medium text-foreground">
            Body (Markdown)
          </label>
          <div className="flex gap-1 border border-border rounded-lg p-0.5 xl:hidden">
            <button type="button" onClick={() => setPreview(false)} className={toggleBtn(!preview)}>
              Write
            </button>
            <button type="button" onClick={() => setPreview(true)} className={toggleBtn(preview)}>
              Preview
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <textarea
            id="body"
            name="body"
            value={form.body}
            onChange={(e) => set("body", e.target.value)}
            rows={24}
            spellCheck
            className={`${
              preview ? "hidden xl:block" : ""
            } w-full px-4 py-3 bg-transparent border border-border rounded-lg text-sm font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-ring resize-y min-h-[24rem]`}
          />
          <div
            className={`${
              preview ? "" : "hidden xl:block"
            } border border-border rounded-lg p-5 overflow-auto max-h-[44rem] min-h-[24rem]`}
          >
            {form.body.trim() ? (
              <ProseMarkdown>{form.body}</ProseMarkdown>
            ) : (
              <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>
            )}
          </div>
        </div>
      </div>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium text-foreground">Packages</legend>
        {packageOptions.length === 0 ? (
          <p className="text-xs text-muted-foreground">No packages found.</p>
        ) : (
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            {packageOptions.map((p) => (
              <label key={p.slug} className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.packages.includes(p.slug)}
                  onChange={() => togglePackage(p.slug)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-ring"
                />
                {p.name}
              </label>
            ))}
          </div>
        )}
      </fieldset>

      <FormField
        label="Tags (comma-separated)"
        name="tags"
        value={form.tags}
        onChange={(e) => set("tags", e.target.value)}
      />
      <FormField
        label="Videos"
        name="videos"
        value={form.videos}
        onChange={(e) => set("videos", e.target.value)}
        multiline
        rows={3}
        placeholder="https://youtu.be/dQw4w9WgXcQ"
        hint="One per line. Paste a YouTube link (watch, youtu.be, shorts) or a video ID."
      />
      <ImageField
        label="Cover image"
        name="coverImage"
        value={form.coverImage}
        onChange={(v) => set("coverImage", v)}
        hint="Upload a file, or paste a path or URL."
      />
      <FormField
        label="Canonical URL"
        name="canonicalUrl"
        value={form.canonicalUrl}
        onChange={(e) => set("canonicalUrl", e.target.value)}
        placeholder="https://"
        hint="Only if the post first appeared elsewhere, e.g. on Schulz Media."
      />

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        {published ? (
          <>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void submit("published")}
              className={btnPrimary}
            >
              {busy === "published" ? "Saving..." : "Update"}
            </button>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void submit("draft")}
              className={btnSecondary}
            >
              {busy === "draft" ? "Saving..." : "Unpublish"}
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void submit("published")}
              className={btnPrimary}
            >
              {busy === "published" ? "Publishing..." : "Publish"}
            </button>
            <button
              type="button"
              disabled={busy !== null}
              onClick={() => void submit("draft")}
              className={btnSecondary}
            >
              {busy === "draft" ? "Saving..." : "Save draft"}
            </button>
          </>
        )}
        <button
          type="button"
          onClick={() => router.push("/admin/news")}
          className={btnSecondary}
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
