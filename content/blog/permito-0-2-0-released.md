---
title: "Permito 0.2.0: consent that expires, Global Privacy Control and tab sync"
excerpt: "Permito 0.2.0 asks again after a configurable number of days, honours the Global Privacy Control browser signal and applies a decision in every open tab at once."
date: 2026-10-05
author: Seya Weber
type: release
packages: [permito]
tags: [Permito, React, Next.js, GDPR, revDSG, GPC, release]
---

Permito 0.2.0 is out. `@permitojs/core` and `@permitojs/react` get three features that agencies asked about most after the first release. Nothing changes for existing setups unless you turn the new options on; tab sync is the only new default.

## Decisions that expire

```ts
config={{ consentVersion: "2026-10", categories, maxAgeDays: 365 }}
```

Once a decision is older than `maxAgeDays`, Permito treats it as missing and shows the banner again. It works with every storage, including `localStorage`, which never expires on its own. Supervisory authorities commonly recommend asking again after 6 to 13 months; the value stays your decision. `snapshot.expiresAt` tells you when the current decision runs out.

## Global Privacy Control

Global Privacy Control is a browser signal with which visitors object to the sale and sharing of their data, and several US states require businesses to honour it. That matters for Swiss and German shops that also sell to the US and run their banner in opt-out mode there.

```ts
config={{ consentVersion: "2026-10", categories, mode: "opt-out", globalPrivacyControl: true }}
```

While the visitor has not decided, `marketing` (or the categories you list) starts declined when the signal is present. An explicit choice in the banner always wins, and opt-in setups are unaffected because optional categories are declined anyway. For server rendering, `readGpcFromHeaders()` from `@permitojs/react/server` reads the `Sec-GPC` header, so server and client agree.

## One decision, every tab

A choice made in one tab now applies immediately in every other open tab of the same site: gated scripts, iframes and Google Consent Mode updates included. Permito uses a `BroadcastChannel` in the browser and still sends nothing over the network. It is on by default with the built-in cookie storage and can be turned off with `syncTabs: false`.

## Upgrade

```bash
pnpm add @permitojs/core@^0.2.0 @permitojs/react@^0.2.0
```

The new guide [Lifetime, GPC and tabs](/permito/docs/guides/lifetime-gpc-tabs) covers all three options, and the [live demo](/permito/demo) now syncs between two open tabs and shows when a decision expires.

## What comes next

The next release focuses on sites without React: a drop-in banner as a script tag for WordPress, Astro or static pages, and consent bridges for Microsoft UET, Microsoft Clarity and Matomo.

Permito is technical consent infrastructure, not legal advice. Whether a service needs consent, and how long a decision should last, is your assessment.
