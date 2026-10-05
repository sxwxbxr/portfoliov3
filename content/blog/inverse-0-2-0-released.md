---
title: "Inverse 0.2.0 released"
excerpt: "Inverse now runs on Express, Fastify and the Next.js Pages Router, can rate-limit scripted submissions, shows how many days are left to withdraw, and lets signed-in customers pick their contract. Pro adds a retention period for the ledger and audit runs that report what got worse."
date: 2026-10-05
author: Seya Weber
type: release
packages: [inverse]
tags: [Inverse, Widerrufsbutton, Kündigungsbutton, Next.js, React, Express, release]
---

Inverse 0.2.0 is out. `@sweberdev/inverse` and `@sweberdev/inverse-react` are on npm under the MIT licence, and the Pro packages are on GitHub Packages for licence holders. Nothing breaks: 0.1.0 code keeps working as it is.

## What is in 0.2.0

- **Node handler.** `createNodeHandler(options)` serves the same endpoint on Express, Fastify, `node:http` and API routes of the Next.js Pages Router. It reads a body that `express.json()` already parsed or the raw stream.
- **Rate limit.** `rateLimit: { max, windowMs }` answers 429 with `retry-after` once a client sends too many declarations. It counts per server instance and is meant against scripts, not against consumers who try twice.
- **Days left.** `withdrawalStatus({ start })` returns the last day, whether the period is still open and how many days are left, for the order overview or the confirmation page.
- **Contract select.** `<CancellationForm contracts={[...]}>` shows signed-in customers a list of their contracts instead of a free-text field and preselects a single one. Logging in stays optional.

## Install

```sh
pnpm add @sweberdev/inverse@^0.2.0 @sweberdev/inverse-react@^0.2.0
```

```ts
import express from "express";
import { createNodeHandler } from "@sweberdev/inverse";

const app = express();
app.post(
  "/api/inverse",
  express.json(),
  createNodeHandler({ company, onDeclaration, sendReceipt, rateLimit: { max: 10 } }),
);
```

Docs: [packages.sweber.dev/inverse/docs](https://packages.sweber.dev/inverse/docs). The [demo](https://packages.sweber.dev/inverse/demo) now shows the contract select in the cancellation form and the days left in the deadline calculator.

## Inverse Pro 0.2.0

- **Retention for the ledger.** `ledger.retain({ days })` and `inverse-ledger retain --days 1095` remove the personal data of every declaration older than the retention period. The hashes stay, so the chain still verifies and each removal is logged.
- **Audit baseline.** `inverse-audit --baseline last.json` compares today's run with the last one and lists what got worse, such as a footer link that a theme update removed or a cancellation page that now needs a login. With a baseline the exit code only reflects regressions, so a weekly CI job for all client sites stays quiet until something changes. `compareReports()` does the same in code.

Inverse Pro is available on the [package page](https://packages.sweber.dev/inverse), from CHF 19 a month.
