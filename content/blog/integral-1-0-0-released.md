---
title: "Integral 1.0.0 released"
excerpt: "Integral reaches 1.0: a stable API and stable license formats, with floating seats, usage metering, trials, key rotation, webhooks, emails and an admin view in Pro."
date: 2026-10-06
author: Seya Weber
type: release
packages: [integral]
tags: [Integral, Licensing, "1.0", Stable API, release]
---

Integral 1.0.0 is out. `@sweberdev/integral` and `@sweberdev/integral-react` 1.0.0 are on npm, and Integral Pro 1.0.0 is available to subscribers.

## What 1.0 means

It is a promise, not a new feature. The license formats (`int1`, `intr1`, `intq1`), the documented API of the free packages and the routes, options and store interface of Integral Pro stay compatible in every 1.x release. New options and fields may be added; nothing documented is removed or renamed before 2.0, and breaking changes are announced one minor release ahead. The new [stability page](https://packages.sweber.dev/integral/docs) lists exactly what is frozen. There are no breaking changes since 0.3.0, so you can update without touching your code.

## What is in it

The free packages sign and verify licenses offline with Ed25519, describe plans, features and limits, bind a license to a device (also offline), keep a signed revocation list, check Polar license keys and gate your React UI. 1.0 adds a key ring: `verifyLicense` accepts `{ [kid]: publicKey }` and checks a license against the key named in it first.

Integral Pro turns Polar orders and subscriptions into signed licenses and runs everything around them:

- device activations and floating seats with a heartbeat
- usage metering with limits, forwarded to Polar Meters
- trials started from your app, one per email address
- an audit trail, a token-protected admin API and a React admin view
- key rotation, signed webhooks and license emails in English and German
- import from Keygen, Cryptlex or a CSV file
- a ready-made offline activation page and guided view

## Update

Install the free and Pro packages together; Pro 1.x needs the free packages 1.x. If you come from a version before Pro 0.4.0, run `sqlSchema` once for the new tables. The [package page](https://packages.sweber.dev/integral) has the full feature list and the plans; Integral Pro starts at CHF 12 per month.
