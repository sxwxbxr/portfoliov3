"use client"

import { useEffect, useState } from "react"

/*
 * The demo loads the published build of @sweberdev/summand (XPath and
 * Schematron engine, the official rule sets, PDF reader, Leitweg-ID check)
 * from /public, so this site does not depend on the package. Same code as on
 * npm, bundled into one file.
 */

export const SUMMAND_URL = "/demos/summand/summand-0.2.0.min.js"
export const SAMPLES_URL = "/demos/summand/samples/"

export interface ValidationMessage {
  id: string
  severity: "error" | "warning" | "info"
  message: string
  location?: string
  line?: number
  ruleSet: string
}

export interface ValidationResult {
  valid: boolean
  syntax?: "ubl-invoice" | "ubl-creditnote" | "cii"
  profile?: { id: string; label: string; specificationId: string; en16931: boolean }
  source: { type: "xml" | "pdf"; attachmentName?: string; pdfConformanceLevel?: string }
  ruleSets: Array<{ id: string; name: string; version: string; license: string }>
  errors: ValidationMessage[]
  warnings: ValidationMessage[]
  infos: ValidationMessage[]
  summary?: {
    number?: string
    issueDate?: string
    currency?: string
    buyerReference?: string
    seller: { name?: string; vatId?: string }
    buyer: { name?: string; vatId?: string }
    payableAmount?: string
    lineCount: number
  }
  durationMs: number
}

export interface LeitwegId {
  coarse: string
  fine?: string
  checkDigits: string
}

export interface SummandModule {
  validateInvoice(
    input: string | Uint8Array,
    options?: { xrechnung?: boolean; lang?: "en" | "de" },
  ): ValidationResult
  isValidLeitwegId(id: string): boolean
  parseLeitwegId(id: string): LeitwegId | undefined
  leitwegCheckDigits(coarse: string, fine?: string): string
}

let loading: Promise<SummandModule> | undefined

function load(): Promise<SummandModule> {
  loading ??= import(/* webpackIgnore: true */ SUMMAND_URL) as Promise<SummandModule>
  return loading
}

/** The loaded module, `null` while loading, `false` when it failed. */
export function useSummand(): SummandModule | null | false {
  const [mod, setMod] = useState<SummandModule | null | false>(null)
  useEffect(() => {
    let alive = true
    load().then(
      (m) => alive && setMod(m),
      () => alive && setMod(false),
    )
    return () => {
      alive = false
    }
  }, [])
  return mod
}

/** Status colours, readable in light and dark mode (same as the Inverse demo). */
export const TONE = {
  pass: "text-emerald-700 dark:text-emerald-400",
  warn: "text-amber-700 dark:text-amber-400",
  fail: "text-red-700 dark:text-red-400",
}
