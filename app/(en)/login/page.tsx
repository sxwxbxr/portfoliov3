"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navigation from "@/components/Navigation"
import { copy } from "@/lib/copy"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || copy.auth.errors.signInFailed)
        return
      }

      router.push("/admin")
    } catch {
      setError(copy.auth.errors.generic)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ground">
      <Navigation />

      <div className="flex min-h-screen items-center justify-center px-6 pb-16 pt-24">
        <div className="cast flex w-full max-w-[420px] flex-col gap-7 p-7 md:p-8">
          <div className="flex flex-col gap-2">
            <span className="tab annotate self-start">{copy.auth.label}</span>
            <h1 className="text-2xl tracking-tight">
              {copy.auth.signInTitle}
            </h1>
            <p className="text-sm text-fg-muted">{copy.auth.signInSubtitle}</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="annotate">
                {copy.auth.email}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder={copy.auth.emailPlaceholder}
                className="field w-full px-4 py-3 text-sm"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="annotate">
                {copy.auth.password}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder={copy.auth.passwordPlaceholder}
                className="field w-full px-4 py-3 text-sm"
              />
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="control control-primary w-full justify-center py-2.5 text-sm"
            >
              {loading ? copy.auth.signingIn : copy.auth.signIn}
            </button>
          </form>

          <div className="border-t border-edge-soft pt-5 text-center">
            <p className="text-sm text-fg-muted">
              {copy.auth.noAccount}{" "}
              <Link href="/signup" className="link-underline text-fg">
                {copy.auth.signUp}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
