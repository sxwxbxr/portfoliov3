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
      newErrors.name = "Name ist erforderlich"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name muss mindestens 2 Zeichen haben"
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = "E-Mail ist erforderlich"
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Bitte eine gültige E-Mail-Adresse eingeben"
    }

    if (!formData.projectType) {
      newErrors.projectType = "Bitte einen Projekttyp wählen"
    }

    if (!formData.message.trim()) {
      newErrors.message = "Nachricht ist erforderlich"
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Nachricht muss mindestens 10 Zeichen haben"
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
        throw new Error(body.error || "Nachricht konnte nicht gesendet werden.")
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
        error instanceof Error
          ? error.message
          : "Etwas ist schiefgelaufen. Schreib mir direkt an info@sweber.dev."
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
            <FieldLabel htmlFor="name">Name *</FieldLabel>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Dein vollständiger Name"
              aria-invalid={Boolean(errors.name)}
              aria-describedby="name-error"
              className="field px-4 py-2.5 text-sm"
            />
            <FieldError id="name-error" message={errors.name} />
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="email">E-Mail *</FieldLabel>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="deine.mail@beispiel.ch"
              aria-invalid={Boolean(errors.email)}
              aria-describedby="email-error"
              className="field px-4 py-2.5 text-sm"
            />
            <FieldError id="email-error" message={errors.email} />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="company">Firma</FieldLabel>
          <input
            id="company"
            type="text"
            value={formData.company}
            onChange={(e) => handleInputChange("company", e.target.value)}
            placeholder="Optional"
            className="field px-4 py-2.5 text-sm"
          />
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="projectType">Projekttyp *</FieldLabel>
            <Select
              value={formData.projectType}
              onValueChange={(value) => handleInputChange("projectType", value)}
            >
              <SelectTrigger
                id="projectType"
                aria-invalid={Boolean(errors.projectType)}
                aria-describedby="projectType-error"
              >
                <SelectValue placeholder="Projekttyp wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="automation">Prozessautomatisierung</SelectItem>
                <SelectItem value="web-development">Webentwicklung</SelectItem>
                <SelectItem value="data-integration">Datenintegration</SelectItem>
                <SelectItem value="consulting">Technische Beratung</SelectItem>
                <SelectItem value="other">Anderes</SelectItem>
              </SelectContent>
            </Select>
            <FieldError id="projectType-error" message={errors.projectType} />
          </div>

          <div className="flex flex-col gap-2">
            <FieldLabel htmlFor="budget">Budgetrahmen</FieldLabel>
            <Select
              value={formData.budget}
              onValueChange={(value) => handleInputChange("budget", value)}
            >
              <SelectTrigger id="budget">
                <SelectValue placeholder="Budget wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under-10k">&lt; CHF 10’000</SelectItem>
                <SelectItem value="10k-25k">CHF 10’000 – 25’000</SelectItem>
                <SelectItem value="25k-50k">CHF 25’000 – 50’000</SelectItem>
                <SelectItem value="50k-plus">CHF 50’000+</SelectItem>
                <SelectItem value="discuss">Besprechen wir</SelectItem>
              </SelectContent>
            </Select>
            <div className="min-h-[1.125rem]" aria-hidden="true" />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="timeline">Zeitrahmen</FieldLabel>
          <Select
            value={formData.timeline}
            onValueChange={(value) => handleInputChange("timeline", value)}
          >
            <SelectTrigger id="timeline">
              <SelectValue placeholder="Wann soll es fertig sein?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asap">So bald wie möglich</SelectItem>
              <SelectItem value="1-month">Innerhalb eines Monats</SelectItem>
              <SelectItem value="3-months">Innerhalb von 3 Monaten</SelectItem>
              <SelectItem value="6-months">Innerhalb von 6 Monaten</SelectItem>
              <SelectItem value="flexible">Flexibel</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel htmlFor="message">Nachricht *</FieldLabel>
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) => handleMessageChange(e.target.value)}
            onBlur={analyzeMessage}
            placeholder="Erzähl mir von deinem Projekt, den Zielen und konkreten Anforderungen…"
            rows={5}
            maxLength={5000}
            aria-invalid={Boolean(errors.message)}
            aria-describedby="message-error"
            className="field resize-y px-4 py-3 text-sm leading-relaxed"
          />
          <div className="flex items-start justify-between gap-4">
            <FieldError id="message-error" message={errors.message} />
            <span className="annotate shrink-0 tabular">
              {formData.message.length}/5000
            </span>
          </div>

          {(analysisLoading || analysis) && (
            <div className="well-sm mt-1 flex flex-col gap-2 p-4">
              <span className="annotate inline-flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-signal" aria-hidden="true" />
                AI Match Analysis
              </span>
              {analysisLoading ? (
                // Seats rising out of the tray. ui/skeleton's `bg-accent
                // animate-pulse` is a utility-layer fill with no polarity, and
                // a sunken bar inside a sunken tray is invisible — both wells
                // share one background token.
                <div className="flex flex-col gap-2" role="status" aria-live="polite">
                  <span className="sr-only">Analyse läuft …</span>
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
          Mit dem Absenden stimmst du zu, dass deine Daten zur Beantwortung deiner
          Anfrage verarbeitet werden.
          {privacyAvailable && (
            <>
              {" "}
              Details in der{" "}
              <a href="/privacy" className="link-underline text-signal">
                Datenschutzerklärung
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
              Wird gesendet…
            </>
          ) : (
            <>
              <Send className="h-4 w-4" aria-hidden="true" />
              Nachricht senden
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
                Nachricht gesendet
              </h3>
              <p className="text-sm text-fg-muted">
                Danke für deine Anfrage. Ich melde mich innerhalb von 24 Stunden.
              </p>
            </div>
            <button
              ref={closeButtonRef}
              onClick={closeSuccessModal}
              className="control w-full px-5 py-3 text-sm font-medium"
            >
              Schliessen
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
