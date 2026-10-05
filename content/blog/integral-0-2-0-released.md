---
title: "Integral 0.2.0 released"
excerpt: "Signed revocation lists for licenses that are only checked offline, device binding, trial licenses and a license status for your UI. Integral Pro serves the revocation list and warns your customers before a license ends."
date: 2026-10-05
author: Seya Weber
type: release
packages: [integral]
tags: [Integral, Licensing, Revocation, Polar, React, release]
---

Integral 0.2.0 is out. `@sweberdev/integral` and `@sweberdev/integral-react` 0.2.0 are on npm, and Integral Pro 0.2.0 follows for subscribers.

## Why

Offline licenses had one gap: once a license was out, an app that never asks a server could not learn that it had been refunded. A lifetime license had no end date to fall back on. 0.2.0 closes that gap with signed revocation lists, and adds the pieces developers asked for next: binding a license to a device, trial licenses, and a simple way to tell customers how many days they have left.

## What is new

- **Signed revocation lists.** `signRevocationList({ ids, product }, privateKey)` signs a list of revoked license ids with the same key as your licenses. Ship it with an update, download it, or serve it from your server, then pass it to `verifyLicense({ revocations })`. A forged list is rejected, just like a forged license.
- **Device binding.** `machineId(...values)` turns stable device values into an anonymous SHA-256 id. Sign it into a license with `machine`, and `verifyLicense({ machine })` rejects the license on any other device.
- **Trial licenses and status.** Mark a license with `trial: true`. `licenseStatus(license)` tells you whether it is active, expiring soon or expired, how many days are left, and whether the update period has ended.
- **CLI.** `integral revoke lic_123 --product my-app` prints a signed revocation list. `issue` gains `--machine` and `--trial`, `verify` gains `--machine` and `--revocations`.

```ts
import { licenseStatus, verifyLicense, verifyRevocationList } from "@sweberdev/integral"

const revocations = await verifyRevocationList(listFromYourServer, { publicKey, product: "my-app" })
const result = await verifyLicense(license, { publicKey, product: "my-app", revocations, machine })

if (result.valid) licenseStatus(result.license).daysLeft
else result.reason // "revoked", "wrong_machine", "expired", …
```

Nothing changes for existing licenses: 0.1.0 licenses verify unchanged, and both options are optional.

## Integral Pro 0.2.0

The license server gets a `GET /revocations` route that returns the signed list of every revoked license, so a refund now reaches apps that only check offline. The React activation view downloads that list, keeps the last copy for offline use and accepts a `machine` prop for device-bound licenses. The new `<LicenseStatusBanner>` warns before a trial, a license or its update period ends and links to your renewal page, in English and German.

## Try it

The [live demo](https://packages.sweber.dev/integral/demo) now lets you revoke a license, bind it to a laptop and check it on another one, and issue a trial. The docs have a new [revocation guide](https://packages.sweber.dev/integral/docs). Integral Pro starts at CHF 12 per month, see the [package page](https://packages.sweber.dev/integral).
