"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AlertCircle, Send, Loader2, Sparkles } from "lucide-react"
import { CheckmarkAnimation } from "@/components/CheckmarkAnimation"
import { copy } from "@/lib/copy"

const form = copy.contact.form
const MAX_MESSAGE_LENGTH = 5000

interface FormData {
  name: string
  email: string
  company: string
  projectType: string
  budget: string
  timeline: string
  message: string
}

interface FormErrors {
  [key: string]: string
}

/**
 * Error slot with a reserved height.
 *
 * The message appears and disappears as the user types, and this is the only
 * conversion funnel on the site — animating height here would shift the form
 * under the pointer on every keystroke. The row is always present and only
 * its opacity changes.
 */
function FieldError({ id, message }: { id: string; message?: string }) {
  return (
    <div
      id={id}
      role={message ? "alert" : undefined}
      className={
        "flex min-h-[1.125rem] items-center gap-1.5 text-xs text-destructive transition-opacity duration-150 " +
        (message ? "opacity-100" : "opacity-0")
      }
    >
      {message && (
        <>
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {message}
        </>
      )}
    </div>
  )
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="annotate">
      {children}
    </label>
  )
}

export function ContactForm({
  privacyAvailable = false,
}: {
  /** Only link the privacy notice when the page actually exists. */
  privacyAvailable?: boolean
}) {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    company: "",
    projectType: "",
    budget: "",
    timeline: "",
    message: "",
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // AI match analysis — purely informational. It runs on-blur of the message
  // field and is never sent with the form submission.
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [analysisLoading, setAnalysisLoading] = useState(false)
  const analyzedMessageRef = useRef<string>("")

  const closeSuccessModal = useCallback(() => setShowSuccessModal(false), [])

  useEffect(() => {
    if (!showSuccessModal) return
    closeButtonRef.current?.focus()
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSuccessModal()
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [showSuccessModal, closeSuccessModal])

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = form.errors.nameRequired
    } else if (formData.name.trim().length < 2) {
      newErrors.name = form.errors.nameShort
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = form.errors.emailRequired
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = form.errors.emailInvalid
    }

    if (!formData.projectType) {
      newErrors.projectType = form.errors.projectTypeRequired
    }

    if (!formData.message.trim()) {
      newErrors.message = form.errors.messageRequired
    } else if (formData.message.trim().length < 10) {
      newErrors.message = form.errors.messageShort
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const body = await response.json().catch(() => ({}))
        throw new Error(body.error || form.errors.sendFailed)
      }

      setFormData({
        name: "",
        email: "",
        company: "",
        projectType: "",
        budget: "",
        timeline: "",
        message: "",
      })
      setShowSuccessModal(true)
    } catch (error) {
      console.error("Form submission error:", error)
      setSubmitError(
        error instanceof Error ? error.message : form.errors.generic
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }))
    if (submitError) setSubmitError(null)
  }

  const handleMessageChange = (value: string) => {
    handleInputChange("message", value)
    if (value.trim() !== analyzedMessageRef.current) setAnalysis(null)
  }

  const analyzeMessage = async () => {
    const message = formData.message.trim()
    if (message.length < 30) return
    if (message === analyzedMessageRef.current || analysisLoading) return

    analyzedMessageRef.current = message
    setAnalysisLoading(true)
    try {
      const response = await fetch("/api/contact-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          projectType: formData.projectType || null,
          company: formData.company || null,
        }),
      })
      if (!response.ok) throw new Error("analysis failed")
      const data = await response.json()
      setAnalysis(
        typeof data.analysis === "string" && data.analysis.trim()
          ? data.analysis.trim()
          : null
      )
    } catch {
      // Silent fail — the form stays fully functional without the analysis.
      setAnalysis(null)
    } finally {
      setAnalysisLoading(false)
    }
  }

  // SelectTrigger carries `.field` and SelectContent carries `.cast` in
  // components/ui/select.tsx, so the triggers need no per-call restyling and
  // stay pixel-identical to the plain <input> fields beside them.

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="name">{form.name}</FieldLabel>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder={form.namePlaceholder}
              aria-invalid={Boolean(errors.name)}
              aria-describedby="name-error"
              className="field px-4 py-2.5 text-sm"
            />
            <FieldError id="name-error" message={errors.name} />
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="email">{form.email}</FieldLabel>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder={form.emailPlaceholder}
              aria-invalid={Boolean(errors.email)}
              aria-describedby="email-error"
              className="field px-4 py-2.5 text-sm"
            />
            <FieldError id="email-error" message={errors.email} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="company">{form.company}</FieldLabel>
          <input
            id="company"
            type="text"
            value={formData.company}
            onChange={(e) => handleInputChange("company", e.target.value)}
            placeholder={form.companyPlaceholder}
            className="field px-4 py-2.5 text-sm"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="projectType">{form.projectType}</FieldLabel>
            <Select
              value={formData.projectType}
              onValueChange={(value) => handleInputChange("projectType", value)}
            >
              <SelectTrigger
                id="projectType"
                aria-invalid={Boolean(errors.projectType)}
                aria-describedby="projectType-error"
              >
                <SelectValue placeholder={form.projectTypePlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {form.projectTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError id="projectType-error" message={errors.projectType} />
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="budget">{form.budget}</FieldLabel>
            <Select
              value={formData.budget}
              onValueChange={(value) => handleInputChange("budget", value)}
            >
              <SelectTrigger id="budget">
                <SelectValue placeholder={form.budgetPlaceholder} />
              </SelectTrigger>
              <SelectContent>
                {form.budgetOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="min-h-[1.125rem]" aria-hidden="true" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="timeline">{form.timeline}</FieldLabel>
          <Select
            value={formData.timeline}
            onValueChange={(value) => handleInputChange("timeline", value)}
          >
            <SelectTrigger id="timeline">
              <SelectValue placeholder={form.timelinePlaceholder} />
            </SelectTrigger>
            <SelectContent>
              {form.timelineOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="message">{form.message}</FieldLabel>
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) => handleMessageChange(e.target.value)}
            onBlur={analyzeMessage}
            placeholder={form.messagePlaceholder}
            rows={5}
            maxLength={MAX_MESSAGE_LENGTH}
            aria-invalid={Boolean(errors.message)}
            aria-describedby="message-error"
            className="field resize-y px-4 py-3 text-sm leading-relaxed"
          />
          <div className="flex items-start justify-between gap-4">
            <FieldError id="message-error" message={errors.message} />
            <span className="annotate shrink-0 tabular">
              {form.messageCount(formData.message.length, MAX_MESSAGE_LENGTH)}
            </span>
          </div>

          {(analysisLoading || analysis) && (
            <div className="well-sm mt-1 flex flex-col gap-2 p-4">
              <span className="annotate inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-signal" aria-hidden="true" />
                {form.analysisTitle}
              </span>
              {analysisLoading ? (
                // Seats rising out of the tray. ui/skeleton's `bg-accent
                // animate-pulse` is a utility-layer fill with no polarity, and
                // a sunken bar inside a sunken tray is invisible — both wells
                // share one background token.
                <div className="flex flex-col gap-2" role="status" aria-live="polite">
                  <span className="sr-only">{form.analysisLoading}</span>
                  <div className="cast-sm h-3 w-full" aria-hidden="true" />
                  <div className="cast-sm h-3 w-[92%]" aria-hidden="true" />
                  <div className="cast-sm h-3 w-3/4" aria-hidden="true" />
                </div>
              ) : (
                <p className="text-sm leading-relaxed" aria-live="polite">
                  {analysis}
                </p>
              )}
            </div>
          )}
        </div>

        {submitError && (
          <div
            role="alert"
            className="well-sm flex items-center gap-2 p-3 text-sm text-destructive"
          >
            <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
            {submitError}
          </div>
        )}

        <p className="text-xs leading-relaxed text-fg-muted">
          {form.privacyLead}
          {privacyAvailable && (
            <>
              {" "}
              {form.privacyTail}{" "}
              <a href="/privacy" className="link-underline text-signal">
                {form.privacyLink}
              </a>
              .
            </>
          )}
        </p>

        <button
          type="submit"
          disabled={isSubmitting}
          className="control control-primary inline-flex items-center justify-center gap-2 self-start px-5 py-3 text-sm font-medium"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              {form.submitting}
            </>
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden="true" />
              {form.submit}
            </>
          )}
        </button>
      </form>

      {showSuccessModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ground/85 p-4"
          onClick={closeSuccessModal}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="success-heading"
            className="cast rim flex w-full max-w-md flex-col items-center gap-6 p-8 text-center"
            onClick={(event) => event.stopPropagation()}
          >
            <CheckmarkAnimation />
            <div className="flex flex-col gap-2">
              <h3 id="success-heading" className="font-display text-2xl font-bold">
                {form.successTitle}
              </h3>
              <p className="text-sm text-fg-muted">{form.successBody}</p>
            </div>
            <button
              ref={closeButtonRef}
              onClick={closeSuccessModal}
              className="control w-full px-5 py-3 text-sm font-medium"
            >
              {copy.common.close}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
