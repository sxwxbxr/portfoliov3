---
title: "Summand 0.2.0 released"
excerpt: "Summand now speaks German: every EN 16931 rule and every Summand check can be reported in German, from code with lang: \"de\" or in the CLI with --lang de."
date: 2026-10-06
author: Seya Weber
type: release
packages: [summand]
tags: [Summand, E-invoicing, XRechnung, ZUGFeRD, EN 16931, German, release]
---

Summand 0.2.0 is out. `@sweberdev/summand` 0.2.0 is on npm under the MIT licence.

## Why

The people who fix a rejected e-invoice are mostly bookkeepers, not developers. Until now they got the original CEN messages in English, such as "Amount due for payment (BT-115) = Invoice total amount with VAT (BT-112) -Paid amount (BT-113) +Rounding amount (BT-114)." Only the XRechnung-specific rules were German. Most invoices fail on the EN 16931 rules, though, so the message that matters was usually the English one.

## What is new in 0.2.0

- **German messages for every rule.** All 1,400+ EN 16931 rule messages for UBL and CII and all of Summand's own checks (PDF, profile, Leitweg-ID) are now available in German. The XRechnung rules were already German.
- **Same ids, same locations.** Rule id, severity, XPath and line number are identical in both languages, so you can log in English and show German to your users, or the other way round.
- **German CLI output.** `summand validate --lang de` prints the summary line, the severities and the messages in German.

```ts
import { validateInvoice } from "@sweberdev/summand";

const result = validateInvoice(xml, { lang: "de" });
result.errors[0].message;
// "Fälliger Zahlungsbetrag (BT-115) = Gesamtbetrag der Rechnung mit Umsatzsteuer (BT-112)
//  - Gezahlter Betrag (BT-113) + Rundungsbetrag (BT-114)."
```

```bash
npx @sweberdev/summand validate --lang de rechnungen/*.xml rechnungen/*.pdf
```

The German texts use the terms of the German edition of EN 16931 (Verkäufer, Erwerber, Rechnungsposition, Umsatzsteueraufschlüsselung) and keep business term numbers such as BT-115, so they can be looked up in the standard. They ship inside the rule sets, which adds about 20 KB gzipped to the bundle.

## Try it

The [live demo](/summand/demo) has a new "Messages in German" switch. Pick the sample with errors and switch it on.

## Next

The next free release adds XML Schema (XSD) validation for UBL and CII ahead of the Schematron rules, so Summand covers everything the KoSIT validator checks. Summand Pro gets a watched inbox folder that sorts invoices into valid, invalid and duplicate, and an export to the DATEV booking batch format.

Upgrade with `pnpm add @sweberdev/summand@latest`. The [docs](/summand/docs) list the new `lang` option.
