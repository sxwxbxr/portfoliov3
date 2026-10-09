---
title: "Inverse 0.9.0 released"
excerpt: "Inverse 0.9.0 freezes the public API ahead of 1.0 and adds an Austria page, a stability policy and an upgrade guide. Inverse Pro adds the audit report as a PDF and a helper that ends a Stripe or Paddle subscription after a cancellation."
date: 2026-10-09
author: Seya Weber
type: release
packages: [inverse]
tags: [Inverse, Widerrufsbutton, Kündigungsbutton, Austria, Stripe, Paddle, release]
---

Inverse 0.9.0 is the release candidate for 1.0. `@sweberdev/inverse` and `@sweberdev/inverse-react` are on npm under the MIT licence, and the Pro packages are updated on GitHub Packages for licence holders. Nothing breaks: 0.8.0 code keeps working as it is.

## What is in 0.9.0

- **API freeze.** A test in every package lists the public exports. From 1.0 removing or renaming one needs a major version. The [stability page](https://packages.sweber.dev/inverse/docs/reference/stability) says what the promise covers (exports, options, response bodies, ledger format, CLI flags), what may change in a minor version (texts that follow the law, report layouts) and how deprecations work.
- **Austria.** A new [page](https://packages.sweber.dev/inverse/docs/reference/austria) says what Inverse covers for shops selling to customers in Austria and what it does not claim: it does not quote Austrian sections and makes no statement that Austria has a duty equivalent to the German cancellation button. Check the current rules with your counsel.
- **Upgrade guide.** [Upgrading to 1.0](https://packages.sweber.dev/inverse/docs/guides/upgrading): code that runs on 0.9 runs on 1.0 without changes.

```sh
pnpm add @sweberdev/inverse@^0.9.0 @sweberdev/inverse-react@^0.9.0
```

Docs: [packages.sweber.dev/inverse/docs](https://packages.sweber.dev/inverse/docs). Try the flows in the [demo](https://packages.sweber.dev/inverse/demo).

## Inverse Pro 0.9.0

- **Audit report as PDF.** `inverse-audit --pdf report.pdf` writes the report as an A4 PDF without a browser, with your brand in the header; `--pdf-dir` writes one per site for agencies.
- **Ending a subscription.** `cancelSubscription({ provider: "stripe" | "paddle", ... })` ends a subscription at the payment provider after a cancellation: at period end, immediately, or on a date at Stripe. It changes real subscriptions, so run it after a person has looked at the declaration, and try it with test keys first.

Inverse Pro is available on the [package page](https://packages.sweber.dev/inverse), from CHF 19 a month.
