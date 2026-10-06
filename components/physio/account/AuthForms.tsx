"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"
import { accountCopy } from "@/lib/physio/copy/account"
import { physioPath } from "@/lib/physio/urls"
import { EMAIL_RE, postJson } from "./api"
import { FieldError, FormAlert, PasswordField, TextField } from "./fields"

const c = accountCopy
const MIN = 10
const linkCls = "font-medium text-signal underline underline-offset-4 hover:no-underline"

function Submit({ busy, idle, working }: { busy: boolean; idle: string; working: string }) {
  return (
    <button type="submit" disabled={busy} className="control control-primary inline-flex min-h-11 w-fit items-center gap-2 px-6 py-2.5 text-sm">
      {busy && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
      {busy ? working : idle}
    </button>
  )
}

/** Full navigation (not router.push) so the header refetches the login state. */
const go = (path: string) => window.location.assign(physioPath(path))

export function LoginForm() {
  const next = useSearchParams().get("next") ?? undefined
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({})
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (busy) return
    const found = {
      email: EMAIL_RE.test(email.trim()) ? undefined : c.fields.emailInvalid,
      password: password ? undefined : c.fields.required,
    }
    setErrors(found)
    setError(null)
    if (found.email || found.password) {
      document.getElementById(found.email ? "login-email" : "login-password")?.focus()
      return
    }
    setBusy(true)
    const res = await postJson<{ next: string }>("/api/physio/auth/login", { email, password, next })
    if (res.ok) return go(res.data.next || "/konto")
    setError(res.message)
    setBusy(false)
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <TextField id="login-email" label={c.fields.email} type="email" value={email} onChange={setEmail} autoComplete="email" error={errors.email} />
      <PasswordField id="login-password" label={c.fields.password} value={password} onChange={setPassword} autoComplete="current-password" error={errors.password} />
      <FormAlert message={error} />
      <Submit busy={busy} idle={c.login.submit} working={c.login.submitting} />
      <div className="flex flex-col gap-1 text-sm text-fg-muted">
        <Link href={physioPath("/passwort-vergessen")} className={linkCls + " w-fit py-2"}>
          {c.login.forgot}
        </Link>
        <p className="py-2">
          {c.login.noAccount}{" "}
          <Link href={physioPath("/registrieren")} className={linkCls}>
            {c.login.toRegister}
          </Link>
        </p>
      </div>
    </form>
  )
}

export function RegisterForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [accepted, setAccepted] = useState(false)
  const [errors, setErrors] = useState<{ email?: string; password?: string; privacy?: string }>({})
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [doneFor, setDoneFor] = useState<string | null>(null)
  const doneRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (doneFor) doneRef.current?.focus()
  }, [doneFor])

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (busy) return
    const found = {
      email: EMAIL_RE.test(email.trim()) ? undefined : c.fields.emailInvalid,
      password: password.length >= MIN ? undefined : c.fields.tooShort,
      privacy: accepted ? undefined : c.register.privacyRequired,
    }
    setErrors(found)
    setError(null)
    const first = (["email", "password", "privacy"] as const).find((k) => found[k])
    if (first) {
      document.getElementById(`register-${first}`)?.focus()
      return
    }
    setBusy(true)
    const res = await postJson("/api/physio/auth/signup", { email, password, acceptPrivacy: true })
    setBusy(false)
    if (res.ok) {
      setDoneFor(email.trim().toLowerCase())
      setPassword("")
    } else setError(res.message)
  }

  if (doneFor) {
    return (
      <div className="flex flex-col items-start gap-5" role="status">
        <CheckCircle2 className="h-6 w-6 text-fg" aria-hidden="true" />
        <div className="flex flex-col gap-2">
          <h2 ref={doneRef} tabIndex={-1} className="text-xl tracking-tight outline-none">
            {c.register.done.title}
          </h2>
          <p className="measure leading-relaxed text-fg-muted">{c.register.done.text(doneFor)}</p>
          <p className="text-sm text-fg-muted">{c.register.done.spam}</p>
        </div>
        <Link href={physioPath("/anmelden")} className="control inline-flex min-h-11 items-center px-5 py-2.5 text-sm">
          {c.register.done.toLogin}
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <TextField id="register-email" label={c.fields.email} type="email" value={email} onChange={setEmail} autoComplete="email" error={errors.email} />
      <PasswordField
        id="register-password"
        label={c.fields.password}
        value={password}
        onChange={setPassword}
        autoComplete="new-password"
        hint={c.fields.passwordHint}
        error={errors.password}
      />
      <div className="flex flex-col gap-1">
        <label htmlFor="register-privacy" className="flex min-h-11 cursor-pointer items-start gap-3 text-sm leading-relaxed text-fg-muted">
          <input
            id="register-privacy"
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            aria-invalid={Boolean(errors.privacy)}
            aria-describedby="register-privacy-error"
            className="mt-1 h-4 w-4 shrink-0 accent-white"
          />
          <span>
            {c.register.privacyBefore}
            <Link href={physioPath("/datenschutz")} className={linkCls} target="_blank" rel="noopener">
              {c.register.privacyLink}
            </Link>
            {c.register.privacyAfter}
          </span>
        </label>
        <FieldError id="register-privacy-error" message={errors.privacy} />
      </div>
      <FormAlert message={error} />
      <Submit busy={busy} idle={c.register.submit} working={c.register.submitting} />
      <p className="py-2 text-sm text-fg-muted">
        {c.register.haveAccount}{" "}
        <Link href={physioPath("/anmelden")} className={linkCls}>
          {c.register.toLogin}
        </Link>
      </p>
    </form>
  )
}

export function ForgotForm() {
  const [email, setEmail] = useState("")
  const [errors, setErrors] = useState<{ email?: string }>({})
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const doneRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (done) doneRef.current?.focus()
  }, [done])

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (busy) return
    if (!EMAIL_RE.test(email.trim())) {
      setErrors({ email: c.fields.emailInvalid })
      document.getElementById("forgot-email")?.focus()
      return
    }
    setErrors({})
    setError(null)
    setBusy(true)
    const res = await postJson("/api/physio/auth/forgot-password", { email })
    setBusy(false)
    if (res.ok) setDone(true)
    else setError(res.message)
  }

  if (done) {
    return (
      <div className="flex flex-col items-start gap-5" role="status">
        <CheckCircle2 className="h-6 w-6 text-fg" aria-hidden="true" />
        <div className="flex flex-col gap-2">
          <h2 ref={doneRef} tabIndex={-1} className="text-xl tracking-tight outline-none">
            {c.forgot.done.title}
          </h2>
          <p className="measure leading-relaxed text-fg-muted">{c.forgot.done.text}</p>
        </div>
        <Link href={physioPath("/anmelden")} className="control inline-flex min-h-11 items-center px-5 py-2.5 text-sm">
          {c.forgot.back}
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <TextField id="forgot-email" label={c.fields.email} type="email" value={email} onChange={setEmail} autoComplete="email" error={errors.email} />
      <FormAlert message={error} />
      <Submit busy={busy} idle={c.forgot.submit} working={c.forgot.submitting} />
      <Link href={physioPath("/anmelden")} className={linkCls + " w-fit py-2 text-sm text-fg-muted"}>
        {c.forgot.back}
      </Link>
    </form>
  )
}

export function ResetForm() {
  const token = useSearchParams().get("token") ?? ""
  const [password, setPassword] = useState("")
  const [repeat, setRepeat] = useState("")
  const [errors, setErrors] = useState<{ password?: string; repeat?: string }>({})
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!token) {
    return (
      <div className="flex flex-col items-start gap-4">
        <h2 className="text-xl tracking-tight">{c.reset.missingToken.title}</h2>
        <p className="measure leading-relaxed text-fg-muted">{c.reset.missingToken.text}</p>
        <Link href={physioPath("/passwort-vergessen")} className="control control-primary inline-flex min-h-11 items-center px-5 py-2.5 text-sm">
          {c.reset.missingToken.action}
        </Link>
      </div>
    )
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (busy) return
    const found = {
      password: password.length >= MIN ? undefined : c.fields.tooShort,
      repeat: password === repeat ? undefined : c.fields.mismatch,
    }
    setErrors(found)
    setError(null)
    if (found.password || found.repeat) {
      document.getElementById(found.password ? "reset-password" : "reset-repeat")?.focus()
      return
    }
    setBusy(true)
    const res = await postJson("/api/physio/auth/reset-password", { token, password })
    if (res.ok) return go("/konto")
    setError(res.message)
    setBusy(false)
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <PasswordField id="reset-password" label={c.fields.newPassword} value={password} onChange={setPassword} autoComplete="new-password" hint={c.fields.passwordHint} error={errors.password} />
      <PasswordField id="reset-repeat" label={c.fields.passwordRepeat} value={repeat} onChange={setRepeat} autoComplete="new-password" error={errors.repeat} />
      <FormAlert message={error} />
      <Submit busy={busy} idle={c.reset.submit} working={c.reset.submitting} />
    </form>
  )
}

export function VerifyEmail() {
  const token = useSearchParams().get("token") ?? ""
  const [state, setState] = useState<"working" | "ok" | "fail">(token ? "working" : "fail")
  const started = useRef(false)
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (!token || started.current) return
    started.current = true
    postJson("/api/physio/auth/verify-email", { token }).then((res) => setState(res.ok ? "ok" : "fail"))
  }, [token])

  useEffect(() => {
    if (state !== "working") headingRef.current?.focus()
  }, [state])

  if (state === "working") {
    return (
      <p role="status" className="flex items-center gap-2 text-fg-muted">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        {c.verify.working}
      </p>
    )
  }

  if (state === "ok") {
    return (
      <div className="flex flex-col items-start gap-5" role="status">
        <CheckCircle2 className="h-6 w-6 text-fg" aria-hidden="true" />
        <div className="flex flex-col gap-2">
          <h2 ref={headingRef} tabIndex={-1} className="text-xl tracking-tight outline-none">
            {c.verify.okTitle}
          </h2>
          <p className="measure leading-relaxed text-fg-muted">{c.verify.okText}</p>
        </div>
        <Link href={physioPath("/konto")} className="control control-primary inline-flex min-h-11 items-center px-5 py-2.5 text-sm">
          {c.verify.okAction}
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-start gap-5" role="alert">
      <div className="flex flex-col gap-2">
        <h2 ref={headingRef} tabIndex={-1} className="text-xl tracking-tight outline-none">
          {c.verify.failTitle}
        </h2>
        <p className="measure leading-relaxed text-fg-muted">{token ? c.verify.failText : c.verify.missingToken}</p>
      </div>
      <Link
        href={`${physioPath("/anmelden")}?next=${encodeURIComponent("/konto")}`}
        className="control inline-flex min-h-11 items-center px-5 py-2.5 text-sm"
      >
        {c.verify.failAction}
      </Link>
    </div>
  )
}
