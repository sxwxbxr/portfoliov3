---
title: "Integral 0.1.0 released"
excerpt: "Licenses, plans and feature entitlements for developers who sell software. Signed offline license keys, Polar.sh license keys and React feature gates, without a licensing SaaS."
date: 2026-10-05
author: Seya Weber
type: release
packages: [integral]
tags: [Integral, Licensing, Entitlements, Polar, React, release]
---

Integral 0.1.0 is out. It handles licenses, plans and feature entitlements for developers who sell software: desktop apps, self-hosted tools, CLIs or paid libraries. `@sweberdev/integral` and `@sweberdev/integral-react` are on npm under the MIT licence.

## Why

Most licensing setups mean a hosted service that your app has to reach at runtime. Integral signs licenses with Ed25519 on your side and verifies them offline in your app with the public key. Nobody can forge or change a license without your private key, and no licensing server has to be online. You declare plans with features and limits once, then ask `has("export")` or `check("projects", used)` anywhere in your code.

## What is in 0.1.0

- Signed offline license keys (Ed25519) that are checked without a server.
- Plans with features and limits, inheritance and per-customer extras signed into the license.
- Polar.sh license keys: validate, activate and deactivate them through Polar's public API, without an access token in your app.
- Offline grace: cached checks keep paying customers working when the network is down.
- Update periods: licenses can end updates instead of usage, so versions released before the end keep working after a cancellation.
- A CLI to create keys and to issue, verify and inspect licenses.
- React bindings: `<Feature>`, `<Limit>`, `useFeature` and a hook for async license checks.
- Zero dependencies. Runs in Node 20+, browsers, Bun, Deno and edge runtimes.

## Install

```bash
pnpm add @sweberdev/integral
```

Declare your plans and check a license:

```ts
import { createEntitlements, definePlans, verifyLicense } from "@sweberdev/integral"

export const plans = definePlans({
  free: { features: ["editor"], limits: { projects: 1 } },
  pro: { extends: "free", features: ["export"], limits: { projects: 50 } },
})

const result = await verifyLicense(license, { publicKey: INTEGRAL_PUBLIC_KEY, product: "my-app" })
const entitlements = createEntitlements({ plans, license: result.valid ? result.license : null })

entitlements.has("export") // true on Pro
entitlements.check("projects", projects.length).allowed
```

The full reference is at [packages.sweber.dev/integral/docs](https://packages.sweber.dev/integral/docs).

## Integral Pro

Integral Pro is available today. It adds a license server that turns Polar orders and subscriptions into signed licenses automatically: it issues, renews, ends and revokes them from verified Polar webhooks, stores them in SQLite, Postgres or MySQL, and runs as one fetch handler in Next.js, Hono, Bun or Workers. Customers can exchange a Polar license key for a signed offline license. A React activation view with automatic renewal and upgrade prompts, in English and German, completes it.

Plans start at CHF 12 per month. Every version you received keeps working after you cancel, and your own customers never need a licence for Integral Pro, even though the activation view ships inside your app. Try the [Pro demo](https://packages.sweber.dev/integral/demo) and see all plans on the [package page](https://packages.sweber.dev/integral).
