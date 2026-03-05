"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

interface DeleteButtonProps {
  endpoint: string
}

export default function DeleteButton({ endpoint }: DeleteButtonProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDelete() {
    if (!confirm("Are you sure you want to delete this item?")) return

    setLoading(true)
    try {
      const res = await fetch(endpoint, { method: "DELETE" })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        alert(data.error || "Failed to delete")
        return
      }
      router.refresh()
    } catch {
      alert("Failed to delete")
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="px-3 py-1.5 text-xs font-medium bg-destructive text-destructive-foreground rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {loading ? "..." : "Delete"}
    </button>
  )
}
