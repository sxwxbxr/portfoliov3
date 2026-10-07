---
title: "Summand Pro 0.9.1 released"
excerpt: "Summand Pro now works with Summand 1.0: the version range of the free validator accepts 0.9 and 1.x, so there is no version conflict."
date: 2026-10-07
author: Seya Weber
type: release
packages: [summand]
tags: [Summand, Summand Pro, E-invoicing, release]
---

Summand Pro 0.9.1 is out. `summand-read`, `summand-view`, `summand-inbox`, `summand-write` and `summand-match` 0.9.1 are on GitHub Packages for licence holders.

## What changed

Summand 1.0.0 was released a few hours after Summand Pro 0.9.0. Pro 0.9.0 accepted only the free validator in the 0.9 range, so installing both could end in a version conflict. Pro 0.9.1 accepts `@sweberdev/summand` 0.9 and any 1.x release. We ran the complete test suites of all five packages against Summand 1.0.0 and they pass. Nothing else changed.

Upgrade with `pnpm add @weber-development/summand-inbox@latest` (and the other Summand Pro packages you use).

If you call the `summand` command from scripts: Summand 1.0 changed its exit codes (1 for an invalid invoice, 2 when the command could not run). The Summand Pro commands already used this scheme.

See the [Summand page](/summand) for pricing and licences.
