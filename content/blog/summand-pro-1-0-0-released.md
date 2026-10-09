---
title: "Summand Pro 1.0.0 released"
excerpt: "Summand Pro 1.0 is the stable release of the e-invoice toolkit: read, view, validate, watch, fetch from mail, write, match and export, with a SemVer-stable API. Two parts are not yet verified against live accounts, and we say which."
date: 2026-10-09
author: Seya Weber
type: release
packages: [summand]
tags: [Summand, Summand Pro, E-invoicing, XRechnung, ZUGFeRD, release]
---

Summand Pro 1.0.0 is out. `@weber-development/summand-read`, `summand-view`, `summand-inbox`, `summand-write` and `summand-match` 1.0.0 are on GitHub Packages for licence holders. It goes together with the free Summand 1.0.

## What 1.0 means

From 1.0 on, the public API of all five packages follows SemVer. Every export is documented and guarded by a snapshot test, and all error and exit codes are in a catalogue. Breaking changes only come in a major version; deprecated names keep working until 2.0. The stability policy in the migration guide says exactly what is covered and what is not.

## What is in Summand Pro 1.0

- **summand-read:** invoices from UBL or CII, XML or PDF, as one typed object.
- **summand-view:** a readable HTML view and a PDF/A-3b export with the XML attached.
- **summand-inbox:** validate folders, watch an inbox folder, fetch invoices from a mailbox over IMAP or Microsoft 365, export for DATEV, and write the audit log.
- **summand-write:** create validated XRechnung and ZUGFeRD invoices from the typed object.
- **summand-match:** check an invoice against a purchase order, with 22 documented `MATCH-*` codes.

## What is not verified yet

We would rather tell you than let you find out:

- **Lexoffice and sevDesk export stays in beta.** The payload shapes follow the vendors' public API documentation as we understand it, but they have not been checked against live Lexoffice or sevDesk accounts. They may change in a minor release.
- **Mail intake** is covered by automated tests and protocol-level fixtures for IMAP and Microsoft Graph, but has not yet been run against real production mailboxes. Try it on a separate test mailbox first and tell us what you find.

Everything else, including DATEV export, validation, reading, writing, PDF and matching, is covered by the stable API promise.

## Upgrade

Licence holders upgrade with `pnpm add @weber-development/summand-inbox@latest` (and the other packages you use). From 0.9 only the version number changes. Summand Pro requires `@sweberdev/summand` 1.0 or newer. See [pricing and licences](/summand).
