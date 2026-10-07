---
title: "Summand Pro 0.7.0 released"
excerpt: "Summand Pro can now turn checked e-invoices into voucher payloads for Lexoffice and sevDesk, next to the existing DATEV export."
date: 2026-10-07
author: Seya Weber
type: release
packages: [summand]
tags: [Summand, Summand Pro, E-invoicing, Lexoffice, sevDesk, DATEV, release]
---

Summand Pro 0.7.0 is out. `@weber-development/summand-inbox` 0.7.0 and the other Summand Pro packages are on GitHub Packages for licence holders.

## Why

Not every business works with a tax advisor and DATEV. Many small companies keep their books in Lexoffice or sevDesk and still type received e-invoices in by hand. With 0.7.0 an invoice that passed validation can go straight into those tools.

## What is new in 0.7.0

**Export to Lexoffice and sevDesk.** `summand-inbox export lexoffice` and `summand-inbox export sevdesk` (or `exportLexoffice()` and `exportSevdesk()` in code) take a folder or a list of files and write:
- a JSON file with one voucher body per invoice, shaped for the Lexoffice voucher API and the sevDesk voucher API,
- an overview CSV with one row per VAT rate.

Invalid, unreadable and duplicate invoices are skipped with a reason, exactly like in the DATEV export, and the audit log is respected. Account mapping, categories, tax types, contacts and exchange rates for foreign currencies come from options or a config file. Everything is a pure function: Summand Pro makes no network calls and stores no credentials; you post the payloads with your own API key.

```bash
npx summand-inbox export lexoffice incoming/ \
  --category-id <your-category-uuid> --api-json lexoffice.json --out overview.csv
```

**Please note.** The payload shapes follow the public vendor API documentation as we understand it, but we could not test them against live Lexoffice or sevDesk accounts yet. The README lists every assumption. Try a few vouchers in a test account first, and tell us what you find.

## Next

An API review and error catalogue on the way to 1.0. Licence holders upgrade with `pnpm add @weber-development/summand-inbox@latest`. New to Summand Pro? See [pricing and licences](/summand).
