---
title: "Summand 2.0 released"
excerpt: "Summand 2.0 removes what 1.x deprecated, requires Node.js 22 and documents the shape of every finding. No new rules and no new verdicts: the same invoice gives the same result as in 1.1."
date: 2026-10-12
author: Seya Weber
type: release
packages: [summand]
tags: [Summand, Summand Pro, E-invoicing, XRechnung, ZUGFeRD, release]
---

Summand 2.0.0 is out: `@sweberdev/summand` on npm and `@weber-development/summand-read`, `view`, `inbox`, `write` and `match` 2.0.0 on GitHub Packages for licence holders. Prices and licences do not change.

2.0 is a clean-up release. It adds no rules and changes no verdict: the same invoice gives the same result as in 1.1 with the same options. What it does is remove the old names, so the API stays small for the years after.

## Breaking changes

- **`xrechnung` is gone.** The option and the CLI flag `--xrechnung` are replaced by `ruleSets: ["en16931", "xrechnung"]` and `--rule-sets en16931,xrechnung`. The result is identical. If an `xrechnung` option is left in your JavaScript code, `validateInvoice` returns the error `SUM-RULESET` instead of quietly running fewer rules. TypeScript reports it at compile time.
- **Node.js 22 or newer.** CI runs on 22 and 24.
- **Deprecated exports removed:** the `CheckOptions` alias, the second argument of `ruleSetsFor`, the code `SUM-DEPRECATED`. In Pro, `export --from/--to` and `PdfOptions.report` are removed.
- **Pro:** the inbox commands now take `--rule-sets`; `--xrechnung` stays as a shortcut for it.

## What is stable now

Every finding carries `id`, `severity` and `ruleSet`. The `id` is an upstream rule ID or a `SUM-` code that is never renamed or reused. The contract is in the error-code reference and covered by a test.

## Upgrading

1. Update to Node.js 22 or newer.
2. Search your code and scripts for `xrechnung` and replace it with `ruleSets` / `--rule-sets`.
3. Update the packages. Pro 2.0 needs the free validator `^2.0.0`.

The migration guides have before/after code. Free validator 1.x users stay on Summand Pro 1.x; we plan fixes for 1.x for 12 months.

## What 2.0 does not include

- **Peppol** waits for written permission from OpenPeppol.
- **Factur-X EXTENDED Schematron** is not bundled, because we could not confirm the licence of the files we could reach.
- **Still beta and not verified against live systems:** Lexoffice and sevDesk export, mail intake, and the approval workflow and archive. The archive has not been reviewed by a tax advisor.
