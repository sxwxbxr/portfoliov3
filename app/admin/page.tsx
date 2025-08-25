"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../../components/AuthProvider"
import { Card, CardHeader, CardTitle, CardContent } from "../../components/ui/card"
import { Button } from "../../components/ui/button"
import { Input } from "../../components/ui/input"
import { Textarea } from "../../components/ui/textarea"
import { Pencil, Trash2 } from "lucide-react"

interface Page {
  id: string
  title: string
  slug: string
  content: string
}

export default function AdminPage() {
  const { isAuthenticated, isAdmin } = useAuth()
  const router = useRouter()
  const [pages, setPages] = useState<Page[]>([])
  const [form, setForm] = useState({ title: "", slug: "", content: "" })
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    } else if (!isAdmin) {
      router.push("/")
    }
  }, [isAuthenticated, isAdmin, router])

  useEffect(() => {
    fetch("/api/pages")
      .then((res) => res.json())
      .then((data) => setPages(data))
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editingId) {
      const res = await fetch(`/api/pages/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const updated = await res.json()
        setPages((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
        setEditingId(null)
        setForm({ title: "", slug: "", content: "" })
      }
    } else {
      const res = await fetch("/api/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (res.ok) {
        const created = await res.json()
        setPages((prev) => [...prev, created])
        setForm({ title: "", slug: "", content: "" })
      }
    }
  }

  const handleEdit = (page: Page) => {
    setEditingId(page.id)
    setForm({ title: page.title, slug: page.slug, content: page.content })
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this page?")) return
    const res = await fetch(`/api/pages/${id}`, { method: "DELETE" })
    if (res.ok) {
      setPages((prev) => prev.filter((p) => p.id !== id))
    }
  }

  if (!isAuthenticated || !isAdmin) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 p-4">
      <div className="max-w-3xl mx-auto pt-20">
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>{editingId ? "Edit Page" : "Create Page"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                placeholder="Title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
              />
              <Input
                placeholder="Slug"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                required
              />
              <Textarea
                placeholder="Content"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                required
                rows={6}
              />
              <div className="flex items-center space-x-2">
                <Button type="submit" className="bg-gradient-to-r from-primary to-secondary">
                  {editingId ? "Update" : "Create"}
                </Button>
                {editingId && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      setEditingId(null)
                      setForm({ title: "", slug: "", content: "" })
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Pages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {pages.map((page) => (
              <div key={page.id} className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <p className="font-medium">{page.title}</p>
                  <p className="text-sm text-muted-foreground">/pages/{page.slug}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(page)}>
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(page.id)}
                    className="text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
            {pages.length === 0 && <p className="text-sm text-muted-foreground">No pages yet.</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

