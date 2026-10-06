---
title: "Surjection 0.3.0 released"
excerpt: "A keyboard check for focus traps and missing focus indicators, checks behind a login, and status badges per client project in Surjection Pro."
date: 2026-10-06
author: Seya Weber
type: release
packages: [surjection]
tags: [Surjection, Accessibility, WCAG 2.2, Keyboard, release]
---

Surjection 0.3.0 is out. axe-core looks at a page as it is, but two of the most common barriers only show up when someone actually uses the keyboard. This release presses Tab for you.

## What is new in 0.3.0

- **Keyboard check.** `--keyboard` presses Tab through every page and reports two things axe-core cannot test: focus traps, where focus cycles inside a dialog or widget and never reaches the rest of the page (WCAG 2.1.2), and elements that look the same with and without focus (WCAG 2.4.7). The findings work like all others: in every report, with `--fail-on` and in the baseline.
- **Pages behind a login.** `--storage-state auth.json` checks customer accounts, checkouts and intranets with a saved Playwright session.
- **In Playwright tests** the same check is `expectAccessible(page, { keyboard: true })` or `checkKeyboard(page)` on its own.

```bash
npx playwright codegen --save-storage=auth.json https://preview.example.ch/login
npx surjection check --base-url https://preview.example.ch / /konto --keyboard --storage-state auth.json
```

The guide [Keyboard and login](https://packages.sweber.dev/surjection/docs/guides/keyboard) explains both rules, how to fix them and where a manual check is still needed.

## Surjection Pro: status badges

`surjection-history` 0.3.0 writes a status badge per client project: the open issues after the latest run, red for critical or serious, orange for moderate and green when nothing was found. The badge has a text alternative and enough contrast. Put it in a README, the client portal or a status page.

```bash
npx surjection-history badge --out-dir badges
```

You can see the badges for three example clients on the [live demo](https://packages.sweber.dev/surjection/demo).

## Upgrade

```bash
pnpm add -D @sweberdev/surjection@^0.3.0
```

Nothing breaks: the keyboard check and the storage state are opt-in. Full reference at [packages.sweber.dev/surjection/docs](https://packages.sweber.dev/surjection/docs).

Automated tests, including the keyboard check, find only part of all barriers. A passing run is no proof of conformance.
