---
title: "Summand Pro 0.4.0 released"
excerpt: "Summand Pro now writes a proper A4 PDF of every invoice: PDF/A-3b, selectable text, page numbers, the validation report and the original XML attached, so CII invoices stay valid ZUGFeRD files."
date: 2026-10-06
author: Seya Weber
type: release
packages: [summand]
tags: [Summand, Summand Pro, E-invoicing, XRechnung, ZUGFeRD, PDF/A-3, release]
---

Summand Pro 0.4.0 is out. `@weber-development/summand-read`, `summand-view` and `summand-inbox` 0.4.0 are on GitHub Packages for licence holders.

## Why

The HTML view of an invoice is fine on screen, but archives, tax advisors and approval workflows want a file. Until now that meant opening the view in a browser and printing it. With 0.4.0 Summand Pro writes the PDF itself, without a headless browser.

## What is new in 0.4.0

**A real A4 PDF of every invoice.** `invoiceToPdf()` from `@weber-development/summand-view/pdf` renders the same content as the HTML view: seller and buyer, references, the line items, allowances and charges, the VAT breakdown, totals, payment details, notes and the validation report.
- Long invoices break across pages with the table header repeated on every page, and every page has a footer with "Seite X von Y" (or "Page X of Y").
- The text stays selectable and searchable. German umlauts, ß and the euro sign are covered by an embedded font.
- The output is PDF/A-3b, checked with veraPDF on all of our sample invoices.
- The original XML is attached to the PDF. For CII invoices (ZUGFeRD, Factur-X, XRechnung CII) the PDF is a valid ZUGFeRD carrier again. UBL invoices get the XML attached too, but UBL cannot be ZUGFeRD.

```ts
import { invoiceToPdf } from "@weber-development/summand-view/pdf";

const pdf = await invoiceToPdf(xml, { lang: "de" });
```

**PDFs from the command line.** `summand-inbox incoming --pdf pdfs --lang de` writes one PDF for every valid, non-duplicate invoice. A PDF never replaces one of the files that were checked.

The PDF is a view of the invoice, not the issuer's own layout. The XML stays the binding document, and the footer says so.

## Next

Summand Pro will be able to write e-invoices, not only read them. The free package is getting the Peppol BIS Billing rules once their licence is cleared.

Licence holders upgrade with `pnpm add @weber-development/summand-view@latest`. New to Summand Pro? See [pricing and licences](/summand).
