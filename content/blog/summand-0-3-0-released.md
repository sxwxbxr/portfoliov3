---
title: "Summand 0.3.0 released"
excerpt: "Summand now checks the official XML Schema of every invoice before the business rules, like the KoSIT validator: UBL 2.1 and UN/CEFACT CII D16B, in pure TypeScript and in under a millisecond."
date: 2026-10-06
author: Seya Weber
type: release
packages: [summand]
tags: [Summand, E-invoicing, XRechnung, ZUGFeRD, EN 16931, XSD, XML Schema, release]
---

Summand 0.3.0 is out. `@sweberdev/summand` 0.3.0 is on npm under the MIT licence.

## Why

The KoSIT validator checks an e-invoice in two steps. First it checks the XML Schema (XSD): are the elements in the right order, are required elements there, is a date a date and an amount a number. Only then does it run the business rules. Until now Summand did only the second step. An invoice with an element in the wrong place could pass Summand and still be rejected by a public buyer's portal. With 0.3.0 Summand does both steps.

## What is new in 0.3.0

- **XML Schema validation.** Every invoice is checked against the official schema of its syntax before the rules: OASIS UBL 2.1 for Invoice and Credit Note, UN/CEFACT CII D16B for ZUGFeRD, Factur-X and XRechnung CII. These are the versions EN 16931 1.3.16 and XRechnung 3.0 use.
- **Clear findings.** Unexpected, missing, misplaced and repeated elements, missing or unknown attributes, and values that are not valid dates, amounts or codes. Each finding is an error with the id `SUM-XSD`, the XPath and the line, in English or German.
- **Both steps in one result.** The rules still run when the schema check fails, so you see all problems at once instead of fixing one layer after the other.
- **Same verdicts as KoSIT.** We compared the schema check with Xerces, the engine the KoSIT validator uses, on more than 4,000 documents: all test invoices plus thousands of deliberately broken variants. The valid or invalid verdict was the same for every one.
- **Small and fast.** The schemas are compiled into about 14 KB of gzipped data. The check takes well under a millisecond for a typical invoice, in Node and in the browser.

```ts
import { validateInvoice } from "@sweberdev/summand";

const result = validateInvoice(xml, { lang: "de" });
result.schemas;    // [{ id: "ubl-2.1", name: "OASIS UBL 2.1 Invoice and CreditNote schema", … }]
result.errors[0];  // { id: "SUM-XSD", message: 'Wert "05.10.2026" von cbc:IssueDate ist kein gültiges Datum (JJJJ-MM-TT).', … }
```

Pass `schema: false`, or `--no-schema` in the CLI, to skip the check. `validateSchema()` runs the schema check on its own.

## Try it

The [live demo](/summand/demo) now lists the XML Schema it checked next to the rule sets. Drop in your own invoice to see both steps.

## Next

Summand Pro will read invoices straight from a mailbox (IMAP and Microsoft 365), and the free package will get the Peppol BIS Billing rules.

Upgrade with `pnpm add @sweberdev/summand@latest`. The [docs](/summand/docs) have a new guide on the schema check.
