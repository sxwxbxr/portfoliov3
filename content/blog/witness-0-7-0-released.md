---
title: "Witness Pro 0.7.0 released"
excerpt: "Witness Pro 0.7.0 finds AI use your register does not mention, drafts the missing systems, keeps a change log of the register and prints the client report cleanly to PDF."
date: 2026-10-06
author: Seya Weber
type: release
packages: [witness]
tags: [Witness, EU AI Act, Article 50, AI transparency, AI register, release]
---

Witness Pro 0.7.0 is out. It is a Pro release: the free packages `@sweberdev/witness` and `@sweberdev/witness-react` stay at 0.4.0.

## What is in 0.7.0

- **The scan tells the register what it missed.** `witness-scan` now lists the pages where it found AI use: a chatbot notice, an element marked as AI-generated, an AI image or an AI audio or video file shown. `witness-report suggest --scan witness-scan.json` compares that list with the pages your register names and drafts a system for each gap, with the pages filled in. `--write` adds the drafts to the register, and you complete purpose, role and vendor. `witness-report check --scan` prints a warning per uncovered page, so a CI job notices when a new AI feature ships without a register entry.
- **A change log for the register.** `witness-report history record --note "Added the image generator"` writes what was added, removed or changed since the last record, with the names of the fields, to `witness.register-history.json`. `check --history` warns about unrecorded changes. `build --history` adds the log to the client report, in English, German, French or Italian.
- **PDF-ready report.** The HTML client report has print rules: page margins, table headers that repeat, no broken rows. Print it from the browser and save it as PDF.

```sh
npx witness-scan out --json witness-scan.json
npx witness-report suggest --scan witness-scan.json --write
npx witness-report history record --note "Reviewed after scan"
npx witness-report build --history witness.register-history.json --scan witness-scan.json --out reports/ai-report.html
```

The scan only sees what is on the page. It cannot know that a text came from a model unless you mark it, so a register can still be incomplete and the drafts are a starting point, not an assessment. See the [report docs](/witness/docs/pro/report) and the [scanner docs](/witness/docs/pro/scan), and the [Witness page](/witness) for the Pro edition.
