---
title: "Permito 0.5.0: Spanish, Dutch, Polish and Portuguese, plus service templates"
excerpt: "Permito 0.5.0 adds four languages, starting points for 15 common services and a size check in CI that keeps the bundle in bounds."
date: 2026-10-06
author: Seya Weber
type: release
packages: [permito]
tags: [Permito, translations, GDPR, release]
---

Permito 0.5.0 is out on npm. It widens the reach beyond German-speaking markets and removes some typing from the configuration.

## Four more languages

The banner, the preference dialog and the blocked-embed notice now come in Spanish (`es`), Dutch (`nl`), Polish (`pl`) and Portuguese (`pt`), next to German, Swiss German, English, French and Italian. Regional tags fall back to the base language, so `pt-BR` and `es-MX` work. The new texts have not been reviewed by native speakers yet. The documentation says so, and every single text can be overridden. Corrections are welcome as issues or pull requests.

## Service templates

```ts
import { serviceFromTemplate } from "@permitojs/core";

const services = [
  serviceFromTemplate("google-analytics-4"),
  serviceFromTemplate("youtube", { category: "preferences" }),
];
```

There are 15 templates: YouTube, Vimeo, Google Maps, Google Analytics 4, Google Tag Manager, Google Ads, reCAPTCHA, Meta Pixel, LinkedIn Insight Tag, Microsoft Clarity, Microsoft Advertising, Hotjar, HubSpot, Pinterest Tag and Spotify. A template carries the name, the provider, the privacy policy URL and the category most sites choose. It deliberately lists no cookies and no durations, because those change and need a source. You decide the category and whether a service needs consent.

## A size check in CI

Every pull request now checks the gzip size of each entry point against a fixed limit. The new languages and templates raise the core from about 7.7 KB to 10.5 KB gzip; the script tag bundle is 14.8 KB. The limits make the next growth a visible decision.

## Upgrade

```bash
pnpm add @permitojs/core@^0.5.0 @permitojs/react@^0.5.0
```

Permito Pro 0.6.0 works with this release.

## What comes next

Vue and Svelte adapters and server helpers for SvelteKit, Remix and Astro, on the way to 1.0.

Permito is technical consent infrastructure, not legal advice. Have your final texts checked.
