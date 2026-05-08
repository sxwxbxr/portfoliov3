"use client"

import { useEffect, useState } from "react"
import FormField from "@/components/admin/FormField"
import CheckboxField from "@/components/admin/CheckboxField"

interface MetricInput {
  value: string
  label: string
}

interface SettingsForm {
  heroAvailable: boolean
  heroAvailabilityLabel: string
  heroMetrics: MetricInput[]
  contactEmail: string
  contactPhone: string
  contactLocation: string
  linkedinUrl: string
  githubUrl: string
  twitterUrl: string
  currentEmployer: string
  currentRole: string
  alumniOf: string
  knowsAbout: string
  privacyContent: string
}

const EMPTY_FORM: SettingsForm = {
  heroAvailable: true,
  heroAvailabilityLabel: "Available for projects",
  heroMetrics: [],
  contactEmail: "",
  contactPhone: "",
  contactLocation: "",
  linkedinUrl: "",
  githubUrl: "",
  twitterUrl: "",
  currentEmployer: "",
  currentRole: "",
  alumniOf: "",
  knowsAbout: "",
  privacyContent: "",
}

export default function SettingsPage() {
  const [form, setForm] = useState<SettingsForm>(EMPTY_FORM)
  const [fetching, setFetching] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        setForm({
          heroAvailable: Boolean(data.heroAvailable),
          heroAvailabilityLabel: data.heroAvailabilityLabel ?? "",
          heroMetrics: Array.isArray(data.heroMetrics)
            ? data.heroMetrics.map((m: MetricInput) => ({
                value: m.value ?? "",
                label: m.label ?? "",
              }))
            : [],
          contactEmail: data.contactEmail ?? "",
          contactPhone: data.contactPhone ?? "",
          contactLocation: data.contactLocation ?? "",
          linkedinUrl: data.linkedinUrl ?? "",
          githubUrl: data.githubUrl ?? "",
          twitterUrl: data.twitterUrl ?? "",
          currentEmployer: data.currentEmployer ?? "",
          currentRole: data.currentRole ?? "",
          alumniOf: data.alumniOf ?? "",
          knowsAbout: Array.isArray(data.knowsAbout)
            ? data.knowsAbout.join("\n")
            : "",
          privacyContent: data.privacyContent ?? "",
        })
        setFetching(false)
      })
      .catch(() => {
        setError("Failed to load settings")
        setFetching(false)
      })
  }, [])

  function update<K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateMetric(index: number, key: keyof MetricInput, value: string) {
    setForm((prev) => ({
      ...prev,
      heroMetrics: prev.heroMetrics.map((m, i) =>
        i === index ? { ...m, [key]: value } : m
      ),
    }))
  }

  function addMetric() {
    setForm((prev) => ({
      ...prev,
      heroMetrics: [...prev.heroMetrics, { value: "", label: "" }],
    }))
  }

  function removeMetric(index: number) {
    setForm((prev) => ({
      ...prev,
      heroMetrics: prev.heroMetrics.filter((_, i) => i !== index),
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSaving(true)
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          heroMetrics: form.heroMetrics.filter(
            (m) => m.value.trim() || m.label.trim()
          ),
          knowsAbout: form.knowsAbout
            .split("\n")
            .map((s) => s.trim())
            .filter(Boolean),
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || "Failed to save")
        return
      }
      setSavedAt(new Date())
    } catch {
      setError("Something went wrong")
    } finally {
      setSaving(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-12 text-muted-foreground text-sm">
        Loading...
      </div>
    )
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          Site Settings
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Hero, contact details, social links, and structured-data fields used
          across the public site.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Hero */}
        <section className="glass rounded-xl p-6 space-y-5">
          <h3 className="font-display text-lg font-semibold">Hero</h3>
          <CheckboxField
            label="Show 'Available for projects' indicator"
            name="heroAvailable"
            checked={form.heroAvailable}
            onChange={(e) => update("heroAvailable", e.target.checked)}
          />
          <FormField
            label="Availability label"
            name="heroAvailabilityLabel"
            value={form.heroAvailabilityLabel}
            onChange={(e) => update("heroAvailabilityLabel", e.target.value)}
            placeholder="Available for projects"
          />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Hero metrics</label>
              <button
                type="button"
                onClick={addMetric}
                className="text-xs text-primary hover:underline"
              >
                + Add metric
              </button>
            </div>
            {form.heroMetrics.length === 0 && (
              <p className="text-xs text-muted-foreground">
                No metrics yet. Add 1-3 to populate the introduction box.
              </p>
            )}
            {form.heroMetrics.map((metric, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_2fr_auto] gap-3 items-end"
              >
                <FormField
                  label={i === 0 ? "Value" : ""}
                  name={`metric-value-${i}`}
                  value={metric.value}
                  onChange={(e) => updateMetric(i, "value", e.target.value)}
                  placeholder="9+"
                />
                <FormField
                  label={i === 0 ? "Label" : ""}
                  name={`metric-label-${i}`}
                  value={metric.label}
                  onChange={(e) => updateMetric(i, "label", e.target.value)}
                  placeholder="Projects Delivered"
                />
                <button
                  type="button"
                  onClick={() => removeMetric(i)}
                  className="px-3 py-2.5 text-sm text-muted-foreground hover:text-destructive transition-colors"
                  aria-label="Remove metric"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section className="glass rounded-xl p-6 space-y-5">
          <h3 className="font-display text-lg font-semibold">Contact</h3>
          <FormField
            label="Public email"
            name="contactEmail"
            value={form.contactEmail}
            onChange={(e) => update("contactEmail", e.target.value)}
            placeholder="info@sweber.dev"
          />
          <FormField
            label="Phone"
            name="contactPhone"
            value={form.contactPhone}
            onChange={(e) => update("contactPhone", e.target.value)}
            placeholder="+41 79 ..."
          />
          <FormField
            label="Location"
            name="contactLocation"
            value={form.contactLocation}
            onChange={(e) => update("contactLocation", e.target.value)}
            placeholder="St. Gallen, Switzerland"
          />
        </section>

        {/* Social */}
        <section className="glass rounded-xl p-6 space-y-5">
          <h3 className="font-display text-lg font-semibold">Social URLs</h3>
          <FormField
            label="LinkedIn URL"
            name="linkedinUrl"
            value={form.linkedinUrl}
            onChange={(e) => update("linkedinUrl", e.target.value)}
            placeholder="https://ch.linkedin.com/in/..."
          />
          <FormField
            label="GitHub URL"
            name="githubUrl"
            value={form.githubUrl}
            onChange={(e) => update("githubUrl", e.target.value)}
            placeholder="https://github.com/..."
          />
          <FormField
            label="Twitter / X URL (leave empty to hide)"
            name="twitterUrl"
            value={form.twitterUrl}
            onChange={(e) => update("twitterUrl", e.target.value)}
            placeholder="https://x.com/..."
          />
        </section>

        {/* Structured data */}
        <section className="glass rounded-xl p-6 space-y-5">
          <h3 className="font-display text-lg font-semibold">
            Structured data (JSON-LD)
          </h3>
          <FormField
            label="Current employer"
            name="currentEmployer"
            value={form.currentEmployer}
            onChange={(e) => update("currentEmployer", e.target.value)}
            placeholder="Telsonic AG"
          />
          <FormField
            label="Current role"
            name="currentRole"
            value={form.currentRole}
            onChange={(e) => update("currentRole", e.target.value)}
            placeholder="Project Manager Software and Digitalisation"
          />
          <FormField
            label="Alumni of"
            name="alumniOf"
            value={form.alumniOf}
            onChange={(e) => update("alumniOf", e.target.value)}
            placeholder="WISS St. Gallen"
          />
          <FormField
            label="Knows about (one per line)"
            name="knowsAbout"
            value={form.knowsAbout}
            onChange={(e) => update("knowsAbout", e.target.value)}
            placeholder={
              "Project Management\nSoftware Development\nC# / .NET\nNext.js"
            }
            multiline
            rows={6}
          />
        </section>

        {/* Privacy */}
        <section className="glass rounded-xl p-6 space-y-5">
          <h3 className="font-display text-lg font-semibold">
            Privacy policy (Markdown)
          </h3>
          <FormField
            label="Privacy content"
            name="privacyContent"
            value={form.privacyContent}
            onChange={(e) => update("privacyContent", e.target.value)}
            placeholder="# Datenschutz\n\nDiese Seite verarbeitet ..."
            multiline
            rows={14}
            hint="Rendered on /privacy. Leave empty to hide that page."
          />
        </section>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {savedAt && (
          <p className="text-sm text-muted-foreground">
            Saved at {savedAt.toLocaleTimeString()}
          </p>
        )}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-primary text-primary-foreground rounded-lg px-4 py-2 text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  )
}
