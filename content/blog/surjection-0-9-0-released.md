---
title: "Surjection 0.9.0 released"
excerpt: "Release candidate for 1.0: big sitemaps in parallel, the accessibility statement straight from the checklist, evidence and reviewer per criterion, and a filter for the client dashboard."
date: 2026-10-07
author: Seya Weber
type: release
packages: [surjection]
tags: [Surjection, Accessibility, WCAG 2.2, Checklist, release]
---

Surjection 0.9.0 is the release candidate for 1.0. The API is frozen from here on: what is documented stays as it is, and the next release adds the stability promise.

## What is new in 0.9.0

**Free: large sites.** `--concurrency 4` checks up to eight pages at once. A test with a made-up site of 600 pages took 90 seconds with four at once, and the Markdown report, JSON file and the Pro reports (HTML, PDF in about eight seconds, Word, CSV) handled it without trouble. One broken page used to stop the whole run. Now pages that cannot be loaded are listed at the end, all other pages are checked and written to the reports, and the exit code is 2.

```bash
npx surjection check --sitemap https://www.example.ch/sitemap.xml --max-pages 600 --concurrency 4
```

**Free: statement from the checklist.** If you work through the manual checklist of Surjection Pro, `surjection statement --checklist checklist.json` derives status, known issues (your notes and planned fix dates) and the review date from it. While criteria are still untested the command stops, because a statement must not claim more than was checked. The [statement guide](https://packages.sweber.dev/surjection/docs/guides/statement) has the details.

**Pro: evidence and reviewer.** Each criterion in the checklist editor now takes evidence links, screenshots up to 400 KB, the name of the tester and the date. Reports show the evidence next to the criterion, in HTML and Word, and only `https` links become clickable.

**Pro: filter for the dashboard.** Search a project, show only those that got worse since the last check, or sort by name, most issues or biggest increase. The controls need JavaScript and stay hidden without it, the table is complete either way.

**Target size.** WCAG 2.5.8 (minimum target size) is part of the default standard through axe-core. It now has a test of its own.

## Upgrade

```bash
pnpm add -D @sweberdev/surjection@^0.9.0
```

Nothing breaks. Pro customers update the three `@weber-development` packages to 0.9.0.

Automated tests find only part of all barriers. A passing run is no proof of conformance.
