---
title: "Derivative Pro 1.0.0: stable API, licence 1.0"
excerpt: "The three Derivative Pro packages (announce, insights, segments) are at 1.0.0. The API is stable and follows semantic versioning, and licence 1.0 applies. No code changes compared with 0.9."
date: 2026-10-07
author: Seya Weber
type: release
packages: [derivative]
tags: [Derivative, Changelog, Release notes, Pro, release]
---

Derivative Pro 1.0.0 is published for all licence holders: `@weber-development/derivative-announce`, `-insights` and `-segments`. The code is the same as in 0.9.0. What changes is the promise around it.

## What 1.0 means for Pro

The exports of the three packages are frozen and checked by a test that fails when one is added, removed or renamed without a deliberate update. From here on a minor or patch release does not break them. Deprecations are announced one minor release ahead and removed no earlier than 2.0, exactly as for the free packages in the [Stability page](https://packages.sweber.dev/derivative/docs). Node 20 and newer is supported.

## Licence 1.0

The Pro licence and the disclaimer are final in version 1.0 and ship in every package as `LICENSE.md`. Existing licences carry over, and prices do not change: Freelancer 12 CHF per month, Agency 39 CHF per month, Lifetime 1'290 CHF.

## What is in Pro

Read statistics without cookies or visitor IDs and a password-protected dashboard route (insights), audience segments through feature flags such as Unleash and LaunchDarkly (segments), and announcements to subscriber lists including LinkedIn posts (announce).

## Updating

Update the three packages to 1.0.0 together; they are versioned as one group. The [documentation](https://packages.sweber.dev/derivative/docs) covers the Pro setup, and the free core 1.0.0 works unchanged with it.
