---
title: "Integral Pro 2.1.0 released"
excerpt: "Integral Pro 2.1 adds a customer portal with plan, usage and seats, and handles Stripe and Paddle refunds and scheduled cancellations."
date: 2026-10-13
author: Seya Weber
type: release
packages: [integral]
tags: [Integral, Licensing, "2.1", Pro, release]
---

Integral Pro 2.1.0 is out for subscribers: `@weber-development/integral-server` and `@weber-development/integral-portal` 2.1.0 on GitHub Packages. The free packages stay at 2.0.0, and nothing breaks when you update.

## What is new

- **Customer portal.** `server.overview(license, { periods })` and `POST /overview` return plan, status, validity, update period, features, limits, usage per metric and period, floating seats in use and the devices. The new `<CustomerPortal>` React view shows it, including the device list, so your customers can answer "what do I have and how much have I used" without writing to you.
- **Refunds from Stripe and Paddle.** A full `charge.refunded` in Stripe and an approved refund adjustment in Paddle now revoke the license, as a Polar refund already did. Partial refunds are deliberately left alone.
- **Scheduled cancellations in Stripe.** A subscription with `cancel_at` is treated as cancelled at the end of the period, like `cancel_at_period_end`.

```tsx
<LicenseProvider endpoint="/api/integral" /* ... */>
  <CustomerPortal endpoint="/api/integral" periods={3} locale="en" />
</LicenseProvider>
```

## What is verified

The Stripe, Paddle and Lemon Squeezy sources are still **beta**. The new refund handling is tested with locally built events that follow the providers' documentation, not with real accounts. Try it in the providers' test mode before you rely on it. The overview route and the portal view are covered by tests, including German labels and error states.

## Upgrading

Update both Pro packages to 2.1.0. There are no schema changes and no new required options. The docs describe the [overview route](/integral/docs/pro/server) and the [portal view](/integral/docs/pro/portal).
