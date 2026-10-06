---
title: "Summand Pro 0.2.0 released"
excerpt: "Summand Pro now watches your inbox folder, sorts every new e-invoice into valid, invalid and duplicate, and exports valid purchase invoices as a DATEV booking batch for your tax advisor."
date: 2026-10-06
author: Seya Weber
type: release
packages: [summand]
tags: [Summand, Summand Pro, E-invoicing, XRechnung, ZUGFeRD, DATEV, bookkeeping, release]
---

Summand Pro 0.2.0 is out. `@weber-development/summand-read`, `summand-view` and `summand-inbox` 0.2.0 are on GitHub Packages for licence holders.

## Why

Checking a folder of invoices once is useful. What bookkeepers really want is a folder that checks itself: an invoice arrives by mail or download, gets validated, lands in the right place, and the valid ones go on to the tax advisor without typing them in again. Summand Pro 0.2.0 covers both steps.

## What is new in 0.2.0

**A watched inbox folder.** `summand-inbox watch <folder>` (or `watchInbox()` in your code) checks every XML or PDF invoice as soon as it is completely written, never a half-copied file.
- With `--move` it sorts each file into `valid/`, `invalid/` or `duplicate/`. It never overwrites a file: a second `a.xml` becomes `a-2.xml`.
- Every file goes into the hash-chained audit log, and duplicates of invoices from earlier days are recognised through that log.
- It works with file system events and falls back to polling, on Windows, macOS and Linux.

```bash
npx summand-inbox watch incoming --move --audit-log audit.jsonl
```

**DATEV export.** `--datev buchungsstapel.csv` (or `toDatev()` from `@weber-development/summand-inbox/datev`) writes the valid purchase invoices as a DATEV booking batch (EXTF format 700, Windows-1252), ready for import in DATEV Rechnungswesen.
- One booking per VAT rate of an invoice: the creditor account against the expense account, gross amount, invoice number, date and seller name.
- Tax keys for SKR03 and SKR04: 9 for 19 %, 8 for 7 %, 94 for reverse charge. Credit notes are reversed.
- Creditor accounts can be mapped per supplier by VAT ID or name, and the file name and SHA-256 of each invoice go into the document info, so every booking points back to its file.
- Invalid, unreadable and duplicate invoices are left out and listed with the reason.

```bash
npx summand-inbox incoming --datev buchungsstapel.csv --beraternummer 1001 --mandantennummer 1 --kontenrahmen SKR03
```

The export is a booking proposal. Accounts and tax keys are defaults that your tax advisor should check before the first import; all of them can be changed.

## Try it

The [live demo](/summand/demo#pro) shows the real output of both features for the sample invoices.

## Next

The free package gets XML Schema (XSD) validation next, and Summand Pro will read invoices straight from a mailbox (IMAP and Microsoft 365).

Licence holders upgrade with `pnpm add @weber-development/summand-inbox@latest`. New to Summand Pro? See [pricing and licences](/summand).
