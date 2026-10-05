---
title: "Summand 0.1.0 released"
excerpt: "Validate XRechnung, ZUGFeRD and Factur-X e-invoices against the official EN 16931 and XRechnung rules in pure TypeScript: in Node, the browser and at the edge, without Java."
date: 2026-10-05
author: Seya Weber
type: release
packages: [summand]
tags: [Summand, E-invoicing, XRechnung, ZUGFeRD, Factur-X, EN 16931, TypeScript, release]
---

Summand 0.1.0 is out. It validates e-invoices against the official EN 16931 and XRechnung rules, in pure TypeScript. `@sweberdev/summand` is on npm under the MIT licence.

## Why

Since 1 January 2025 every business in Germany must be able to receive e-invoices, and from 2027 most have to send them. An e-invoice is XML: XRechnung in UBL or CII syntax, or a ZUGFeRD / Factur-X PDF with the XML embedded. Whether such an invoice is correct is decided by a few hundred business rules, published as Schematron by CEN and KoSIT. Running them has so far meant the KoSIT validator: Java, Saxon and a server next to your application.

Summand runs the same rules where your code already runs: in a Node backend, a serverless or edge function, the browser before an upload, or CI.

## What is in 0.1.0

- Its own XPath 2.0 and Schematron engine in TypeScript, with exact decimal arithmetic so that sums of amounts are compared without rounding errors.
- The official rule sets: CEN EN 16931 1.3.16 for UBL and CII, and KoSIT XRechnung 2.6.0 for XRechnung 3.0, including the severity changes KoSIT applies for the standard, extension and CVD profiles.
- All 1'142 CEN rule tests and every invoice of the KoSIT test suite pass.
- UBL Invoice, UBL Credit Note and CII are detected automatically, as are the profiles XRechnung, Peppol BIS, EN 16931 and Factur-X MINIMUM, BASIC WL, BASIC and EXTENDED.
- ZUGFeRD and Factur-X PDFs: Summand reads the embedded XML and compares the profile in the PDF metadata with the one in the XML.
- A Leitweg-ID check with the ISO 7064 check digits, because a typo there gets an invoice to a public buyer rejected.
- Every finding with rule ID, message, XPath and line, and a summary of the invoice with number, parties and totals.
- The `summand` CLI to validate files, extract the XML from a PDF and check Leitweg-IDs.

Summand does not check the XML schemas (XSD) yet, so it does not replace the KoSIT validator in every case. It checks invoices technically; it is not tax advice.

## Install

```bash
pnpm add @sweberdev/summand
```

```ts
import { validateInvoice } from "@sweberdev/summand"

const result = validateInvoice(bytes) // XML string, XML bytes or a ZUGFeRD PDF

if (!result.valid) {
  for (const e of result.errors) console.log(e.id, e.message, e.line)
}
```

Or from the command line:

```bash
npx @sweberdev/summand validate invoice.pdf
```

Drop your own invoice into the [live demo](https://packages.sweber.dev/summand/demo): it runs the real package in your browser, and nothing is uploaded. The full reference is at [packages.sweber.dev/summand/docs](https://packages.sweber.dev/summand/docs).

## Summand Pro

Summand Pro is for teams that process incoming invoices. `summand-read` turns any invoice, UBL or CII, XML or PDF, into one typed object with all EN 16931 business terms. `summand-view` renders it as readable, printable HTML in German or English with the validation report. `summand-inbox` validates whole folders, writes JSON, CSV, JUnit and HTML reports, finds duplicates across runs and keeps an audit log with the SHA-256 of every file. The [demo](https://packages.sweber.dev/summand/demo#pro) shows their output for a few sample invoices. Licences start at 19 CHF a month for one person; see the [package page](https://packages.sweber.dev/summand) for all plans.
