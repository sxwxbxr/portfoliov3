---
title: "Vector 0.7.0: the release candidate for 1.0.0, with a frozen API"
excerpt: "Vector 0.7.0 freezes the public API ahead of 1.0.0, documents what stays stable and how upgrades work, and adds tests for load, several workers and outages."
date: 2026-10-06
author: Seya Weber
type: release
packages: [vector]
tags: [Vector, Webhooks, Stability, "1.0", release]
---

Vector 0.7.0 is on npm as `@sweberdev/vector`. It adds no new options. It is the release candidate for 1.0.0, and from here on only fixes go in before 1.0.0.

## The API is frozen

Every export, option and method was reviewed. Nothing was removed or renamed. A new page, [Stability and versioning](https://packages.sweber.dev/vector), says what counts as public API from 1.0.0 on:

- everything exported from the package entry points, including types
- documented options and their defaults
- the wire format (headers, signed content, `v1` and `v1a`, the default envelope)
- the database schema: columns and indexes are only added within a major version, and `migrate()` is safe to run on every deploy
- the command line and the event names

It also says what is not public, what a breaking change is, and how deprecation works: a feature is marked deprecated in a minor version first and removed no earlier than the next major.

## Running Vector in production

A second new page, [Running Vector in production](https://packages.sweber.dev/vector), covers what teams ask before they depend on a webhook library: how deliveries are guaranteed (at least once, with a lock that expires if a worker dies), how to upgrade, how long to keep rows, what to monitor, what happens when the database or a receiver is down, and how to shut a worker down cleanly.

## Tested under load and during outages

The test suite now includes:

- 1,500 messages to three endpoints with four workers on one database. Every message reaches every endpoint exactly once.
- A worker that dies after claiming a batch. The deliveries are sent after the lock expires, once each.
- A receiver that is down for hours, then comes back. Every delivery arrives within the retry schedule.
- A database that fails while the worker runs. The worker reports the error, keeps the stored messages and resumes.
- `stop()` waits for the batch in flight.

Type tests pin the public types, so a change that would break your code shows up in review.

Update with your package manager. There are no breaking changes. Vector Pro 0.9.0 accepts this version as a peer dependency.
