---
title: "Summand Pro 0.3.0 released"
excerpt: "Summand Pro now fetches e-invoices straight from a mailbox, over IMAP or Microsoft 365, and drops them into the watched inbox folder. Summand Pro is now on sale."
date: 2026-10-06
author: Seya Weber
type: release
packages: [summand]
tags: [Summand, Summand Pro, E-invoicing, XRechnung, ZUGFeRD, IMAP, Microsoft 365, release]
---

Summand Pro 0.3.0 is out. `@weber-development/summand-read`, `summand-view` and `summand-inbox` 0.3.0 are on GitHub Packages for licence holders. Summand Pro can now be bought directly on the [Summand page](/summand).

## Why

Most e-invoices arrive by e-mail, usually at an address like `rechnungen@`. With 0.2.0 someone still had to save every attachment into the inbox folder by hand. With 0.3.0 Summand Pro takes them from the mailbox itself, so the whole path from mail to DATEV export runs without manual steps.

## What is new in 0.3.0

**Mail intake.** `summand-inbox mail imap` and `summand-inbox mail graph` (or `pullMail()` and `pollMail()` from `@weber-development/summand-inbox/mail`) read new e-mails and save their XML and PDF invoice attachments into a folder.
- **IMAP** for any mail server, TLS required by default, with a password or an OAuth2 token. **Microsoft 365** through Microsoft Graph with an access token you provide.
- Files get safe, unique names (`<date>_<sender>_<name>`). Sender, subject, Message-ID and received date go into a mail log, and the same Message-ID is never saved twice.
- Processed messages are marked as seen and can be moved to a folder. Messages are never deleted.
- With `--validate` the saved files are checked, logged in the audit log with their mail origin, and sorted into `valid/`, `invalid/` and `duplicate/` right away. With `--watch-interval` the mailbox is checked again and again.
- Secrets are read only from environment variables, a token file or a config file, never from the command line.
- Safe limits: 20 MB per attachment, 10 invoice attachments per message, archives are never unpacked, and the content must match the file extension.

```bash
npx summand-inbox mail imap --host imap.example.com --user rechnungen@example.com \
  --password-env IMAP_PASSWORD \
  --to incoming --validate --watch-interval 300
```

Together with the watched folder and the DATEV export from 0.2.0, an invoice now goes from the mailbox to a checked booking proposal for your tax advisor on its own.

## Next

The free package gets the Peppol BIS Billing rules, and Summand Pro will be able to write e-invoices, not only read them.

Licence holders upgrade with `pnpm add @weber-development/summand-inbox@latest`. New to Summand Pro? See [pricing and licences](/summand).
