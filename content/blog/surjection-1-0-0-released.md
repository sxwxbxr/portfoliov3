---
title: "Surjection 1.0.0 released"
excerpt: "Stable API, stable file formats, a stability promise and a migration guide: Surjection and Surjection Pro are at 1.0."
date: 2026-10-07
author: Seya Weber
type: release
packages: [surjection]
tags: [Surjection, Accessibility, WCAG 2.2, "1.0", release]
---

Surjection and Surjection Pro are at 1.0.0. Since the first release on 5 October the toolkit grew from axe-core in Playwright to a complete workflow for agencies: checks that axe-core cannot do, reports with evidence, history across clients and the manual checklist. 1.0 does not add features. It adds a promise.

## What is stable

From 1.0.0 these follow [semantic versioning](https://semver.org): the documented exports of `@sweberdev/surjection` (and its `/playwright`, `/vitest` and `/node` entries), every documented command line option and exit code, the fields of `surjection.config.json` (with its JSON schema), the format of the results, baseline and checklist files, and the ids of Surjection's own rules. Within 1.x none of it is removed. Breaking changes wait for 2.0 and come with a migration guide. The [Stability and versioning](https://packages.sweber.dev/surjection/docs/reference/stability) page lists what is covered and what is not.

Two things can still change in a minor version, and the page says so openly: which problems the checks find, because axe-core is updated and finds more, and the texts of reports and translations. Pin the version in CI and use a baseline if you need identical results.

## What 1.0 contains

**Free (`@sweberdev/surjection`):** axe-core checks for Playwright, Vitest and the command line with WCAG 2.2 and EN 301 549 mapping; our own checks for keyboard (focus trap, visible focus, focus order), reflow at 320 px and text spacing; pages in other states through click steps; dark mode and reduced motion; screenshots and before/after images; baseline for existing sites; Markdown, JSON, JUnit and SARIF output; the accessibility statement in five languages, derived from the checklist if you like; a JSON schema for the config.

**Pro (`@weber-development/surjection-*`):** the client report as HTML, PDF and Word in German, Swiss German, English, French and Italian, with screenshots and a "fixed since the last report" section; history and dashboard across all clients with filter and badges; monitoring that notifies by webhook or mail; the guided manual checklist for the 55 criteria in five languages with evidence and reviewer. Prices stay as they are, see the [package page](https://packages.sweber.dev/surjection).

## Upgrade

```bash
pnpm add -D @sweberdev/surjection@^1.0.0
```

There is no breaking change compared with 0.9. The [upgrade guide](https://packages.sweber.dev/surjection/docs/guides/upgrade-1-0) lists what each 0.x release added in case you come from an older version. Pro customers update the three `@weber-development` packages to 1.0.0 together.

Automated tests find only part of all barriers. A passing run is no proof of conformance, and Surjection does not promise conformity with WCAG, EN 301 549, the European Accessibility Act or the BFSG.
