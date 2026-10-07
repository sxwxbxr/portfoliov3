---
title: "Summand 0.9.0 released: the release candidate for 1.0"
excerpt: "Summand 0.9.0 documents every error code, guards its public API with tests, adds a stability policy and migration notes, and is the last step before 1.0."
date: 2026-10-07
author: Seya Weber
type: release
packages: [summand]
tags: [Summand, E-invoicing, XRechnung, ZUGFeRD, EN 16931, API, release]
---

Summand 0.9.0 is out. `@sweberdev/summand` 0.9.0 is on npm under the MIT licence. It is the release candidate for 1.0: from 1.0 on, the public API follows SemVer.

## What is new in 0.9.0

**Every public export is documented and guarded.** Each function, type and option has TSDoc, the API reference lists exactly what the package exports, and a snapshot test fails when an export, a CLI flag or an exit code changes by accident.

**Error code catalogue.** All eight `SUM-` codes (`SUM-XML`, `SUM-FORMAT`, `SUM-PDF`, `SUM-XSD`, `SUM-PROFILE`, `SUM-EXTENDED`, `SUM-LEITWEG`, `SUM-PDF-LEVEL`) and the exit codes 0, 1 and 3 are explained with meaning, cause and fix. A test fails if the code and the catalogue drift apart.

**Stability policy.** The migration guide states what 1.0 will promise: rule set updates ship as a minor release, never a patch, and the changelog lists the rule set versions and any verdict changes. Message wording and message order are not covered by SemVer; code ids, severities and the `--json` shape are.

**Two tiers.** Internals such as the Schematron compiler and the XPath engine are marked `@beta` and may still change in a minor release. Everything else is stable.

**Small additions.** `summand --version`, `validate --no-leitweg`, and the exported `DetectionError` type. `CheckOptions` is now `RuleSetCheckOptions`; the old name stays as a deprecated alias until 2.0.

## Next

Summand 1.0 follows once the Pro packages have had the same review. Upgrade with `pnpm add @sweberdev/summand@latest`. See the [migration guide](/summand/docs) and the [Summand page](/summand).
