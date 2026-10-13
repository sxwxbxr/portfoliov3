---
title: "Summand Pro 2.1.0 released"
excerpt: "Summand Pro 2.1 brings a validation service you run as a Docker container with a REST API, plus webhooks, mail notifications, invoice dispatch by SMTP and an evidence bundle for the archive. Most of it is beta, and we say why."
date: 2026-10-13
author: Seya Weber
type: release
packages: [summand]
tags: [Summand, Summand Pro, E-invoicing, XRechnung, ZUGFeRD, Docker, release]
---

Summand Pro 2.1.0 is out for licence holders: `summand-read`, `view`, `inbox`, `write`, `match` and the new `summand-server`, all 2.1.0 on GitHub Packages, plus a Docker image. Prices and licences do not change.

## A validation service for every stack

`@weber-development/summand-server` runs the Summand validator as an HTTP service, so PHP, Java, .NET, Python or any other stack can check e-invoices without Node.js in the application.

- `POST /v1/validate` takes an XML or PDF invoice and returns the result as JSON with a stable shape (rule ID, severity, rule set). A valid and an invalid invoice both return 200; the verdict is in the body. Bad requests get a clear 4xx.
- `POST /v1/validate/batch` for several files, `GET /v1/rule-sets`, `/healthz`, `/readyz` and an OpenAPI file.
- Optional API key, size limits, a non-root container, no invoice content in the logs, no outbound calls.
- The guide has curl, PHP, Python, Java and C# examples, a Docker Compose file and Kubernetes probes.

We built the image and ran 22 smoke checks against the running container. What we have not verified: pulling the image as a buyer from the GitHub container registry (access should follow your access to the Pro repository, we will confirm this with the first customer), arm64, load behaviour, and the C# example was not compiled. A single validation runs on the event loop (roughly 20 to 60 ms), so put the service behind a load balancer if you expect heavy traffic.

## Beta additions in summand-inbox

- **Webhooks and mail notifications** for approvals, rejections, exports and deadlines. Webhooks carry an HMAC signature and are retried; every delivery is logged.
- **Invoice dispatch by SMTP:** `summand-inbox send` validates an invoice first, then mails it with the XML or PDF attached. Peppol is not included, because that needs written permission from OpenPeppol.
- **Evidence bundle:** `archive export` writes a ZIP with the original, the validation result, the workflow events and a manifest with SHA-256 values, with a verifier a third party can run. The bundle is unsigned.

These are tested against local test servers (an HTTP server and a fake SMTP server), not against real mail providers or webhook services, which is why they are marked beta. The archive is not reviewed by a tax advisor.

## Upgrading

Nothing breaks. Update the packages; the new features are additive. The Docker pull instructions are in the install guide of the Pro repository.
