"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"
import { accountCopy } from "@/lib/physio/copy/account"
import { physioPath } from "@/lib/physio/urls"
import { postJson } from "./api"
import { FormAlert, PasswordField } from "./fields"

const c = accountCopy.account

function Busy({ busy }: { busy: boolean }) {
  return busy ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null
}

export function ResendVerification() {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ text: string; tone: "ok" | "error" } | null>(null)

  async function onClick() {
    setBusy(true)
    setMessage(null)
    const res = await postJson("/api/physio/auth/resend-verification")
    setBusy(false)
    setMessage(res.ok ? { text: c.email.resent, tone: "ok" } : { text: res.message, tone: "error" })
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <button type="button" onClick={onClick} disabled={busy} className="control inline-flex min-h-11 items-center gap-2 px-5 py-2.5 text-sm">
        <Busy busy={busy} />
        {busy ? c.email.resending : c.email.resend}
      </button>
      <FormAlert message={message?.text ?? null} tone={message?.tone} />
    </div>
  )
}

/** Opens the Polar customer portal (cancel, payment method, invoices). */
export function ManageSubscription({ primary = false }: { primary?: boolean }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onClick() {
    setBusy(true)
    setError(null)
    const res = await postJson<{ url: string }>("/api/physio/portal")
    if (res.ok && res.data.url) return window.location.assign(res.data.url)
    setError(res.ok ? accountCopy.errors.generic : res.message)
    setBusy(false)
  }

  return (
    <div className="flex flex-col items-start gap-3">
      <button
        type="button"
        onClick={onClick}
        disabled={busy}
        className={"control inline-flex min-h-11 items-center gap-2 px-5 py-2.5 text-sm " + (primary ? "control-primary" : "")}
      >
        <Busy busy={busy} />
        {busy ? c.subscription.managing : c.subscription.manage}
      </button>
      <FormAlert message={error} />
    </div>
  )
}

export function ChangePasswordForm() {
  const [current, setCurrent] = useState("")
  const [next, setNext] = useState("")
  const [errors, setErrors] = useState<{ current?: string; next?: string }>({})
  const [message, setMessage] = useState<{ text: string; tone: "ok" | "error" } | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (busy) return
    const found = {
      current: current ? undefined : accountCopy.fields.required,
      next: next.length >= 10 ? undefined : accountCopy.fields.tooShort,
    }
    setErrors(found)
    setMessage(null)
    if (found.current || found.next) {
      document.getElementById(found.current ? "pw-current" : "pw-next")?.focus()
      return
    }
    setBusy(true)
    const res = await postJson("/api/physio/auth/change-password", { currentPassword: current, newPassword: next })
    setBusy(false)
    if (res.ok) {
      setCurrent("")
      setNext("")
      setMessage({ text: c.password.done, tone: "ok" })
    } else setMessage({ text: res.message, tone: "error" })
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex max-w-md flex-col gap-5">
      <PasswordField id="pw-current" label={accountCopy.fields.currentPassword} value={current} onChange={setCurrent} autoComplete="current-password" error={errors.current} />
      <PasswordField id="pw-next" label={accountCopy.fields.newPassword} value={next} onChange={setNext} autoComplete="new-password" hint={accountCopy.fields.passwordHint} error={errors.next} />
      <FormAlert message={message?.text ?? null} tone={message?.tone} />
      <button type="submit" disabled={busy} className="control control-primary inline-flex min-h-11 w-fit items-center gap-2 px-6 py-2.5 text-sm">
        <Busy busy={busy} />
        {busy ? c.password.submitting : c.password.submit}
      </button>
    </form>
  )
}

export function LogoutButton() {
  const [busy, setBusy] = useState(false)

  async function onClick() {
    setBusy(true)
    await postJson("/api/physio/auth/logout")
    window.location.assign(physioPath("/"))
  }

  return (
    <button type="button" onClick={onClick} disabled={busy} className="control inline-flex min-h-11 items-center gap-2 px-5 py-2.5 text-sm">
      <Busy busy={busy} />
      {busy ? c.session.submitting : c.session.submit}
    </button>
  )
}

/** `blocked`: a subscription is running and not yet canceled, so deleting would leave it billing. */
export function DeleteAccount({ blocked }: { blocked: boolean }) {
  const [open, setOpen] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (blocked) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="measure text-sm leading-relaxed text-fg-muted">{c.delete.activeSubscription}</p>
        <ManageSubscription />
      </div>
    )
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="control inline-flex min-h-11 items-center px-5 py-2.5 text-sm">
        {c.delete.open}
      </button>
    )
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (busy) return
    if (!password) {
      setError(accountCopy.fields.required)
      document.getElementById("delete-password")?.focus()
      return
    }
    setBusy(true)
    setError(null)
    const res = await postJson("/api/physio/auth/delete-account", { password })
    if (res.ok) return window.location.assign(physioPath("/"))
    setError(res.message)
    setBusy(false)
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex max-w-md flex-col gap-5">
      <PasswordField id="delete-password" label={c.delete.confirmLabel} value={password} onChange={setPassword} autoComplete="current-password" />
      <FormAlert message={error} />
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={busy} className="control inline-flex min-h-11 items-center gap-2 border-destructive px-5 py-2.5 text-sm text-destructive">
          <Busy busy={busy} />
          {busy ? c.delete.submitting : c.delete.submit}
        </button>
        <button
          type="button"
          onClick={() => {
            setOpen(false)
            setPassword("")
            setError(null)
          }}
          className="control control-ghost inline-flex min-h-11 items-center px-5 py-2.5 text-sm"
        >
          {c.delete.cancel}
        </button>
      </div>
    </form>
  )
}
