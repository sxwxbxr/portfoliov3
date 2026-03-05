"use client"

import { useRouter } from "next/navigation"

export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" })
    router.push("/login")
  }

  return (
    <button
      onClick={handleLogout}
      className="px-3 py-1.5 text-sm font-medium border border-border rounded-lg hover:bg-accent transition-colors"
    >
      Logout
    </button>
  )
}
