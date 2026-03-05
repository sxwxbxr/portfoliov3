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
    <>
      <Navigation />
      <main className="min-h-screen flex items-center justify-center px-6 pt-16">
        <div className="w-full max-w-[400px]">
          <div className="glass rounded-2xl p-8">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-foreground mb-1">
              Create account
            </h1>

            {available === null && (
              <p className="text-sm text-muted-foreground mb-8">
                Checking availability...
              </p>
            )}

            {available === false && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground mb-6">
                  Signup is disabled. An account already exists.
                </p>
                <Link
                  href="/login"
                  className="inline-block w-full py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity text-center text-sm"
                >
                  Go to sign in
                </Link>
              </div>
            )}

            {available === true && (
              <>
                <p className="text-sm text-muted-foreground mb-8">
                  Set up your admin account
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label
                      htmlFor="name"
                      className="text-sm font-medium text-foreground"
                    >
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
                      className="w-full px-4 py-3 bg-transparent border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="email"
                      className="text-sm font-medium text-foreground"
                    >
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
                      className="w-full px-4 py-3 bg-transparent border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="text-sm font-medium text-foreground"
                    >
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
                      className="w-full px-4 py-3 bg-transparent border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50"
                    />
                  </div>

                  <div className="space-y-2">
                    <label
                      htmlFor="confirm-password"
                      className="text-sm font-medium text-foreground"
                    >
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
                      className="w-full px-4 py-3 bg-transparent border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground/50"
                    />
                  </div>

                  {error && (
                    <p className="text-sm text-destructive">{error}</p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-primary text-primary-foreground rounded-full font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Creating account..." : "Create account"}
                  </button>
                </form>

                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground text-center">
                    Already have an account?{" "}
                    <Link
                      href="/login"
                      className="text-primary hover:opacity-80 transition-opacity"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  )
}
