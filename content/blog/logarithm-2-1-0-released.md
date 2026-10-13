---
title: "Logarithm Pro 2.1 released"
excerpt: "A ready-to-run admin server with search and export for your customers' admins, and anomaly alerts for mass changes, off-hours permission changes and new IP addresses."
date: 2026-10-13
author: Seya Weber
type: release
packages: [logarithm]
tags: [Logarithm, Audit log, SaaS, Docker, release]
---

Logarithm Pro 2.1.0 is out for all Pro customers: `@weber-development/logarithm-export`, `-integrity` and `-retention` at 2.1.0, plus a new package, `@weber-development/logarithm-server`. The free packages are unchanged at 2.0.0.

Until now Logarithm gave you the parts: a store, a handler and a React view that you wire into your app. Customers asked for the finished thing, so 2.1 adds it.

## Admin server

`@weber-development/logarithm-server` is a small server you run next to your app. An admin of one of your customers signs in, searches and filters their audit log, opens the details and downloads an export as CSV, NDJSON or JSON, for a period, for actions or for one actor.

- **One tenant per credential.** A token, a JWT (HS256) or a login by your reverse proxy names one tenant, and the viewer, the export and the event details only ever show that tenant. Failed logins are limited per address.
- **Ingest over HTTP.** `POST /v1/events` takes the same events as `audit.record()`, so apps in other languages can write to the log. The key decides the tenant, a `tenantId` in the body is ignored, and secrets are redacted as everywhere else. With an integrity key, the events join the hash chain.
- **Docker or Node.js.** The image is `ghcr.io/weber-development/logarithm-server`; `npx logarithm-server` does the same. It runs on Postgres, MySQL/MariaDB or SQLite and is configured with environment variables only.
- **Alerts built in.** Set a Slack, Teams, webhook or e-mail target and the server checks for unusual activity every few minutes and stores each alert in the log.

## More anomaly alerts

`detectAnomalies` learned three new things, available in the library and in the server:

- **Mass changes.** A rule can count the distinct objects an actor touched (`count: "targets"`), so one person editing 80 different projects in an hour stands out while ten edits of one record do not.
- **Off-hours.** Role, permission and API key changes outside working hours in your time zone (`outsideHours`), weekends included unless you say otherwise.
- **New IP.** The same changes from an IP address the actor has not used in the last 30 days (`newIp`). A new user without history does not raise an alarm.

`EXTENDED_ANOMALY_RULES` has a ready-made rule of each kind. They are not part of the defaults, so an existing setup gets no new alerts by surprise (the server uses them by default). `emailSink` sends alerts through any mailer you already use.

## What is not tested

This is the first release of the server, so here is what was checked and what was not. Covered by tests, and run in a browser: the SQLite path end to end over HTTP, tenant isolation of viewer and export, all three sign-in modes, ingest, export and the alerts. Not tested against live services: Postgres and MySQL through the server (the stores are the tested code of the free package), e-mail delivery through Resend, sign-in through a real identity provider in proxy mode, and pulling the image from the registry as a customer. Treat those as beta and try them on a test tenant first.

## Upgrading

```bash
pnpm add @weber-development/logarithm-export@latest @weber-development/logarithm-integrity@latest @weber-development/logarithm-retention@latest
```

Nothing breaks: 2.1 only adds. The Pro packages always share one version, so update all three. The new server is a separate package or image; [the documentation](https://packages.sweber.dev/logarithm/docs/pro/server) lists every setting.

Logarithm is on the [package page](https://packages.sweber.dev/logarithm). Logarithm Pro is part of the [Compliance Bundle](https://packages.sweber.dev/bundles/compliance).
