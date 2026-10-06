---
title: "Summand 0.4.0 released"
excerpt: "See which EN 16931 and XRechnung rule set versions you validate against, check for newer releases, and validate invoices with 1,000 lines up to 72 times faster."
date: 2026-10-06
author: Seya Weber
type: release
packages: [summand]
tags: [Summand, E-invoicing, XRechnung, ZUGFeRD, EN 16931, performance, release]
---

Summand 0.4.0 is out. `@sweberdev/summand` 0.4.0 is on npm under the MIT licence.

## Why

An e-invoice validator is only as good as its rule set, and rule sets change. Auditors and accountants ask "which version did you check against?", and until now the answer lived in the documentation. Large invoices were also slower than they should be.

## What is new in 0.4.0

**Rule set information.** `ruleSetInfo()` lists every bundled rule set with name, version, upstream release, publisher, source, licence and number of rules. The same data is in `result.ruleSets` of every validation, so it can go into your audit log. The CLI prints it with `summand rules`, or as JSON with `--json`.

**Check for newer releases.** `summand rules --check` asks the public GitHub release lists whether CEN EN 16931 and KoSIT XRechnung have published something newer, and prints `up to date`, `newer release available: <tag>` or `could not check: <reason>`. Nothing is downloaded and nothing about your invoices is sent. `--fail-on-outdated` makes the exit code 3 for use in CI. In code, use `checkRuleSets()` from `@sweberdev/summand/rules-check`, a separate entry point that does not grow browser bundles. The repository also runs the check weekly.

**Much faster on large invoices.** Measured on one 4-core machine, median of five runs:

| Invoice | Before | After |
|---|---|---|
| UBL XRechnung, 1,000 lines | 6.0 s | 0.7 s |
| CII XRechnung, 1,000 lines | 29.8 s | 0.4 s |
| UBL XRechnung, 5,000 lines | stack overflow | 4.6 s |
| CII XRechnung, 5,000 lines | stack overflow | 2.5 s |

Results and messages are unchanged: old and new versions gave byte-identical output on 639 test documents. Typical invoices with a few lines were never slow and change little. Method and all numbers are in the performance guide, and `pnpm bench` repeats the measurement.

## Next

Peppol BIS Billing rules are built and wait for written permission from OpenPeppol. After that come rule set version selection and an API review on the way to 1.0.

Upgrade with `pnpm add @sweberdev/summand@latest`. See the [Summand page](/summand).
