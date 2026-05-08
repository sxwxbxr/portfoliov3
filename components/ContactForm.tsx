"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Send, Loader2 } from "lucide-react"
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

export function ContactForm() {
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

  const closeSuccessModal = useCallback(() => setShowSuccessModal(false), [])

  // Auto-focus close button and handle Escape key when success modal is open
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
      newErrors.name = "Name is required"
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters"
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    if (!formData.projectType) {
      newErrors.projectType = "Please select a project type"
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required"
    } else if (formData.message.trim().length < 10) {
      newErrors.message = "Message must be at least 10 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

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
        const message = body.error || "Failed to send message. Please try again."
        throw new Error(message)
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
      const message = error instanceof Error ? error.message : "Something went wrong. Please try again or email me directly at info@sweber.dev."
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
    if (submitError) {
      setSubmitError(null)
    }
  }

  return (
    <div className="relative">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm">Name *</Label>
            <Input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Your full name"
              className={`bg-transparent border-border ${errors.name ? "border-red-500 focus:ring-red-500" : ""}`}
            />
            {errors.name && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.name}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              placeholder="your.email@example.com"
              className={`bg-transparent border-border ${errors.email ? "border-red-500 focus:ring-red-500" : ""}`}
            />
            {errors.email && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.email}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="company" className="text-sm">Company</Label>
          <Input
            id="company"
            type="text"
            value={formData.company}
            onChange={(e) => handleInputChange("company", e.target.value)}
            placeholder="Your company name (optional)"
            className="bg-transparent border-border"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="projectType" className="text-sm">Project Type *</Label>
            <Select value={formData.projectType} onValueChange={(value) => handleInputChange("projectType", value)}>
              <SelectTrigger className={`bg-transparent border-border ${errors.projectType ? "border-red-500" : ""}`}>
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="automation">Process Automation</SelectItem>
                <SelectItem value="web-development">Web Development</SelectItem>
                <SelectItem value="data-integration">Data Integration</SelectItem>
                <SelectItem value="consulting">Technical Consulting</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.projectType && (
              <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.projectType}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="budget" className="text-sm">Budget Range</Label>
            <Select value={formData.budget} onValueChange={(value) => handleInputChange("budget", value)}>
              <SelectTrigger className="bg-transparent border-border">
                <SelectValue placeholder="Select budget range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="under-10k">&lt; CHF 10,000</SelectItem>
                <SelectItem value="10k-25k">CHF 10,000 - 25,000</SelectItem>
                <SelectItem value="25k-50k">CHF 25,000 - 50,000</SelectItem>
                <SelectItem value="50k-plus">CHF 50,000+</SelectItem>
                <SelectItem value="discuss">Let&apos;s discuss</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeline" className="text-sm">Timeline</Label>
          <Select value={formData.timeline} onValueChange={(value) => handleInputChange("timeline", value)}>
            <SelectTrigger className="bg-transparent border-border">
              <SelectValue placeholder="When do you need this completed?" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="asap">ASAP</SelectItem>
              <SelectItem value="1-month">Within 1 month</SelectItem>
              <SelectItem value="3-months">Within 3 months</SelectItem>
              <SelectItem value="6-months">Within 6 months</SelectItem>
              <SelectItem value="flexible">Timeline is flexible</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="message" className="text-sm">Message *</Label>
          <Textarea
            id="message"
            value={formData.message}
            onChange={(e) => handleInputChange("message", e.target.value)}
            placeholder="Tell me about your project, goals, and any specific requirements..."
            rows={5}
            className={`bg-transparent border-border ${errors.message ? "border-red-500 focus:ring-red-500" : ""}`}
          />
          {errors.message && (
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <AlertCircle className="w-3.5 h-3.5" />
              {errors.message}
            </div>
          )}
          <div className="text-xs text-muted-foreground">{formData.message.length}/5000 characters</div>
        </div>

        {submitError && (
          <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 p-3 border border-red-200 dark:border-red-900/50">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            {submitError}
          </div>
        )}

        <p className="text-xs text-muted-foreground leading-relaxed">
          By submitting this form you agree to your data being processed for the
          purpose of responding to your enquiry. See the{" "}
          <a href="/privacy" className="link-underline text-foreground">
            privacy notice
          </a>{" "}
          for details.
        </p>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-8"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </>
          )}
        </Button>
      </form>

      {showSuccessModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur"
          onClick={closeSuccessModal}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="success-heading"
            className="bg-card border border-border max-w-md w-full mx-4 p-8 text-center space-y-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-center">
              <CheckmarkAnimation />
            </div>
            <div className="space-y-2">
              <h3 id="success-heading" className="text-2xl font-display font-bold">Message Sent</h3>
              <p className="text-muted-foreground">
                Thank you for reaching out. I&apos;ll get back to you within 24 hours.
              </p>
            </div>
            <Button ref={closeButtonRef} className="w-full" onClick={closeSuccessModal}>
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
