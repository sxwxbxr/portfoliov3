---
title: "Validating XRechnung and ZUGFeRD without Java: how the KoSIT validator works, and how to do it in TypeScript"
excerpt: "E-invoices must be valid before you send or book them. What the official validator actually does in two steps, why a schema check alone is not enough, and how to run both steps in Node.js, in CI and in the browser."
date: 2026-10-06
author: Seya Weber
type: tutorial
packages: [summand]
tags: [E-invoicing, XRechnung, ZUGFeRD, Factur-X, EN 16931, Schematron, Validation, Tutorial]
---

In Germany every business has to be able to **receive** e-invoices since 1 January 2025. The obligation to **issue** them follows in steps: until the end of 2026 paper and PDF are still allowed for everyone, in 2027 only businesses with a prior-year turnover of up to EUR 800,000 may still use them, and from 1 January 2028 the e-invoice is the rule. (The [IHK overview](https://www.ihk.de/rhein-neckar/recht/steuerrecht/umsatzsteuer/e-rechnungspflicht-5931752) has the details and exceptions.) A plain PDF is no longer an invoice in the sense of the law. A structured file in the European standard EN 16931 is, either as pure XML (XRechnung) or as a PDF with the XML embedded (ZUGFeRD, called Factur-X in France).

For developers this means a new kind of bug: an invoice that your system produces or receives looks fine on screen and is still rejected, by a customer's accounting software, by a public buyer's portal or by your own audit later. The way to find out before they do is to **validate**. This article explains what validation really involves, because most of the confusion comes from not knowing which checks exist.

## Valid in which sense?

An e-invoice can be wrong on four levels, and each needs a different check:

1. **Not well-formed XML.** A parser finds this immediately.
2. **Not valid against the XML Schema (XSD).** Elements in the wrong order or in the wrong place, a missing required element, a misspelt name, a date written as `04.04.2016`, an amount with a comma. No business logic is needed to see this, but a normal XML parser does not check it unless you give it the schema.
3. **Not valid against the business rules.** EN 16931 defines hundreds of rules in Schematron, for example that the invoice total with VAT must equal the total without VAT plus the VAT amount. XRechnung adds German rules on top, such as the mandatory buyer reference (Leitweg-ID for public buyers) or contact details of the seller.
4. **Not consistent as a ZUGFeRD PDF.** The PDF has to contain the XML as an attachment, and the profile declared in the PDF metadata has to match the profile of the XML.

The reference implementation for the first three levels in Germany is the **KoSIT validator**, published by the Koordinierungsstelle für IT-Standards. It works in two steps: first the XSD, then the Schematron rules. Public buyers and many accounting systems effectively use the same rule sets, so "passes KoSIT" is the practical definition of "valid XRechnung".

## Why Schematron is the hard part

Schematron is a rule language that expresses a rule as an XPath expression in a context. A rule from EN 16931 looks like this:

```xml
<assert id="BR-CO-15" flag="fatal"
  test="every $Currency in cbc:DocumentCurrencyCode satisfies
    (count(cac:TaxTotal/xs:decimal(cbc:TaxAmount[@currencyID=$Currency])) eq 1)
    and (cac:LegalMonetaryTotal/xs:decimal(cbc:TaxInclusiveAmount) =
      round((cac:LegalMonetaryTotal/xs:decimal(cbc:TaxExclusiveAmount)
        + cac:TaxTotal/xs:decimal(cbc:TaxAmount[@currencyID=$Currency])) * 10 * 10) div 100)">
  Invoice total amount with VAT (BT-112) = Invoice total amount without VAT (BT-109)
  + Invoice total VAT amount (BT-110).
</assert>
```

The catch: the official rule sets use **XPath 2.0**, not 1.0. The rule above already shows it: an `every ... satisfies` quantifier, `xs:decimal` casts and the `eq` operator. Other rules use sequences, regular expressions with `matches()` and functions such as `distinct-values()`. Most XPath engines available in JavaScript implement 1.0 only, so the standard route is to run the validator on the JVM (the KoSIT validator is a Java application, often started as a daemon or a Docker container).

That is a reasonable choice for a back-office batch. It is a poor fit if your product is a Node.js service, a serverless function, an edge worker or a browser app where a user drops an invoice file and wants an answer immediately. Then you either run a second runtime next to your application or you skip validation.

## The same two steps in TypeScript

[Summand](https://packages.sweber.dev/summand) is an MIT-licensed library that implements both steps without Java: it compiles the official XML Schemas (UBL 2.1 and UN/CEFACT CII D16B) and the official Schematron rule sets (CEN EN 16931 1.3.16 and KoSIT XRechnung 2.6.0 for XRechnung 3.0) and ships its own XPath 2.0 and Schematron engine written in TypeScript. It has no dependencies and is about 135 KB gzipped with all rule sets, schemas and both message languages.

```bash
pnpm add @sweberdev/summand
```

```ts
import { readFile } from "node:fs/promises";
import { validateInvoice } from "@sweberdev/summand";

// XML string, XML bytes or a ZUGFeRD PDF
const result = validateInvoice(await readFile("invoice.pdf"));

result.valid;            // false
result.profile?.label;   // "XRechnung 3.0"
result.errors[0];        // { id: "BR-CO-15", severity: "error", message: "…",
                         //   location: "/Invoice/cac:LegalMonetaryTotal", line: 214 }
result.schemas[0]?.id;   // "ubl-2.1" (the XML Schema was checked first)
result.summary?.number;  // "RE-2026-0042"
```

Every finding carries the rule id, the severity, the XPath and the line, which is what you need to show a user or to hand to the people who fix the invoice template. Messages are available in English and German (`{ lang: "de" }`), for every rule: accountants do not read English Schematron texts.

For ZUGFeRD and Factur-X, the PDF is opened, the embedded XML is found and validated, and the profile in the PDF metadata is compared with the profile of the XML.

### In CI

The command line tool returns a non-zero exit code when an invoice is invalid, so a template change that breaks the output fails the build:

```bash
npx @sweberdev/summand validate invoices/*.xml invoices/*.pdf
npx @sweberdev/summand validate invoice.xml --lang de --json
```

If your system produces invoices, keep a handful of representative ones in the repository (a normal invoice, a credit note, one with a discount, one with several VAT rates, one reverse charge) and validate them on every commit. This one test catches most regressions in invoice generation.

### In the browser

Because there is no JVM and no server, the same call runs in the browser. A drop zone that tells an accountant "valid" or "invalid because of rule X on line 214" without uploading the file anywhere is useful in itself, and it is also a privacy argument: invoices contain personal and commercial data. There is a [live demo](https://packages.sweber.dev/summand/demo) that works that way.

## How we know it gives the same answer as the official validator

A validator that is almost right is worse than none, because people trust it. So correctness is the actual product here, and it was tested against the references rather than against our own expectations:

- All **1,142** expectations of the CEN EN 16931 unit test suite pass.
- All reference invoices of the KoSIT XRechnung test suite are valid against schema and rules.
- The XML Schema check was compared with **Xerces**, the schema validator that the KoSIT validator uses, on all test invoices and on about 2,800 deliberately modified ones (elements removed, reordered, duplicated, values changed). The verdict (valid or invalid) was the same for every document.

Messages differ on purpose: Xerces stops looking at an element's content at its first problem and reports it as `cvc-complex-type.2.4.a`. Summand reports each problem it finds, in plain language, so you see all problems at once instead of fixing one layer after the other.

What the library does **not** do is equally important. It validates; it does not decide whether an invoice is correct in a tax sense. It also does not replace the legal advice or your accountant's view on archiving requirements. The rule sets keep their licences (EUPL-1.2 for the EN 16931 artefacts, Apache-2.0 for the XRechnung Schematron), which are documented in the package's NOTICE file.

## A practical approach for your system

1. **Receive.** Every business can already receive e-invoices. Validate incoming files at the point where they enter your system, and keep the report next to the file. If an invoice is invalid, you want to know before the payment run, not during an audit.
2. **Issue.** Validate every invoice you generate before it leaves the system, as a hard gate in the code path, not as an optional step.
3. **Test.** Put sample invoices into CI so that a template change cannot silently break the format.
4. **Archive.** An e-invoice has to be stored unchanged, complete and verifiably. A validation report stored together with the file is cheap evidence that it was valid when you received or sent it.

The [documentation](https://packages.sweber.dev/summand/docs) has guides on the schema check, Schematron, profiles, the Leitweg-ID check digit and ZUGFeRD PDFs. For teams that process invoices in volume, Summand Pro adds a typed invoice object, a readable HTML or PDF view with the validation report, watching a folder or a mailbox, duplicate detection and an export for DATEV.

*This article describes software and public standards, not tax or legal advice. Check your own obligations with your tax adviser.*
