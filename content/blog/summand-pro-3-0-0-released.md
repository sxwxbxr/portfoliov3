---
title: "Summand Pro 3.0.0 released"
excerpt: "Summand Pro 3.0 adds a workbench to the validation service: a browser page where named users register received invoices, check and approve them with the four-eyes rule, and export them with an evidence bundle. The approval workflow is now stable. Nothing from 2.x breaks, and we explain why it is still a major version."
date: 2026-11-07
author: Seya Weber
type: release
packages: [summand]
tags: [Summand, Summand Pro, E-invoicing, XRechnung, ZUGFeRD, Docker, release]
---

Summand Pro 3.0.0 is out for licence holders: `summand-read`, `view`, `inbox`, `write`, `match` and `summand-server`, all 3.0.0 on GitHub Packages, plus the Docker image `ghcr.io/weber-development/summand-server:3`. Prices and licences do not change.

## The workbench

Until now Summand Pro could check an invoice, but the steps after that were yours to build: who looked at it, who approved it, what was archived. `summand-server` can now do that for a small team.

- **Register:** upload an XRechnung or ZUGFeRD invoice (XML or PDF) on the page or through the API. It is validated on arrival, the original is stored byte for byte, and the payment deadline is read from the invoice.
- **Check and approve:** reviewers check, approvers approve, and the four-eyes rule applies. A rejection needs a reason, an invalid invoice needs an explicit decision, and everyone can comment.
- **Export:** an admin marks the invoice as exported, for example after booking it. That archives the original with its validation result and the whole event history, and the evidence bundle can be downloaded and verified by a third party.
- **Who did it:** the person behind every step comes from the sign-in. In 2.x the workflow only knew a name that somebody typed.

The page is one HTML file in German and English, served by the same process, with a strict content security policy. We checked it with axe-core in headless Chromium for the sign-in, the list and the detail view, with no violations. Users and roles live in a file you control (reviewer, approver, admin; tokens as SHA-256). It is off unless you set two environment variables, and then the server stores its data in one folder, the `/data` volume of the image. You can see the whole path as a recorded HTTP session on the [demo page](/summand/demo#pro-new-3).

## Stable workflow, honest version number

The approval workflow of `summand-inbox` (`Flow`, its errors, its rules and the format of the event log) was beta since 1.1. From 3.0 it is under Semantic Versioning, so a breaking change there needs a new major version. The log format did not change; a log written by 2.x opens as it is. The archive, notifications, dispatch and the Lexoffice and sevDesk exports stay beta.

We call this 3.0 and not 2.2 because of that promise and because the server can now hold state and sign people in, which changes what you operate. We found no call, option, flag or exit code of 2.x that we had to remove or change, and the migration guide in the Pro repository lists the few behaviours that differ: the larger Docker image with a `/data` volume, four new error codes (`forbidden`, `unknown-document`, `workflow-conflict`, `workflow-unavailable`) that only occur on the workbench endpoints, and `/` and `/app` that are served only when the workbench is on.

## What we have not verified

- Browsers other than Chromium, and a screen reader. No tests with real users yet.
- Load: one process, one local disk. Two servers on one network folder are not supported.
- Sign-in is a token per person. There is no single sign-on, no lock-out after wrong tokens and no expiry; run it behind HTTPS and rotate tokens by changing the users file.
- The archive and the evidence bundle are not reviewed by a tax advisor and are not a certified GoBD system.
- Pulling the image as a buyer from the container registry is still untested.

## Upgrading

Update the six packages together to 3.0.0 and run your tests. If you do not want the workbench, nothing else changes. Summand Pro 2.x stays supported and gets corrections until 12 October 2027, without new features. The free validator stays on 2.x.
