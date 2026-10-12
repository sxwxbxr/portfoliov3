---
title: "Logarithm 2.0 released"
excerpt: "Failed and denied actions in the log, correlation ids, CloudEvents and OpenTelemetry mappings, Postgres partitioning and an object history view. Logarithm Pro adds SOC 2 and ISO 27001 control evidence, monthly evidence packs and read-only access for auditors."
date: 2026-10-12
author: Seya Weber
type: release
packages: [logarithm]
tags: [Logarithm, Audit log, SaaS, TypeScript, SOC 2, ISO 27001, release]
---

Logarithm 2.0.0 is out. The free packages `@sweberdev/logarithm` and `@sweberdev/logarithm-react` are on npm with provenance, and the Pro packages `@weber-development/logarithm-export`, `-integrity` and `-retention` are available to all Pro customers at the same version. A 2.0.0-next.0 release candidate was tested first, including the upgrade of a 1.0 SQLite database.

## What is new

An audit log that only records what succeeded cannot answer the question an auditor asks first: who tried, and what was refused? 2.0 changes the schema for that and builds the audit evidence on top.

- **Outcome.** Every event has an `outcome`: `success`, `failure` or `denied`. It can be filtered in queries, over HTTP and in `<AuditLog>`, which marks failed and denied events with text and not only with colour.
- **Correlation id.** One `correlationId` ties together the events of a request, a job or a support case, so you can follow it across services.
- **CloudEvents and OpenTelemetry.** `toCloudEvent()` and `toOtelLogRecord()` (and `toOtlpLogs()`) map events to CloudEvents 1.0 and OpenTelemetry logs. Personal data such as the actor's name and email is not sent to the OpenTelemetry mapping.
- **Postgres partitioning.** `migratePostgres({ partitioned: true })` with `ensurePartitions()`, `listPartitions()` and `detachPartitions()` partitions the table by month or year, so old data can be detached and archived instead of deleted row by row.
- **Object history.** `<ObjectHistory>` shows every change to one object with a before and after diff and a filter by field.

## Logarithm Pro

- **Controls mapping.** `mapControls()` shows which SOC 2 and ISO 27001 controls your log provides evidence for, with event counts and samples, as JSON, CSV or an HTML page. The starter sets are a starting point to adapt with your auditor, not a certification.
- **Monthly evidence packs.** `runMonthlyEvidence()` builds an evidence pack per customer for the last month (signed with your key if you pass one) and hands it to your storage, from a cron job.
- **Read-only access for auditors.** `createAuditorAccess()` issues expiring, revocable links limited to one customer, a period and a set of actions. Every use is written to your audit log first, and nothing is returned if that fails.
- **Outcome in the hash chain.** The integrity hash now covers the outcome and the correlation id. Chains written with 1.x verify unchanged, and chains that mix both verify too.
- **Splunk and Datadog.** The sinks batch large deliveries, take a `fetch` option, report the outcome, and stop retrying requests that were refused.

## Breaking changes

- **Schema version 2.** Your table needs the two new columns. `migrateSqlite()`, `migratePostgres()` and `migrateMysql()` upgrade an existing table in place and keep every event readable. Old code refuses to run against the new table by design.
- **Node.js 22 or newer.**
- **Custom stores** must save and filter `outcome` and `correlationId`. The conformance suite checks it.
- **Labels.** `AuditLogLabels` has new keys; custom label sets need them.
- **CSV export** ends with two new columns, `outcome` and `correlation_id`. If you parse the header line, update it.

## Upgrading

```bash
pnpm add @sweberdev/logarithm@latest @sweberdev/logarithm-react@latest
pnpm add @weber-development/logarithm-export@latest @weber-development/logarithm-integrity@latest @weber-development/logarithm-retention@latest
```

Run your `migrate*` function once, then deploy. The [migration guide](https://packages.sweber.dev/logarithm/docs/migrating-to-2) has the details, including how to roll back. Logarithm 1.x keeps getting security and bug fixes until 12 October 2027.

Logarithm is on the [package page](https://packages.sweber.dev/logarithm). Logarithm Pro is part of the [Compliance Bundle](https://packages.sweber.dev/bundles/compliance).
