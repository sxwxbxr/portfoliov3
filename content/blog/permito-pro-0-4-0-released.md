---
title: "Permito Pro 0.4.0: consent statistics for client reports"
excerpt: "The Permito Pro consent log now turns its entries into aggregate numbers per period: how many visitors accept, reject or choose, per category and per service, without any personal data."
date: 2026-10-05
author: Seya Weber
type: release
packages: [permito]
tags: [Permito, Permito Pro, consent log, reporting, release]
---

Permito Pro 0.4.0 is out on GitHub Packages. It adds consent statistics to `@weber-development/permito-log`, the self-hosted consent log.

## Why

Agencies get asked the same question after every banner launch: how many visitors actually agree? Until now the log could answer an access request for one visitor, but not that question.

## What it does

```ts
import { formatConsentStatsMarkdown, summarizeConsentLog } from "@weber-development/permito-log";

const stats = await summarizeConsentLog(log.exportAll(), {
  from: new Date("2026-10-01"),
  to: new Date("2026-11-01"),
});

const report = formatConsentStatsMarkdown(stats, { language: "de", title: "kunde.ch, Oktober" });
```

`summarizeConsentLog()` counts decisions in a period and splits them into accepted all, rejected all and custom. For every category and every service it returns granted, declined and the acceptance rate, plus counts by source (banner or preference center), by configuration version and by day.

By default the latest decision per visitor counts, so the rates describe people rather than clicks. The result holds counters only: no visitor hashes, no entries. `formatConsentStatsMarkdown()` turns it into a German or English Markdown report you can paste into a monthly client report.

## Upgrade

All Permito Pro packages move to 0.4.0 together:

```bash
pnpm add @weber-development/permito-log@^0.4.0
```

Existing licences include the update. Permito Pro is also part of the [Compliance Bundle](/bundles/compliance).
