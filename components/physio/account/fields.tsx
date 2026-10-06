"use client"

import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { accountCopy } from "@/lib/physio/copy/account"

const f = accountCopy.fields

/** Error row with reserved height, so the form does not jump while typing. */
export function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <div
      id={id}
      role={message ? "alert" : undefined}
      className={
        "flex min-h-[1.125rem] items-start gap-1.5 text-xs text-destructive " +
        (message ? "opacity-100" : "opacity-0")
      }
    >
      {message && (
        <>
          <AlertCircle className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {message}
        </>
      )}
    </div>
  )
}

/** Form-level error or notice. */
export function FormAlert({ message, tone = "error" }: { message: string | null; tone?: "error" | "ok" }) {
  if (!message) return null
  return (
    <p
      role={tone === "error" ? "alert" : "status"}
      className={
        "flex items-start gap-2 text-sm leading-relaxed " + (tone === "error" ? "text-destructive" : "text-fg-muted")
      }
    >
      {tone === "error" && <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
      {message}
    </p>
  )
}

type TextFieldProps = {
  id: string
  label: string
  value: string
  onChange: (value: string) => void
  type?: "text" | "email" | "password"
  autoComplete?: string
  hint?: string
  error?: string
  maxLength?: number
}

export function TextField({ id, label, value, onChange, type = "text", autoComplete, hint, error, maxLength }: TextFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="annotate text-fg-muted">
        {label}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-fg-muted">
          {hint}
        </p>
      )}
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        maxLength={maxLength}
        spellCheck={false}
        autoCapitalize="none"
        aria-invalid={Boolean(error)}
        aria-describedby={`${hint ? `${id}-hint ` : ""}${id}-error`}
        className="field min-h-11 px-4 py-2.5 text-base md:text-sm"
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  )
}

/** Password input with a show/hide toggle (also helps on phones, where typos are common). */
export function PasswordField({
  id,
  label,
  value,
  onChange,
  autoComplete,
  hint,
  error,
}: Omit<TextFieldProps, "type" | "maxLength">) {
  const [shown, setShown] = useState(false)
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="annotate text-fg-muted">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShown((s) => !s)}
          aria-pressed={shown}
          className="annotate -my-2 min-h-11 px-1 text-fg-muted underline-offset-4 hover:text-fg hover:underline"
        >
          {shown ? f.hidePassword : f.showPassword}
        </button>
      </div>
      {hint && (
        <p id={`${id}-hint`} className="text-sm text-fg-muted">
          {hint}
        </p>
      )}
      <input
        id={id}
        name={id}
        type={shown ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        maxLength={200}
        aria-invalid={Boolean(error)}
        aria-describedby={`${hint ? `${id}-hint ` : ""}${id}-error`}
        className="field min-h-11 px-4 py-2.5 text-base md:text-sm"
      />
      <FieldError id={`${id}-error`} message={error} />
    </div>
  )
}
