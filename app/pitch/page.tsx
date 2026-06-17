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
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

const ROLE_OPTIONS = [
  "Recruiter",
  "Startup Founder",
  "Agency",
  "Enterprise PM",
  "Other",
]

const NEED_OPTIONS = [
  "Full-Stack Development",
  "Project Management",
  "Automation & OPC-UA",
  "SaaS / Cloud Architecture",
  "Short-term Freelance",
  "Long-term Collaboration",
]

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
      setError("Could not generate a pitch right now. Please try again.")
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
    <div className="min-h-screen bg-background grain-overlay">
      <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
        <Link
          href="/"
          className="mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          Back to sweber.dev
        </Link>

        <h1 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
          Generate a pitch
        </h1>
        <p className="mt-3 text-muted-foreground leading-relaxed">
          Tell me a little about what you&apos;re looking for and I&apos;ll
          generate a tailored summary of how Seya could help — ready to forward.
        </p>

        {step === "form" ? (
          <div className="mt-10 space-y-8">
            <div className="space-y-2">
              <label className="text-sm font-medium">Your role / context</label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="w-full bg-transparent border-border">
                  <SelectValue placeholder="Select your role" />
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

            <div className="space-y-3">
              <label className="text-sm font-medium">
                What are you looking for?
              </label>
              <div className="grid sm:grid-cols-2 gap-3">
                {NEED_OPTIONS.map((option) => (
                  <label
                    key={option}
                    className="flex cursor-pointer items-center gap-3 rounded-lg border border-border p-3 text-sm transition-colors hover:bg-accent/50"
                  >
                    <Checkbox
                      checked={needs.includes(option)}
                      onCheckedChange={() => toggleNeed(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="requirements" className="text-sm font-medium">
                Any specific requirements?{" "}
                <span className="text-muted-foreground">(optional)</span>
              </label>
              <Textarea
                id="requirements"
                value={requirements}
                onChange={(e) =>
                  setRequirements(e.target.value.slice(0, MAX_REQUIREMENTS))
                }
                rows={4}
                maxLength={MAX_REQUIREMENTS}
                placeholder="e.g. a 3-month engagement building a TypeScript automation pipeline..."
                className="bg-transparent border-border"
              />
              <div className="text-xs text-muted-foreground">
                {requirements.length}/{MAX_REQUIREMENTS} characters
              </div>
            </div>

            <Button
              onClick={generate}
              disabled={!role}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Generate Pitch &rarr;
            </Button>
          </div>
        ) : (
          <div className="mt-10 space-y-6">
            <div className="min-h-[12rem] rounded-xl border border-border bg-card/40 p-6">
              {generating && !content ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" />
                  Writing your pitch...
                </div>
              ) : error && !content ? (
                <p className="text-sm text-muted-foreground">{error}</p>
              ) : (
                <p className="whitespace-pre-wrap leading-relaxed text-foreground/90">
                  {content}
                </p>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                onClick={copyToClipboard}
                disabled={!content || generating}
                variant="outline"
              >
                {copied ? (
                  <>
                    <Check className="size-4" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="size-4" /> Copy to Clipboard
                  </>
                )}
              </Button>
              <Button onClick={startOver} variant="ghost">
                <RotateCcw className="size-4" /> Start over
              </Button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">
              This pitch was generated by AI based on Seya&apos;s actual profile.
              For direct contact:{" "}
              <a href="mailto:info@sweber.dev" className="text-primary">
                info@sweber.dev
              </a>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
