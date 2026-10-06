---
title: "Integral Pro 0.6.0 released"
excerpt: "Move customers over from Keygen or Cryptlex with a CSV file and bill counted usage through Polar Meters."
date: 2026-10-06
author: Seya Weber
type: release
packages: [integral]
tags: [Integral, Licensing, Import, Polar Meters, release]
---

Integral Pro 0.6.0 is out for subscribers. The free packages stay at 0.3.0.

## Why

Two things keep people on a license system they have outgrown: the customers who already hold keys, and the usage they already count. 0.6.0 takes care of both.

## What is new

- **Import.** `rowsFromCsv()` reads a CSV export from Keygen, Cryptlex or a spreadsheet and finds the columns by their usual names (`key`, `email`, `policy`, `expiry`, `maxMachines`, …). `importLicenses()` issues an Integral license for every row, maps the old plans to yours, and tells you which rows it refused and why. Run it with `dryRun` first. Importing the same file twice does not create duplicates. The old keys do not work with Integral, so every customer gets a new one, and `licenseMail()` from 0.5.0 sends it.
- **Polar Meters.** With the option `polarMeters`, every counted `recordUsage` is sent to Polar as an event with the amount and the license id. In Polar, a meter sums the amount and a product bills it. If Polar cannot be reached, the usage is still counted and the failure shows up in the audit trail.

```ts
const rows = rowsFromCsv(csv)
const check = await importLicenses(licenses, rows, { plans: { "Pro Yearly": "pro" }, dryRun: true })
if (check.errors.length === 0) await importLicenses(licenses, rows, { plans: { "Pro Yearly": "pro" } })
```

## Update

Nothing to migrate; both features are optional. See the [server docs](https://packages.sweber.dev/integral/docs) for the column names and the Polar setup. Integral Pro starts at CHF 12 per month, see the [package page](https://packages.sweber.dev/integral).
