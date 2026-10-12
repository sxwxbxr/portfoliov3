---
title: "Summand 1.1.0 released"
excerpt: "Summand 1.1 adds a unified ruleSets option, an older XRechnung rule-set version you can pin, and validateMany for batches. The xrechnung option is deprecated and goes away in 2.0."
date: 2026-10-12
author: Seya Weber
type: release
packages: [summand]
tags: [Summand, E-invoicing, XRechnung, ZUGFeRD, release]
---

Summand 1.1.0 is on npm as `@sweberdev/summand`. It is additive: nothing in 1.0 breaks.

## What is new

- **`ruleSets` option.** Pick rule sets and versions in one place: `ruleSets: ["en16931", "xrechnung@2.5.0"]`, or `--rule-sets` on the command line. `"auto"` stays the default and behaves as in 1.0. An unknown set or version gives the code `SUM-RULESET` instead of a crash.
- **An older XRechnung version.** XRechnung Schematron 2.5.0 is bundled next to the default 2.6.0 (Apache-2.0). EN 16931 stays at 1.3.16 only, so `xrechnung@2.5.0` is not an exact copy of the KoSIT validator of early 2026, only of its XRechnung rules. Differences between the two versions are listed in the docs.
- **`validateMany`.** A new entry point `@sweberdev/summand/batch` validates many files with a worker pool, in input order, with errors per file. Honest numbers: on our 4-core test container it was up to about 1.5x faster than a plain loop for large invoices, and slower for many small ones. Use it for big files, not for speed on small ones.
- **`summand rules`** now lists every bundled version.

## Deprecated

The `xrechnung` option is deprecated and will be removed in 2.0.0. Using it adds one `SUM-DEPRECATED` info to the result; it is an info, not a warning, so `--warnings-as-errors` runs keep their exit code. The migration guide has the details.

## Not included

Factur-X EXTENDED Schematron is not part of this release. We could not confirm a licence for the files we could reach, so we did not bundle them. Peppol is still waiting for written permission from OpenPeppol.
