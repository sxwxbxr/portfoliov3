---
title: "Surjection 2.0 released"
excerpt: "Flows, a coverage table and component checks in the free package; the WCAG-EM conformance report, an ACR export and re-tests in Pro. Results files move to version 2."
date: 2026-10-12
author: Seya Weber
type: release
packages: [surjection]
tags: [Surjection, Accessibility, WCAG 2.2, "2.0", release]
---

Surjection and Surjection Pro are at 2.0.0. The free package learns to check whole user journeys and single components and says openly which WCAG criteria it can and cannot test. Pro turns the manual checklist into the documents clients and procurement teams ask for: a WCAG-EM conformance report and an Accessibility Conformance Report (ACR).

## What is new

**Free (`@sweberdev/surjection`)**

- **Flows.** A journey such as cart, address, payment is described once in the config. The page is checked after every `{ "check": "<label>" }` step and each check is its own page in reports, history and baseline (`#flow:checkout:address`). See [Flows](https://packages.sweber.dev/surjection/docs/guides/flows).
- **`surjection coverage`.** Lists which of the 55 WCAG 2.2 A/AA criteria are tested mostly, partly or not at all by automated rules, derived from the installed axe-core version and our own checks. Today that is 11 mostly automatic, 16 partly automatic and 28 manual only. The point is to plan manual testing, not to look good: [Coverage](https://packages.sweber.dev/surjection/docs/guides/coverage).
- **Component checks.** `@sweberdev/surjection/component` checks a single component in a Storybook play function or a Testing Library test, without page-level rules: [Testing components](https://packages.sweber.dev/surjection/docs/guides/components).
- **Results format version 2.** Every finding gets a stable `id`, and the file records the tool version and how the run was configured: [Results format](https://packages.sweber.dev/surjection/docs/reference/results-format).

**Pro (`@weber-development/surjection-*`)**

- **WCAG-EM conformance report** as HTML, PDF and Word in five languages: scope, sample of pages, outcome per success criterion (passed, failed, cannot tell, inapplicable) with the EN 301 549 clause, evidence and remarks. If the checklist says "pass" but automated tests found affected elements, the report shows "cannot tell" and lists the conflict instead of hiding it.
- **ACR export** with the usual conformance levels (Supports, Partially Supports, Does Not Support, Not Applicable, Not Evaluated) in an own structure. It is not an official VPAT and uses no template or logo of the Information Technology Industry Council.
- **Re-test.** `surjection-history retest` builds a config with only the pages, states and flows that had findings, `merge` puts the new results into the old ones, and `surjection-checklist retest` sets criteria whose automated issues are gone back to "untested" so a person confirms the fix.
- **A maintained mapping** of WCAG 2.2 criteria to EN 301 549 clauses. Criteria that exist only in WCAG 2.2 have no clause in EN 301 549 V3.2.1 and are marked as such. Every report names the mapping version.

The [live demo](https://packages.sweber.dev/surjection/demo) shows the coverage table and an example conformance report and ACR.

## Breaking changes

1. **Node 22 or newer.** Node 20 is end of life.
2. **Results files are `version: 2`.** Nothing was removed, but `tool`, `run` and an `id` per element were added. Code that checks `version === 1` must accept 2. Version 1 files are still read.
3. **Baselines are `version: 2`**, with entries `{ id, page, rule, target, note? }`. A baseline of version 1 is still read.
4. **`fingerprints(page)` returns the new ids** instead of `<path>|<rule>|<target>` strings.
5. **The `ResultsFile` type** has `version: 2` and a required `tool`.

There were no deprecated exports in 1.x, so nothing else was removed.

## Upgrading

```bash
pnpm add -D @sweberdev/surjection@^2.0.0
npx surjection convert results.json --out results.json
npx surjection convert surjection-baseline.json --out surjection-baseline.json
```

The two `convert` calls are optional because version 1 files are read as they are. Pro customers update the three `@weber-development` packages to 2.0.0 together; Pro 1.0.1 and newer already read results of version 2, so you can update Pro first. The [migration guide](https://packages.sweber.dev/surjection/docs/guides/migrating-to-2) lists everything in detail.

Version 1.x gets security and bug fixes for 12 months after today. Prices and licences stay as they are, see the [package page](https://packages.sweber.dev/surjection).

## What is not verified

The French and Italian texts of the conformance report are not reviewed by native speakers. The ACR and the conformance report are documents of an evaluation, not legal advice: Surjection does not promise conformity with WCAG, EN 301 549, the European Accessibility Act or the BFSG, and automated tests find only part of all barriers.
