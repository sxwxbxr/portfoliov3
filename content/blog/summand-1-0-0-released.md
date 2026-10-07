---
title: "Summand 1.0.0 released"
excerpt: "Summand 1.0 is the stable release of the e-invoice validator for TypeScript: EN 16931, XRechnung and ZUGFeRD without Java, a SemVer-stable API and CLI exit codes that follow the usual convention."
date: 2026-10-07
author: Seya Weber
type: release
packages: [summand]
tags: [Summand, E-invoicing, XRechnung, ZUGFeRD, EN 16931, release]
---

Summand 1.0.0 is out. `@sweberdev/summand` 1.0.0 is on npm under the MIT licence. From this version on, the public API follows SemVer.

## What 1.0 means

- **A stable API.** Every export has documentation and is guarded by a snapshot test. Breaking changes only come in a major version. Internals marked `@beta` (the Schematron compiler and the XPath engine) are the exception and may change in a minor release.
- **Rule set updates are minor releases.** New CEN or KoSIT rule sets ship as a minor version, never a patch, and the changelog lists the rule set versions and every verdict that changed. `summand rules --check` tells you when a newer rule set exists.
- **Documented errors.** All `SUM-` codes and exit codes are explained in the error code catalogue, and tests keep it in sync with the code.

## One breaking change: exit codes

The `summand` command now follows the convention used by ESLint and most linters:

| Exit code | Meaning |
|---|---|
| 0 | Everything is valid |
| 1 | An invoice is invalid, or a warning counted with `--warnings-as-errors` |
| 2 | The command could not run: wrong flags, unreadable file |
| 3 | `rules --check --fail-on-outdated` found a newer rule set |

Before, exit code 1 meant both "invalid invoice" and "command failed". If a script tests for `== 1`, it now also needs to handle 2. The migration guide has a short script example. The `--json` output did not change.

## What is in 1.0

EN 16931 (CEN 1.3.16) and XRechnung (KoSIT 2.6.0) with XML Schema and Schematron checks for UBL and CII, German and English messages, ZUGFeRD and Factur-X PDFs, Leitweg-ID check, rule set information, and validation of invoices with 1,000 lines in about half a second. It runs in Node, browsers, workers and edge runtimes, with no Java.

## Next

Peppol BIS Billing rules are built and wait for written permission from OpenPeppol; they will arrive in a minor release. Summand Pro 1.0 follows after its mail intake and export have been tested against real mailboxes and accounts.

Upgrade with `pnpm add @sweberdev/summand@latest`. See the [Summand page](/summand) and the migration guide in the docs.
