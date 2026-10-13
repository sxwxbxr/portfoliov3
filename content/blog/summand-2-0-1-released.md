---
title: "Summand 2.0.1 released"
excerpt: "A documentation-only patch: the README and the CLI help now point to Summand Pro. The validator, the rules and the results are unchanged."
date: 2026-10-13
author: Seya Weber
type: release
packages: [summand]
tags: [Summand, E-invoicing, release]
---

Summand 2.0.1 is on npm as `@sweberdev/summand`. It changes documentation and the CLI help text only.

- The README and the last line of `summand --help` now mention Summand Pro: writing invoices in all profiles, the inbox workflow, and the new validation service as a Docker image with a REST API.
- The library prints nothing about Pro, and validation results and exit codes are exactly as in 2.0.0.

If you do not need Pro, there is nothing to do. The free validator stays MIT-licensed and complete.
