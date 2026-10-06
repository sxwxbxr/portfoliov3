---
title: "Summand Pro 0.6.0 released"
excerpt: "Summand Pro now checks every invoice against the purchase order and the goods receipt: quantities, prices, VAT and totals, with tolerances you set and a clear finding for every difference."
date: 2026-10-06
author: Seya Weber
type: release
packages: [summand]
tags: [Summand, Summand Pro, E-invoicing, purchase orders, three-way match, accounts payable, release]
---

Summand Pro 0.6.0 is out. The new package `@weber-development/summand-match` and version 0.6.0 of `summand-read`, `summand-view`, `summand-write` and `summand-inbox` are on GitHub Packages for licence holders.

## Why

A valid e-invoice is not yet a correct invoice. It can be perfectly formed and still bill 12 pieces when 10 were ordered, or a price that went up by 8 percent. Accounts payable teams check this by hand, line by line. With 0.6.0 Summand does the check and says exactly what differs.

## What is new in 0.6.0

**`summand-match`.** `matchInvoice(invoice, order)` compares an invoice with its purchase order and returns a report with a status (`match`, `within-tolerance` or `mismatch`) and a finding for every difference.
- **Explainable pairing.** Invoice lines are paired with order lines by the order line reference, then by article number, then by exact description. Pairing by similarity is opt-in and always flagged. A line that cannot be paired safely is reported, never guessed.
- **What is compared.** Quantity, unit, unit price, line total, VAT rate, document totals, currency, seller and the order reference.
- **Tolerances you set.** For price, quantity and total, as a percentage or an absolute amount. A difference exactly at the limit counts as within tolerance. All calculations are exact decimal arithmetic.
- **Partial invoices.** Allow an invoice to cover only part of an order, and see per order line what was ordered, invoiced and what is still open. `matchInvoices()` adds up several invoices against one order and flags over-invoicing.
- **Three-way match.** Pass a goods receipt and Summand flags invoices for more than was received.
- **Stable codes.** 22 finding codes such as `MATCH-PRICE`, `MATCH-QTY-OVER` and `MATCH-UNMATCHED-LINE`, with messages in German and English.
- **Orders from files.** `readPurchaseOrder()` reads JSON and CSV, with German or English headers and decimal comma or point. Errors name the line and column.

```ts
import { readInvoice } from "@weber-development/summand-read";
import { matchInvoice, readPurchaseOrder } from "@weber-development/summand-match";

const report = matchInvoice(readInvoice(xml), readPurchaseOrder(orderJson), {
  priceTolerance: "1%",
  lang: "de",
});
report.status; // "mismatch"
report.findings[0]; // { code: "MATCH-QTY-OVER", expected: "10", actual: "12", … }
```

**From the command line.** `summand-inbox match incoming --orders orders --receipt receipts --tolerance-price 1% --report match.html` finds the order of every invoice by its order reference and writes a JSON, HTML or CSV report. The exit code tells your pipeline whether to stop. With an audit log, the result goes into the hash-chained record of each file.

Not covered: partial deliveries across many orders, price lists, scanned invoices and ERP connections.

## Next

Rule-set updates with notifications, and an export to Lexoffice and sevDesk. The free package gets the Peppol BIS rules once their licence is cleared.

Licence holders upgrade with `pnpm add @weber-development/summand-match@latest`. New to Summand Pro? See [pricing and licences](/summand).
