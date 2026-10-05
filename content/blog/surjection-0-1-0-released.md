---
title: "Surjection 0.1.0 released"
excerpt: "Accessibility checks for Playwright and Vitest, a baseline for existing sites, reports and accessibility statements in five languages. MIT licensed, with a Pro edition for agencies."
date: 2026-10-05
author: Seya Weber
type: release
packages: [surjection]
tags: [Surjection, Accessibility, WCAG 2.2, BFSG, EAA, release]
---

Surjection 0.1.0 is out. It makes accessibility testing part of every project instead of a one-off scan before launch. `@sweberdev/surjection` and `@sweberdev/surjection-react` are on npm under the MIT licence.

Surjection is deliberately not an overlay. It runs in development and CI and helps you fix the code itself. Automated tests find only part of all barriers, so it does not promise legal conformity either.

## What is in 0.1.0

- A Playwright helper and a Vitest matcher on top of axe-core, testing against WCAG 2.2 AA by default.
- Every finding mapped to its WCAG success criterion and the matching EN 301 549 clause.
- A baseline for existing sites: CI fails only on new problems, not on the whole backlog.
- A Markdown report for pull requests and job summaries, in German, Swiss German, French, Italian and English.
- A generator for the accessibility statement (Erklärung zur Barrierefreiheit) in the same five languages, as Markdown and HTML.
- Small accessible React building blocks: skip link, visually hidden text, live announcements and reduced motion.

## Install

```bash
pnpm add -D @sweberdev/surjection
```

Test your most important pages in Playwright:

```ts
import { test } from "@playwright/test"
import { expectAccessible } from "@sweberdev/surjection/playwright"
import baseline from "./a11y-baseline.json"

for (const path of ["/", "/shop", "/checkout"]) {
  test(`${path} is accessible`, async ({ page }) => {
    await page.goto(path)
    await expectAccessible(page, { baseline, failOn: "serious", locale: "de" })
  })
}
```

The full reference is at [packages.sweber.dev/surjection/docs](https://packages.sweber.dev/surjection/docs).

## Surjection Pro

For agencies there is a Pro edition with three packages: client reports in your own branding as HTML and PDF, a history across all client projects that shows progress over time, and a guided checklist for the 55 WCAG 2.2 A and AA criteria that automated tests cannot cover. There is no licence key and no phone-home, and every version you received keeps working after you cancel.

Plans start at CHF 19 per month. You can try the [Pro demo](https://packages.sweber.dev/surjection/demo) and see all plans on the [package page](https://packages.sweber.dev/surjection).
