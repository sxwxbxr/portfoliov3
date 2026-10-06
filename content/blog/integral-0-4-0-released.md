---
title: "Integral Pro 0.4.0 released"
excerpt: "Floating licenses, usage metering, an audit trail and an admin view: run your licensing without touching the database."
date: 2026-10-06
author: Seya Weber
type: release
packages: [integral]
tags: [Integral, Licensing, Floating licenses, Usage metering, release]
---

Integral Pro 0.4.0 is out for subscribers. The free packages `@sweberdev/integral` and `@sweberdev/integral-react` stay at 0.3.0; nothing changed there.

## Why

Once licenses are sold automatically, the questions change. How many people may use one license at the same time? How much did a customer use this month? What happened to this license, and who can revoke it without opening the database? 0.4.0 answers these in the license server and the React portal.

## What is new

- **Floating licenses.** `seats` becomes the number of apps that may run at the same time. An app takes a seat with `lease()` and renews it as a heartbeat. A seat that is not renewed expires on its own after five minutes (adjustable from 30 to 3600 seconds). The routes are `/lease` and `/lease/release`.
- **Usage metering.** `recordUsage()` counts usage per license, metric and period (month, year or none) and refuses it above the limit signed into the license. Refused usage is not counted.
- **Audit trail.** Every issue, renewal, revocation, activation and seat change is stored as an event and can be read with `events()` or exported as JSON or CSV.
- **Administration.** `createAdminHandler()` is a token-protected API to search licenses, revoke them, issue them again and free devices or seats. In React, `<LicenseAdmin>` is an unstyled view on top of it, with English and German labels.
- **`useLease()`** holds a seat while your app runs and tells you when all seats are in use.

```ts
const result = await licenses.lease({ license, holder: "session-42" })
if (!result.ok && result.reason === "lease_limit") showAllSeatsInUse()

await licenses.recordUsage({ license, metric: "exports" })
```

## Update

Run `sqlSchema` again. It adds three tables (`leases`, `usage`, `events`) and leaves existing data untouched. Existing licenses and routes keep working.

## Try it

The new [administration guide](https://packages.sweber.dev/integral/docs) and the updated server and portal pages describe every route. Integral Pro starts at CHF 12 per month, see the [package page](https://packages.sweber.dev/integral).
