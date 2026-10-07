---
title: "Summand Pro 0.9.0 released: the release candidate for 1.0"
excerpt: "Summand Pro 0.9.0 documents every error code, guards the public API of all five packages with tests, fixes a UBL writer bug and requires Summand 0.9."
date: 2026-10-07
author: Seya Weber
type: release
packages: [summand]
tags: [Summand, Summand Pro, E-invoicing, XRechnung, API, release]
---

Summand Pro 0.9.0 is out. `summand-read`, `summand-view`, `summand-inbox`, `summand-write` and `summand-match` 0.9.0 are on GitHub Packages for licence holders. Version 0.8.0 was skipped on purpose, so that all packages line up with the free Summand 0.9.0.

## What is new in 0.9.0

**A stable API on the way to 1.0.** Every export of the five packages has documentation, a snapshot test fails when an export, a CLI flag or an exit code changes by accident, and the docs list exactly what each package exports. Parts that may still change, such as the Lexoffice and sevDesk export, are marked `@beta`.

**Error code catalogue.** All `MATCH-*` codes, the `SUM-*` codes the packages read, the write errors and the CLI exit codes are explained with meaning and fix, and tests check that code and catalogue match.

**Stability policy and migration notes.** What SemVer will cover from 1.0, what it does not, and how to move from 0.2 to 0.9. Deprecated names keep working until 2.0.

**Bug fix in `summand-write`.** A line with a gross price but no discount produced UBL that failed the XML Schema check. The writer now derives the discount the standard requires, so the output validates. This also fixes `summand-inbox convert` for such invoices.

**Behaviour changes to know about.** Summand Pro now requires `@sweberdev/summand` 0.9 or newer. `--lang` accepts only `de` or `en` and exits with code 2 otherwise, where it used to treat any other value as German. `export --from/--to` are now `--issued-from/--issued-to`; the old flags still work.

## Next

Summand 1.0, with the free and Pro packages released together. Licence holders upgrade with `pnpm add @weber-development/summand-inbox@latest`. See [pricing and licences](/summand).
