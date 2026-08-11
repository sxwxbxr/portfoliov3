"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navigation from "@/components/Navigation"

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)

  useEffect(() => {
    async function checkAvailability() {
      try {
        const res = await fetch("/api/auth/signup-available")
        const data = await res.json()
        setAvailable(data.available)
      } catch {
        setAvailable(false)
      }
    }
    checkAvailability()
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, name }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Signup failed")
        if (res.status === 403) {
          setAvailable(false)
        }
        return
      }

      router.push("/login?registered=true")
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ground">
      <Navigation />

      <div className="flex min-h-screen items-center justify-center px-6 pb-16 pt-24">
        <div className="cast rim flex w-full max-w-[420px] flex-col gap-7 p-7 md:p-8">
          <div className="flex flex-col gap-2">
            <span className="tab annotate self-start">Admin</span>
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              Create account
            </h1>

            {available === null && (
              <p className="text-sm text-fg-muted">Checking availability...</p>
            )}

            {available === true && (
              <p className="text-sm text-fg-muted">Set up your admin account</p>
            )}
          </div>

          {available === false && (
            <div className="flex flex-col gap-5">
              {/* Closed door: a recess, not a form. */}
              <div className="well p-6 text-center text-sm text-fg-muted">
                Signup is disabled. An account already exists.
              </div>
              <Link
                href="/login"
                className="control control-primary w-full px-5 py-3 text-center text-sm font-medium"
              >
                Go to sign in
              </Link>
            </div>
          )}

          {available === true && (
            <>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="annotate">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    placeholder="Your name"
                    className="field w-full px-4 py-3 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="annotate">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="field w-full px-4 py-3 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="password" className="annotate">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
                    className="field w-full px-4 py-3 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="confirm-password" className="annotate">
                    Confirm password
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Repeat your password"
                    className="field w-full px-4 py-3 text-sm"
                  />
                </div>

                {error && (
                  <p role="alert" className="well-sm p-3 text-sm text-destructive">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="control control-primary w-full px-5 py-3 text-sm font-medium"
                >
                  {loading ? "Creating account..." : "Create account"}
                </button>
              </form>

              <div className="well-sm px-4 py-3 text-center">
                <p className="text-sm text-fg-muted">
                  Already have an account?{" "}
                  <Link href="/login" className="link-underline text-signal">
                    Sign in
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
