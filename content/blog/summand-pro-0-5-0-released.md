---
title: "Summand Pro 0.5.0 released"
excerpt: "Summand Pro can now write e-invoices, not only read them: XRechnung and EN 16931 as UBL or CII from a typed invoice object, always checked with Summand, plus ZUGFeRD PDFs and a convert command."
date: 2026-10-06
author: Seya Weber
type: release
packages: [summand]
tags: [Summand, Summand Pro, E-invoicing, XRechnung, ZUGFeRD, UBL, CII, release]
---

Summand Pro 0.5.0 is out. The new package `@weber-development/summand-write` and version 0.5.0 of `summand-read`, `summand-view` and `summand-inbox` are on GitHub Packages for licence holders.

## Why

Since 1 January 2025 every German business has to be able to receive e-invoices, and sending them follows. Most invoice software writes the XML and hopes for the best. Summand already knew how to find every problem in an e-invoice. With 0.5.0 it uses that knowledge on the way out: an invoice you write is checked before it leaves your code.

## What is new in 0.5.0

**`summand-write`.** `writeInvoice()` turns a typed `Invoice` object into XRechnung 3.0 or EN 16931 as UBL 2.1 (Invoice and CreditNote) or CII D16B.
- The output is checked with Summand. If the invoice has errors, `writeInvoice()` throws and tells you which, unless you ask for it anyway.
- The writer is the exact inverse of the reader. After writing, Summand reads the XML back and compares it with your input. A value the target syntax cannot carry throws an error; nothing is dropped silently.
- `computeTotals()` calculates the line amounts, the VAT breakdown and the document totals from your lines, with exact decimal arithmetic and correct rounding. It is off by default, so your own numbers are used as given.
- `writeInvoicePdf()` produces a ZUGFeRD / Factur-X PDF with the CII XML attached.

```ts
import { readInvoice } from "@weber-development/summand-read";
import { writeInvoice } from "@weber-development/summand-write";

const invoice = readInvoice(ublXml);
const { xml, ok } = writeInvoice(invoice, { syntax: "cii", profile: "xrechnung" });
```

**Converting from the command line.** `summand-inbox convert invoice.xml --to cii --profile xrechnung -o invoice-cii.xml` reads an invoice, writes it in the other syntax and checks it.

**How well it works.** We read, wrote, checked and read back every sample invoice we have: 86 of 86 round trips in the same syntax, 86 of 86 across UBL and CII, and 42 of 42 conversions between the XRechnung and EN 16931 profiles. Two limits are worth knowing: UBL cannot carry an order line reference without an order number, and some CII details have no UBL place. In those cases the writer says so instead of guessing.

Peppol envelopes, the other ZUGFeRD profiles and extensions are not covered yet.

## Next

Matching invoices against purchase orders, and keeping the rule sets up to date with notifications. The free package gets the Peppol BIS rules once their licence is cleared.

Licence holders upgrade with `pnpm add @weber-development/summand-write@latest`. New to Summand Pro? See [pricing and licences](/summand).
