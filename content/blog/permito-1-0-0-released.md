---
title: "Permito 1.0.0: a stable API for a self-hosted consent banner"
excerpt: "Permito 1.0.0 is out. The code is the same as the 0.9 release candidate; what is new is the promise: the stable API follows semantic versioning, and Permito Pro 0.8 or later accepts it."
date: 2026-10-06
author: Seya Weber
type: release
packages: [permito]
tags: [Permito, release, "1.0", semver]
---

Permito 1.0.0 is out on npm, for `@permitojs/core` and `@permitojs/react`. The code is identical to 0.9.0. Version 1.0.0 adds the promise that comes with the number.

## What 1.0 means

Everything listed as stable on the API status page is covered by semantic versioning from now on: banner, preference center, gating, Consent Mode v2, GPC, expiry, tab sync, the script tag, the bridges for Microsoft UET, Clarity and Matomo, service templates, and the Vue and Svelte adapters. Patch releases fix bugs and wording, minor releases add features, and only a new major version can remove or change stable API. Tests pin every runtime export of every entry point, so a change cannot slip in by accident.

Not part of the promise: the wording of built-in translations (the Spanish, Dutch, Polish and Portuguese texts have not been read by native speakers yet) and the CSS class names. The versioning and support page explains how long a version gets fixes and how to report a vulnerability.

## What Permito covers

- A banner and preference center for React, Next.js, Vue, Svelte and, with one script tag, WordPress, Webflow, Astro or plain HTML
- Nine languages, with equal "Reject all" and "Accept all" buttons
- Blocking of scripts and embeds until consent, Consent Mode v2, Global Privacy Control, consent expiry and sync across tabs
- Bridges for Microsoft UET, Clarity and Matomo, and 15 service templates
- Tested against WCAG 2.2 AA in Chromium, Firefox and WebKit, with a manual screen reader checklist for your own site
- No third-party requests and no tracking of its own

## Upgrade

```bash
pnpm add @permitojs/core@^1.0.0 @permitojs/react@^1.0.0
```

There are no breaking changes since 0.1.0 and stored decisions stay valid. If you use Permito Pro, upgrade Pro to 0.8.0 or later first: older Pro versions stop at 1.0.0 in their peer range. Permito Pro itself stays at 0.x for now.

Permito is technical consent infrastructure, not legal advice.
