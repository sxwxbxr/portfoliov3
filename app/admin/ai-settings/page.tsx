"use client"

import { useEffect, useState } from "react"
import ModelCombobox, {
  type OpenRouterModelOption,
} from "@/components/admin/ModelCombobox"
import FormField from "@/components/admin/FormField"

type ModelKey =
  | "chatPrimary"
  | "chatFallback"
  | "contactPrimary"
  | "contactFallback"
  | "deepdivePrimary"
  | "deepdiveFallback"
  | "pitchPrimary"
  | "pitchFallback"
  | "skillPrimary"
  | "skillFallback"

type Form = Record<ModelKey, string> & { dailyLimit: string }

const EMPTY_FORM: Form = {
  chatPrimary: "",
  chatFallback: "",
  contactPrimary: "",
  contactFallback: "",
  deepdivePrimary: "",
  deepdiveFallback: "",
  pitchPrimary: "",
  pitchFallback: "",
  skillPrimary: "",
  skillFallback: "",
  dailyLimit: "500",
}

const FEATURES: {
  label: string
  description: string
  primary: ModelKey
  fallback: ModelKey
}[] = [
  {
    label: "Chat Widget",
    description: "Floating assistant on every page.",
    primary: "chatPrimary",
    fallback: "chatFallback",
  },
  {
    label: "Contact Form Analysis",
    description: "Match analysis under the contact message field.",
    primary: "contactPrimary",
    fallback: "contactFallback",
  },
  {
    label: "Project Deep Dive",
    description: "On-demand technical breakdown on project pages.",
    primary: "deepdivePrimary",
    fallback: "deepdiveFallback",
  },
  {
    label: "Pitch Generator",
    description: "Personalised pitch at /pitch.",
    primary: "pitchPrimary",
    fallback: "pitchFallback",
  },
  {
    label: "Skill Explorer",
    description: "Per-skill explanation popovers on /skills.",
    primary: "skillPrimary",
    fallback: "skillFallback",
  },
]

export default function AiSettingsPage() {
  const [form, setForm] = useState<Form>(EMPTY_FORM)
  const [models, setModels] = useState<OpenRouterModelOption[]>([])
  const [fetching, setFetching] = useState(true)
  const [modelsError, setModelsError] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [savedAt, setSavedAt] = useState<Date | null>(null)

  useEffect(() => {
    fetch("/api/admin/ai-settings")
      .then((res) => res.json())
      .then((data) => {
        setForm({
          chatPrimary: data.chatPrimary ?? "",
          chatFallback: data.chatFallback ?? "",
          contactPrimary: data.contactPrimary ?? "",
          contactFallback: data.contactFallback ?? "",
          deepdivePrimary: data.deepdivePrimary ?? "",
          deepdiveFallback: data.deepdiveFallback ?? "",
          pitchPrimary: data.pitchPrimary ?? "",
          pitchFallback: data.pitchFallback ?? "",
          skillPrimary: data.skillPrimary ?? "",
          skillFallback: data.skillFallback ?? "",
          dailyLimit: String(data.dailyLimit ?? 500),
        })
        setFetching(false)
      })
      .catch(() => {
        setError("Failed to load AI settings")
        setFetching(false)
      })

    fetch("/api/admin/ai-models")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data: OpenRouterModelOption[]) => setModels(data))
      .catch(() =>
        setModelsError(
          "Could not load the OpenRouter model list — you can still type/keep existing IDs."
        )
      )
  }, [])

  function update(key: keyof Form, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSaving(true)
    try {
      const res = await fetch("/api/admin/ai-settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, dailyLimit: Number(form.dailyLimit) }),
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
          AI Models
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Pick the OpenRouter model each AI feature uses. The{" "}
          <strong>primary</strong> should be a free <code>:free</code> model;
          the <strong>fallback</strong> (a paid model) is used automatically
          when the primary fails or is rate-limited.
        </p>
      </div>

      {modelsError && (
        <p className="text-sm text-amber-600 dark:text-amber-400">{modelsError}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {FEATURES.map((feature) => (
          <section key={feature.primary} className="glass rounded-xl p-6 space-y-5">
            <div>
              <h3 className="font-display text-lg font-semibold">{feature.label}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {feature.description}
              </p>
            </div>
            <div className="grid md:grid-cols-2 gap-5">
              <ModelCombobox
                label="Primary (free)"
                value={form[feature.primary]}
                onChange={(id) => update(feature.primary, id)}
                models={models}
                defaultFreeOnly
              />
              <ModelCombobox
                label="Fallback (paid)"
                value={form[feature.fallback]}
                onChange={(id) => update(feature.fallback, id)}
                models={models}
              />
            </div>
          </section>
        ))}

        <section className="glass rounded-xl p-6 space-y-5">
          <h3 className="font-display text-lg font-semibold">Abuse protection</h3>
          <FormField
            label="Global daily request cap"
            name="dailyLimit"
            type="number"
            value={form.dailyLimit}
            onChange={(e) => update("dailyLimit", e.target.value)}
            placeholder="500"
            hint="Hard kill-switch across all AI features per day (requires a linked Vercel KV / Upstash store). Per-IP limiting (10/min) always applies."
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
