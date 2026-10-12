---
title: "Summand Pro 1.1.0 released"
excerpt: "Summand Pro 1.1 writes all ZUGFeRD / Factur-X profiles, credit notes, partial and final invoices and Skonto, and adds a beta approval workflow and archive for received invoices."
date: 2026-10-12
author: Seya Weber
type: release
packages: [summand]
tags: [Summand, Summand Pro, E-invoicing, XRechnung, ZUGFeRD, release]
---

Summand Pro 1.1.0 is out: `@weber-development/summand-read`, `view`, `inbox`, `write` and `match` 1.1.0 on GitHub Packages for licence holders. It goes with the free Summand 1.1. Everything is additive.

## summand-write

- **All profiles.** MINIMUM, BASIC WL, BASIC and EXTENDED (CII) next to EN 16931 and XRechnung. Data a profile cannot hold throws a `profile-limit` error that names the terms; `omitUnsupported` leaves them out and lists them.
- **More document types.** Credit notes, corrected, partial, final and collective invoices, in UBL and CII, plus structured Skonto, prepayments and a Leitweg-ID check.
- **What was checked.** Every result carries `coverage`. XRechnung and EN 16931 in UBL are fully checked by the free validator. For the other profiles it is partial or schema-only, and the result says so. CII holds one preceding invoice only, so a final invoice with several prepayments needs UBL.

## summand-inbox (beta)

- **Approval workflow.** `received`, `checked`, `approved`, `exported` or `rejected`, four-eyes rule by default, deadlines and Skonto terms, kept in a tamper-evident event log.
- **Archive.** Stores the original, the validation result and the workflow events with SHA-256 in a hash-chained index, with retention periods and refused early deletion.

Both are covered by automated tests only and are marked `@beta`. The archive is an aid for orderly record keeping, not legal or tax advice, and it has not been reviewed by a tax advisor. Lexoffice and sevDesk export and mail intake remain unverified against live systems, as in 1.0.
