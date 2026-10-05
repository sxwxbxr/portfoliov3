---
title: "Permito 0.1.0 released"
excerpt: "The first public release of Permito: a self-hosted cookie banner, preference center and consent gates for React and Next.js. MIT licensed, no network calls."
date: 2026-10-04
author: Seya Weber
type: release
packages: [permito]
tags: [Permito, React, Next.js, GDPR, revDSG, release]
---

Permito 0.1.0 is out. It is a consent toolkit for React, Next.js and Vite that you ship inside your own app, instead of loading a banner from someone else's server. `@permitojs/core` and `@permitojs/react` are on npm under the MIT licence.

## What is in 0.1.0

- A cookie banner and preference center. Optional categories are opt-in, and "Reject all" is exactly as prominent as "Accept all".
- No network calls and no tracking. Consent is stored in your own cookie.
- `ConsentScript`, `ConsentIframe` and `ConsentGate` keep scripts, embeds and components from loading until consent is given.
- Server-safe Next.js helpers in `@permitojs/react/server`, so gated content does not flash on first load.
- Google Consent Mode v2 with a configurable category mapping.
- Translations for `de`, `de-CH`, `en`, `fr` and `it`.

## Install

```bash
pnpm add @permitojs/core @permitojs/react
```

Wrap your app once and render the banner, the preference center and a button to reopen it:

```tsx
"use client"

import {
  ConsentBanner,
  PermitoProvider,
  PreferenceCenter,
  PreferencesButton,
} from "@permitojs/react"
import "@permitojs/react/styles.css"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PermitoProvider
      config={{
        consentVersion: "2026-10",
        language: "de-CH",
        categories: [
          { id: "necessary", required: true },
          { id: "statistics" },
          { id: "marketing" },
        ],
      }}
      privacyPolicyUrl="/datenschutz"
      googleConsentMode
    >
      {children}
      <ConsentBanner />
      <PreferenceCenter />
      <PreferencesButton />
    </PermitoProvider>
  )
}
```

The full reference is at [packages.sweber.dev/permito/docs](https://packages.sweber.dev/permito/docs).

## What comes next

Permito is in beta, so expect the API to settle over the next releases. A Pro edition with commercial add-ons is in preparation. You can join the waitlist on the package page.
