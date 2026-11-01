---
title: "Inverse Pro 3.0.0 released"
excerpt: "Inverse Pro 3.0 turns the Pro packages into a service: one Docker image that takes withdrawal and cancellation declarations from any shop, keeps them in a tamper-evident ledger, mails the receipt, runs the case inbox, reminds you before refund deadlines and watches your pages. A WooCommerce plugin uses it. Nothing from 2.x breaks, and we explain why it is still a major version."
date: 2026-11-01
author: Seya Weber
type: release
packages: [inverse]
tags: [Inverse, Inverse Pro, Widerrufsbutton, Kündigungsbutton, WooCommerce, Docker, release]
---

Inverse Pro 3.0.0 is out for licence holders: `inverse-ledger`, `inverse-audit`, `inverse-mail` and the new `inverse-server`, all 3.0.0 on GitHub Packages, the Docker image `ghcr.io/weber-development/inverse-server:3`, and a WooCommerce plugin as a ZIP in each release of the customer repository. Prices and licences do not change.

## For shops that are not Node.js

Until now Inverse Pro was three libraries. If your shop runs on WooCommerce, Shopware or a backend in another language, you had to write the glue yourself. `inverse-server` is that glue as one image:

- **Intake:** a shop posts the declaration to `POST /v1/declarations`. The server validates it, stamps the time of receipt, writes it to the ledger and mails the receipt in your branding to the customer and a notice to your team. A failed mail does not lose the declaration; the ledger records it and the customer still gets the confirmation page.
- **Ledger:** a SHA-256 hash chain in SQLite in the `/data` volume. A monitoring endpoint tells you if somebody changed the database behind your back.
- **Case inbox:** the web inbox of 2.1 at `/`, with status, refund day and reply templates in German and English.
- **Reminders:** a mail to your team three days, one day and on the day a refund or a contract end is due, once per case, and not for cases that are already refunded or closed.
- **Watcher:** checks your shop pages for working withdrawal and cancellation buttons and raises an alarm by webhook and mail when one disappears.

Everything is an environment variable. A wrong setting stops the container at start and names the setting. The [demo page](/inverse/demo#pro-new-3) shows a recorded run, including the case where the database is edited and the verify endpoint reports the broken entry.

## WooCommerce

The plugin gives a WooCommerce shop an order-bound withdrawal button. Customers who are logged in click *Withdraw* in *My Account*; guests enter the order number and the e-mail address of the order. They pick the items, confirm, and get the copy of their declaration. The plugin sends it from your shop server to your Inverse server and adds a note to the order. We ran it against WordPress 7.1 and WooCommerce 11.2 with a browser and checked the forms with axe-core.

## Case inbox and watcher are stable

`createInbox`, `inboxHandler`, `serveInbox`, the case functions, `caseReminders` and `watchSites` were beta in 2.1. From 3.0 they follow Semantic Versioning. The ledger format did not change; a ledger written by 2.x opens as it is.

## Stable API, honest version number

We call this 3.0 and not 2.2 because of that promise and because there is now something you operate: a database file with your legal evidence, a sign-in and outgoing mail. We found no call, option, flag, exit code or file format of 2.x that we had to remove or change. The migration guide in the customer repository says so and lists the few things that are new.

## What we have not verified

- Receipts through real SMTP servers and the mail providers. The tests and the end-to-end run use a mail server that records messages.
- PostgreSQL for the server (it uses SQLite), the watcher against live shop pages, load beyond a small shop, and several server processes on one data folder (not supported).
- Shopware and Magento have no plugin. The HTTP call works for them in principle; nobody has tried.
- If the shop cannot reach the server when a customer files a declaration, the customer sees an error and nothing is stored. There is no retry queue yet; monitor `/readyz`.
- Pulling the image as a customer from the container registry is still untested.

## Upgrading

Update the three libraries to 3.0.0 together and run your tests; nothing else changes. To use the server, pull the image, set the variables and mount `/data`. Inverse Pro 2.x stays supported and gets corrections until 12 October 2027, without new features. The free package stays on 2.x.
