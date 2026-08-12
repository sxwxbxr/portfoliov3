"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, Copy, Loader2, RotateCcw } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { copy } from "@/lib/copy"

// The role and need options double as the wire format for /api/generate-pitch,
// so the label is the value.
const ROLE_OPTIONS = copy.pitch.roleOptions
const NEED_OPTIONS = copy.pitch.needOptions

const MAX_REQUIREMENTS = 300

export default function PitchPage() {
  const [step, setStep] = useState<"form" | "result">("form")
  const [role, setRole] = useState("")
  const [needs, setNeeds] = useState<string[]>([])
  const [requirements, setRequirements] = useState("")

  const [content, setContent] = useState("")
  const [generating, setGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  function toggleNeed(value: string) {
    setNeeds((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  async function generate() {
    if (!role || generating) return
    setStep("result")
    setGenerating(true)
    setContent("")
    setError(null)

    try {
      const res = await fetch("/api/generate-pitch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role,
          needs,
          requirements: requirements.trim() || null,
        }),
      })
      if (!res.ok || !res.body) throw new Error("request failed")

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let acc = ""
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        acc += decoder.decode(value, { stream: true })
        setContent(acc)
      }
      if (!acc.trim()) throw new Error("empty response")
    } catch {
      setError(copy.pitch.error)
    } finally {
      setGenerating(false)
    }
  }

  function startOver() {
    setStep("form")
    setContent("")
    setError(null)
    setCopied(false)
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard not available — ignore.
    }
  }

  return (
    <div className="min-h-screen bg-ground">
      <div className="sheet py-16 md:py-24">
        <div className="mx-auto flex max-w-2xl flex-col gap-9">
          <Link
            href="/"
            className="control inline-flex items-center gap-2 self-start px-4 py-2.5 text-sm font-medium"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            {copy.pitch.back}
          </Link>

          <div className="flex flex-col gap-4">
            <span className="tab annotate self-start">
              {step === "form" ? copy.pitch.stepForm : copy.pitch.stepResult}
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight text-balance">
              {copy.pitch.title}
            </h1>
            <p className="measure leading-relaxed text-fg-muted">{copy.pitch.intro}</p>
          </div>

          {step === "form" ? (
            /* ─── The form is one plate; every input is a recess in it. ─── */
            <div className="cast rim flex flex-col gap-7 p-6 md:p-8">
              <div className="flex flex-col gap-2">
                <label htmlFor="pitch-role" className="annotate">
                  {copy.pitch.roleLabel}
                </label>
                <Select value={role} onValueChange={setRole}>
                  {/* SelectTrigger is `.field` and SelectContent is `.cast`
                      in components/ui/select.tsx — no per-call restyling. */}
                  <SelectTrigger id="pitch-role">
                    <SelectValue placeholder={copy.pitch.rolePlaceholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_OPTIONS.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div
                role="group"
                aria-labelledby="needs-label"
                className="flex flex-col gap-2"
              >
                <span id="needs-label" className="annotate">
                  {copy.pitch.needsLabel}
                </span>
                {/* Sunken tray, options seated in it. A chosen option is
                    pressed into the tray, so selection survives without
                    colour and without hover. */}
                <div className="well grid gap-2 p-3 sm:grid-cols-2 md:p-4">
                  {NEED_OPTIONS.map((option) => {
                    const checked = needs.includes(option)
                    return (
                      <label
                        key={option}
                        className={
                          "flex cursor-pointer items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 " +
                          (checked ? "well-sm" : "cast-sm")
                        }
                      >
                        <Checkbox
                          checked={checked}
                          onCheckedChange={() => toggleNeed(option)}
                        />
                        <span className="leading-snug">{option}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="requirements" className="annotate">
                  {copy.pitch.requirementsLabel}
                </label>
                <textarea
                  id="requirements"
                  value={requirements}
                  onChange={(e) =>
                    setRequirements(e.target.value.slice(0, MAX_REQUIREMENTS))
                  }
                  rows={4}
                  maxLength={MAX_REQUIREMENTS}
                  placeholder={copy.pitch.requirementsPlaceholder}
                  className="field resize-y px-4 py-3 text-sm leading-relaxed"
                />
                <span className="annotate self-end">
                  {copy.pitch.requirementsCount(requirements.length, MAX_REQUIREMENTS)}
                </span>
              </div>

              <button
                type="button"
                onClick={generate}
                disabled={!role}
                className="control control-primary inline-flex items-center justify-center gap-2 self-start px-5 py-3 text-sm font-medium"
              >
                {copy.pitch.generate}
                <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              <div className="cast rim flex flex-col gap-5 p-6 md:p-8">
                <span className="annotate">{copy.pitch.resultLabel}</span>

                {/* The generated text sits in a recess: it is material the
                    page produced, not a control you act on. */}
                <div
                  className="well min-h-[12rem] p-5 md:p-6"
                  aria-live="polite"
                  aria-busy={generating}
                >
                  {generating && !content ? (
                    <div className="flex items-center gap-2.5 text-sm text-fg-muted">
                      <Loader2
                        className="h-4 w-4 animate-spin motion-reduce:animate-none"
                        aria-hidden="true"
                      />
                      {copy.pitch.writing}
                    </div>
                  ) : error && !content ? (
                    <p className="text-sm text-destructive">{error}</p>
                  ) : (
                    <p className="whitespace-pre-wrap leading-relaxed">{content}</p>
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    disabled={!content || generating}
                    className="control inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
                  >
                    {copied ? (
                      <>
                        <Check className="h-4 w-4" aria-hidden="true" />
                        {copy.common.copied}
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4" aria-hidden="true" />
                        {copy.pitch.copyToClipboard}
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={startOver}
                    className="control inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium"
                  >
                    <RotateCcw className="h-4 w-4" aria-hidden="true" />
                    {copy.pitch.startOver}
                  </button>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-fg-muted">
                {copy.pitch.disclaimer}{" "}
                <a
                  href="mailto:info@sweber.dev"
                  className="link-underline text-signal"
                >
                  info@sweber.dev
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
