---
title: "Surjection 0.2.0 released"
excerpt: "JUnit reports for GitLab, Azure DevOps and Jenkins, a mobile viewport, surjection init for a ready CI setup, and a CSV fix list in Surjection Pro."
date: 2026-10-05
author: Seya Weber
type: release
packages: [surjection]
tags: [Surjection, Accessibility, WCAG 2.2, CI, release]
---

Surjection 0.2.0 is out. This release is about getting accessibility checks into every pipeline, not only GitHub Actions, and about handing the results to the people who fix them.

## What is new in 0.2.0

- **JUnit report.** `--out-junit a11y.xml` writes one test suite per page and one failed test per rule. GitLab, Azure DevOps and Jenkins show it as regular test results, next to your unit tests.
- **Mobile viewport.** `--viewport mobile` checks the page at 390×844 with touch enabled, `--viewport 1024x768` any other size. Many barriers only appear in the mobile menu or in collapsed layouts.
- **`surjection init`.** One command writes a `surjection.config.json` and a GitHub Actions workflow that checks every pull request and runs once a week. Existing files are never overwritten.

```bash
npx surjection init --base-url https://example.ch --sitemap
npx surjection check --viewport mobile --out-junit a11y.xml
```

In GitLab the JUnit file goes straight into the merge request:

```yaml
accessibility:
  image: node:22
  script:
    - npm i -g @sweberdev/surjection @playwright/test
    - npx playwright install --with-deps chromium
    - surjection check --config surjection.config.json --out-junit a11y.xml
  artifacts:
    when: always
    reports:
      junit: a11y.xml
```

## Surjection Pro: fix list as CSV

`surjection-report` 0.2.0 writes a fix list for Excel in addition to the branded report: one row per affected element with page, rule, impact, WCAG and EN 301 549 criteria, selector and what to do, plus empty Status and Note columns. Send it to the developers, track progress in the sheet and keep the PDF report for the client.

```bash
npx surjection-report --results a11y.json --locale de --out massnahmen.csv
```

The file uses semicolons and a BOM, so Excel in Germany, Austria and Switzerland opens it directly with umlauts intact. There is an example on the [live demo](https://packages.sweber.dev/surjection/demo).

## Upgrade

```bash
pnpm add -D @sweberdev/surjection@^0.2.0
```

Nothing breaks: all new options are opt-in. The full reference is at [packages.sweber.dev/surjection/docs](https://packages.sweber.dev/surjection/docs).

As before, automated tests find only part of all barriers. A passing run is no proof of conformance.
