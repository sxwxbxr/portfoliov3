---
title: "Inverse 0.4.0 released"
excerpt: "Inverse now catches double clicks, so a declaration sent twice is stored and confirmed once. Inverse Pro adds a weekly team digest of refunds and contract ends that are due, and audit reports that print to PDF and export to CSV."
date: 2026-10-06
author: Seya Weber
type: release
packages: [inverse]
tags: [Inverse, Widerrufsbutton, Kündigungsbutton, Next.js, React, release]
---

Inverse 0.4.0 is out. `@sweberdev/inverse` and `@sweberdev/inverse-react` are on npm under the MIT licence, and the Pro packages are updated on GitHub Packages for licence holders. Nothing breaks: 0.3.0 code keeps working as it is.

## What is in 0.4.0

- **Duplicate protection.** People click twice, reload the confirmation page or retry on a slow connection. With `dedupe: { windowMs }` the handler answers an identical declaration with the first result, so you store one record and send one receipt. E-mail addresses are compared case-insensitively. It is off by default and works in `createInverseHandler`, `createNodeHandler` and the script-tag forms that post to them.

```ts
import { createInverseHandler } from "@sweberdev/inverse";

export const POST = createInverseHandler({
  company,
  onDeclaration,
  sendReceipt,
  dedupe: { windowMs: 10 * 60_000 },
  rateLimit: { max: 10 },
});
```

```sh
pnpm add @sweberdev/inverse@^0.4.0 @sweberdev/inverse-react@^0.4.0
```

Docs: [packages.sweber.dev/inverse/docs](https://packages.sweber.dev/inverse/docs). Try the flows in the [demo](https://packages.sweber.dev/inverse/demo).

## Inverse Pro 0.4.0

- **Team digest.** `teamDigest(records)` builds one e-mail a week with everything that needs doing: refunds that are due after a withdrawal (14 days after receipt), contracts that end in the next two weeks, cancellations whose end date was not sent yet, and all declarations received in the period. Run it from a cron job with the records from your ledger. `dueItems()` returns the same list as data for your back office.
- **Reports for clients.** The audit's HTML report now has a print stylesheet, so *Print → Save as PDF* gives an A4 report to attach to an offer. `inverse-audit --csv overview.csv` writes one row per site with the verdict and both button targets, for agencies that track all client sites in a spreadsheet.

Inverse Pro is available on the [package page](https://packages.sweber.dev/inverse), from CHF 19 a month.
