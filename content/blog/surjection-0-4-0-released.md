---
title: "Surjection 0.4.0 released"
excerpt: "Screenshots of every affected element as evidence in client reports, and a regression check that tells you when a client site got worse overnight."
date: 2026-10-06
author: Seya Weber
type: release
packages: [surjection]
tags: [Surjection, Accessibility, WCAG 2.2, Monitoring, release]
---

Surjection 0.4.0 is about what you hand to the client and what happens after the audit. A list of selectors is easy to produce. A picture of the problem and an alarm when it comes back are what clients pay an agency for.

## What is new in 0.4.0

**Free: screenshots as evidence.** `--screenshots a11y-shots` saves a picture of every affected element, with a little context around it: up to five per finding and forty per page. The paths are stored in the results file. Elements inside iframes or shadow DOM and invisible elements are skipped.

```bash
npx surjection check --config surjection.config.json \
  --out-json a11y.json --screenshots a11y-shots
```

**Pro: reports with evidence.** `surjection-report` embeds the pictures next to the selector and the fix instruction, so the client sees the low-contrast opening hours instead of reading `p`. The report stays one self-contained file, as HTML or PDF. The [live demo](https://packages.sweber.dev/surjection/demo) has an example.

**Pro: monitoring.** `surjection-history regressions` compares the latest run of a project with the previous one and lists what is new, in German, Swiss German, French, Italian and English. It exits with 1 when new issues reach `--fail-on`, so a scheduled job fails and GitHub mails you.

```bash
npx surjection check --config surjection.config.json --out-json a11y.json
npx surjection-history record --results a11y.json
npx surjection-history regressions --fail-on serious --out-md monitoring.md
```

The [docs](https://packages.sweber.dev/surjection/docs/pro/history) contain a complete nightly workflow that records the run in your repository and fails on a new serious issue.

## Upgrade

```bash
pnpm add -D @sweberdev/surjection@^0.4.0
```

Nothing breaks: screenshots are opt-in. Pro customers update the three `@weber-development` packages to 0.4.0.

Automated tests, with or without screenshots, find only part of all barriers. A passing run is no proof of conformance.
