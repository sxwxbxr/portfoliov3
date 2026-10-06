"use client"

import { useRef, useState } from "react"
import Link from "next/link"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { physioPath } from "@/lib/physio/urls"
import {
  SUGGESTION_CATEGORIES,
  SUGGESTION_LIMITS as L,
  suggestionsCopy,
} from "@/lib/physio/copy/suggestions"

const c = suggestionsCopy
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Values = { title: string; description: string; category: string; email: string }
type Errors = Partial<Record<keyof Values, string>>

const EMPTY: Values = { title: "", description: "", category: "", email: "" }

function validate(v: Values): Errors {
  const errors: Errors = {}
  const title = v.title.trim()
  const description = v.description.trim()
  const email = v.email.trim()
  if (!title) errors.title = c.errors.titleRequired
  else if (title.length < L.titleMin) errors.title = c.errors.titleShort
  if (!description) errors.description = c.errors.descriptionRequired
  else if (description.length < L.descriptionMin) errors.description = c.errors.descriptionShort
  if (!v.category) errors.category = c.errors.categoryRequired
  if (email && !EMAIL_RE.test(email)) errors.email = c.errors.emailInvalid
  return errors
}

/** Error row with reserved height, so the form does not jump while typing. */
function FieldError({ id, message }: { id: string; message?: string }) {
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

export function SuggestionForm() {
  const [values, setValues] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [honeypot, setHoneypot] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const successRef = useRef<HTMLHeadingElement>(null)

  const set = (field: keyof Values, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }))
    if (submitError) setSubmitError(null)
  }

  async function onSubmit(ev: React.FormEvent) {
    ev.preventDefault()
    if (submitting) return
    const found = validate(values)
    setErrors(found)
    if (Object.keys(found).length > 0) {
      const first = (["title", "description", "category", "email"] as const).find((k) => found[k])
      if (first) document.getElementById(`sg-${first}`)?.focus()
      return
    }

    setSubmitting(true)
    setSubmitError(null)
    try {
      const res = await fetch("/api/physio/suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: values.title.trim(),
          description: values.description.trim(),
          category: values.category,
          email: values.email.trim(),
          website: honeypot,
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string
          fields?: Errors
        }
        if (res.status === 400 && body.fields) setErrors(body.fields)
        setSubmitError(body.error || c.errors.generic)
        return
      }
      setValues(EMPTY)
      setDone(true)
      requestAnimationFrame(() => successRef.current?.focus())
    } catch {
      setSubmitError(c.errors.network)
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="flex flex-col items-start gap-5" role="status">
        <CheckCircle2 className="h-6 w-6 text-fg" aria-hidden="true" />
        <div className="flex flex-col gap-2">
          <h3 ref={successRef} tabIndex={-1} className="text-xl tracking-tight outline-none">
            {c.success.heading}
          </h3>
          <p className="measure leading-relaxed text-fg-muted">{c.success.text}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => {
              setDone(false)
              setHoneypot("")
            }}
            className="control control-primary min-h-11 px-5 py-2.5 text-sm"
          >
            {c.success.again}
          </button>
          <Link
            href={physioPath("/")}
            className="control inline-flex min-h-11 items-center px-5 py-2.5 text-sm"
          >
            {c.success.back}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} noValidate className="flex flex-col gap-5">
      <div className="flex flex-col gap-2">
        <label htmlFor="sg-title" className="annotate">
          {c.form.title.label}
        </label>
        <input
          id="sg-title"
          name="title"
          type="text"
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          placeholder={c.form.title.placeholder}
          maxLength={L.titleMax}
          autoComplete="off"
          aria-invalid={Boolean(errors.title)}
          aria-describedby="sg-title-error"
          className="field px-4 py-2.5 text-base md:text-sm"
        />
        <FieldError id="sg-title-error" message={errors.title} />
      </div>

      <div className="flex flex-col gap-2">
        <label htmlFor="sg-description" className="annotate">
          {c.form.description.label}
        </label>
        <p id="sg-description-hint" className="text-sm text-fg-muted">
          {c.form.description.hint}
        </p>
        <textarea
          id="sg-description"
          name="description"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          placeholder={c.form.description.placeholder}
          rows={6}
          maxLength={L.descriptionMax}
          aria-invalid={Boolean(errors.description)}
          aria-describedby="sg-description-hint sg-description-error"
          className="field resize-y px-4 py-3 text-base leading-relaxed md:text-sm"
        />
        <div className="flex items-start justify-between gap-4">
          <FieldError id="sg-description-error" message={errors.description} />
          <span className="annotate shrink-0 tabular">
            {c.form.counter(values.description.length, L.descriptionMax)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <label htmlFor="sg-category" className="annotate">
            {c.form.category.label}
          </label>
          <Select value={values.category} onValueChange={(v) => set("category", v)}>
            <SelectTrigger
              id="sg-category"
              aria-invalid={Boolean(errors.category)}
              aria-describedby="sg-category-error"
            >
              <SelectValue placeholder={c.form.category.placeholder} />
            </SelectTrigger>
            <SelectContent>
              {SUGGESTION_CATEGORIES.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FieldError id="sg-category-error" message={errors.category} />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="sg-email" className="annotate">
            {c.form.email.label}
          </label>
          <input
            id="sg-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder={c.form.email.placeholder}
            maxLength={L.emailMax}
            aria-invalid={Boolean(errors.email)}
            aria-describedby="sg-email-hint sg-email-error"
            className="field px-4 py-2.5 text-base md:text-sm"
          />
          <p id="sg-email-hint" className="text-xs text-fg-muted">
            {c.form.email.hint}
          </p>
          <FieldError id="sg-email-error" message={errors.email} />
        </div>
      </div>

      {/* Honeypot. Off screen and out of the tab order, only bots fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          {c.form.honeypotLabel}
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </label>
      </div>

      {submitError && (
        <div role="alert" className="well-sm flex items-start gap-2 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          {submitError}
        </div>
      )}

      <p className="text-xs leading-relaxed text-fg-muted">
        {c.form.privacy.lead}{" "}
        <Link href={physioPath("/datenschutz")} className="link-underline text-fg">
          {c.form.privacy.link}
        </Link>
        {c.form.privacy.tail}
      </p>

      <button
        type="submit"
        disabled={submitting}
        aria-busy={submitting}
        className="control control-primary inline-flex min-h-11 items-center justify-center gap-2 self-start px-5 py-2.5 text-sm"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
        {submitting ? c.form.submitting : c.form.submit}
      </button>
    </form>
  )
}
