---
title: "Integral Pro 0.7.0 released"
excerpt: "Free trials that start from your app, one per email address, and a guided offline activation for computers without internet."
date: 2026-10-06
author: Seya Weber
type: release
packages: [integral]
tags: [Integral, Licensing, Trial, Offline activation, release]
---

Integral Pro 0.7.0 is out for subscribers. The free packages stay at 0.3.0.

## Why

Two moments decide whether a customer buys: the first try and the first install on an awkward machine. Until now a trial meant you issued a license by hand, and an offline computer meant explaining how to copy a long request string between two machines.

## What is new

- **Trials.** Switch on the `trial` option (plan and number of days) and your app can request a trial license from `POST /trial` with an email address. Each address gets one trial: upper case and a `+tag` count as the same address. The license is marked as a trial and ends by itself, and the status banner you already have warns before it does. With the `mail` option from 0.5.0 the customer also gets the license by email.
- **Offline activation page.** `GET /offline` serves a small page without dependencies (English or German) that turns an activation request into a license bound to the device. It uses the normal activation route, so the device limit still applies.
- **`<TrialSignup>` and `<OfflineActivation>`** for the React portal. The first asks for an email address and activates the trial; the second guides the customer from the license key to the request, to the offline page and back to the activated license.

```tsx
<TrialSignup endpoint="/api/integral" />
<OfflineActivation machine={machine} activationUrl="https://app.example.ch/api/integral/offline" />
```

## Update

Nothing to migrate; trials are off until you set the option. Put `/trial` behind your own rate limit if your app is public. See the [server and portal docs](https://packages.sweber.dev/integral/docs). Integral Pro starts at CHF 12 per month, see the [package page](https://packages.sweber.dev/integral).
