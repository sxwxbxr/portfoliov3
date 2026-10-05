"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"

/*
 * The demo loads the published build of @sweberdev/witness (marking, watermark,
 * image marking and the two custom elements) from /public, so this site does
 * not depend on the package. Same code as on npm, bundled into one file.
 */

export const WITNESS_URL = "/demos/witness/witness-0.1.1.min.js"

export type DisclosureKind =
  | "chatbot"
  | "generated"
  | "edited"
  | "deepfake"
  | "emotion-recognition"
  | "biometric-categorisation"

export interface Marking {
  kind: "generated" | "edited" | "deepfake"
  sourceType: string
  generator?: string
  createdAt: string
}

export interface MarkResult {
  bytes: Uint8Array
  status: "marked" | "skipped-c2pa" | "unsupported"
  format: string | null
}

export interface ImageMarking {
  format: string | null
  xmp: string | null
  sourceType: string | null
  aiGenerated: boolean
  generator: string | null
  witness: boolean
  c2pa: boolean
}

export interface TextWatermark {
  generator?: string
  createdAt?: string
  id?: string
}

export interface WitnessModule {
  createMarking(input: { kind?: string; generator?: string }): Marking
  markImage(bytes: Uint8Array, marking: Marking): MarkResult
  readImageMarking(bytes: Uint8Array): ImageMarking
  watermarkText(text: string, data: TextWatermark): string
  readTextWatermark(text: string): TextWatermark | null
  stripTextWatermark(text: string): string
  iptcSourceType(sourceType: string): string
  defineWitnessElements(): void
}

export interface NoticeElement extends HTMLElement {
  reset(): void
}

let loading: Promise<WitnessModule> | undefined

function load(): Promise<WitnessModule> {
  loading ??= (import(/* webpackIgnore: true */ WITNESS_URL) as Promise<WitnessModule>).then((mod) => {
    mod.defineWitnessElements()
    return mod
  })
  return loading
}

/** The loaded module, `null` while loading, `false` when it failed. */
export function useWitness(): WitnessModule | null | false {
  const [mod, setMod] = useState<WitnessModule | null | false>(null)
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

/** Witness's own light and dark palette, picked by the site theme rather than the OS. */
export function witnessTheme(dark: boolean): Record<string, string> {
  return dark
    ? {
        "--witness-accent": "#8fb0ff",
        "--witness-accent-text": "#0b1530",
        "--witness-bg": "#15181f",
        "--witness-fg": "#eef1f6",
        "--witness-muted": "#a9b0bd",
        "--witness-border": "#2c323d",
      }
    : {
        "--witness-accent": "#003399",
        "--witness-accent-text": "#ffffff",
        "--witness-bg": "#ffffff",
        "--witness-fg": "#1a1a1a",
        "--witness-muted": "#555b66",
        "--witness-border": "#d7dbe3",
      }
}

/** Visible characters plus the invisible variation selectors, counted as code points. */
export function codePoints(text: string): number {
  return [...text].length
}

/** The site theme, light until mounted so server and client render the same markup. */
export function useDarkTheme(): boolean {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])
  return mounted && resolvedTheme === "dark"
}

/** A data URL for showing bytes as an image; the site's CSP allows data: but not blob: images. */
export function toDataUrl(bytes: Uint8Array, mime: string): string {
  let binary = ""
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binary += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
  }
  return `data:${mime};base64,${btoa(binary)}`
}
