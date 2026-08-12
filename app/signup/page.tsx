"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Navigation from "@/components/Navigation"
import { copy } from "@/lib/copy"

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
      setError(copy.auth.errors.passwordMismatch)
      return
    }

    if (password.length < 8) {
      setError(copy.auth.errors.passwordShort)
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
        setError(data.error || copy.auth.errors.signUpFailed)
        if (res.status === 403) {
          setAvailable(false)
        }
        return
      }

      router.push("/login?registered=true")
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
        <div className="cast rim flex w-full max-w-[420px] flex-col gap-7 p-7 md:p-8">
          <div className="flex flex-col gap-2">
            <span className="tab annotate self-start">{copy.auth.label}</span>
            <h1 className="font-display text-2xl font-semibold tracking-tight">
              {copy.auth.signUpTitle}
            </h1>

            {available === null && (
              <p className="text-sm text-fg-muted">{copy.auth.checkingAvailability}</p>
            )}

            {available === true && (
              <p className="text-sm text-fg-muted">{copy.auth.signUpSubtitle}</p>
            )}
          </div>

          {available === false && (
            <div className="flex flex-col gap-5">
              {/* Closed door: a recess, not a form. */}
              <div className="well p-6 text-center text-sm text-fg-muted">
                {copy.auth.signUpDisabled}
              </div>
              <Link
                href="/login"
                className="control control-primary w-full px-5 py-3 text-center text-sm font-medium"
              >
                {copy.auth.goToSignIn}
              </Link>
            </div>
          )}

          {available === true && (
            <>
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="name" className="annotate">
                    {copy.auth.name}
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoComplete="name"
                    placeholder={copy.auth.namePlaceholder}
                    className="field w-full px-4 py-3 text-sm"
                  />
                </div>

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
                    autoComplete="new-password"
                    placeholder={copy.auth.newPasswordPlaceholder}
                    className="field w-full px-4 py-3 text-sm"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="confirm-password" className="annotate">
                    {copy.auth.confirmPassword}
                  </label>
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder={copy.auth.confirmPasswordPlaceholder}
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
                  {loading ? copy.auth.signingUp : copy.auth.signUp}
                </button>
              </form>

              <div className="well-sm px-4 py-3 text-center">
                <p className="text-sm text-fg-muted">
                  {copy.auth.haveAccount}{" "}
                  <Link href="/login" className="link-underline text-signal">
                    {copy.auth.signIn}
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
