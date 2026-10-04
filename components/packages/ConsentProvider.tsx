"use client"

import type { ReactNode } from "react"
import {
  ConsentBanner,
  PermitoProvider,
  PreferenceCenter,
  PreferencesButton,
} from "@permitojs/react"
import "@permitojs/react/styles.css"
import { MAIN_ORIGIN } from "@/lib/packages/urls"

/**
 * The package site runs its own product. The portfolio sets no cookies and
 * Vercel Analytics is cookieless, so consent is mounted here only, in the
 * packages layout, for the one thing that needs it: embedded YouTube videos.
 */
const config = {
  consentVersion: "2026-10",
  language: "en",
  categories: [{ id: "necessary", required: true }, { id: "media" }],
  services: [
    {
      id: "youtube",
      name: "YouTube",
      provider: "Google Ireland Ltd.",
      category: "media",
    },
  ],
}

// Permito's own light/dark palettes are replaced by the site tokens (dark only), so
// the banner needs no theme prop. Set on :root because
// the UI is portaled to document.body. :where() in the library CSS means these
// win without specificity games.
const THEME = `:root{
  --pmt-font: var(--font-inter), system-ui, sans-serif;
  --pmt-bg: var(--plate);
  --pmt-fg: var(--fg);
  --pmt-muted: var(--fg-muted);
  --pmt-border: var(--edge-soft);
  --pmt-surface: var(--well);
  --pmt-accent: var(--signal);
  --pmt-accent-fg: var(--signal-fg);
  --pmt-focus: var(--signal);
  --pmt-radius: var(--radius);
  --pmt-shadow: none;
}`

export function ConsentProvider({ children }: { children: ReactNode }) {
  return (
    <PermitoProvider config={config} privacyPolicyUrl={`${MAIN_ORIGIN}/privacy`}>
      <style>{THEME}</style>
      {children}
      <ConsentBanner />
      <PreferenceCenter />
      <PreferencesButton />
    </PermitoProvider>
  )
}
