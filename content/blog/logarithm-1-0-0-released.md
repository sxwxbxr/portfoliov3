---
title: "Logarithm 1.0 released"
excerpt: "The self-hosted audit log for SaaS apps is stable. A frozen API, a verified accessible viewer, a 10 million event load test, a security review and tamper evidence with independently checkable timestamps."
date: 2026-10-07
author: Seya Weber
type: release
packages: [logarithm]
tags: [Logarithm, Audit log, SaaS, TypeScript, security, release]
---

Logarithm 1.0.0 is out. The free packages `@sweberdev/logarithm` and `@sweberdev/logarithm-react` are on npm with provenance, and the Pro packages `@weber-development/logarithm-export`, `-integrity` and `-retention` are available to all Pro customers at the same version. Nothing breaks: 1.0.0 is the 0.8.0 API (free) and the 0.9.1 API (Pro), declared stable.

## What 1.0 means

From now on Logarithm follows semantic versioning. The documented API, the store interface, the HTTP endpoint, the React props, the table layout (through a recorded schema version) and the `--lg-*` CSS properties do not change in a breaking way without a new major version, and deprecations come one minor version ahead. The [API reference](https://packages.sweber.dev/logarithm/docs) says exactly what is covered and what is not.

## How we got here

Between 0.4 and 1.0 we worked through the list that a buyer's security review would work through, and wrote down the result each time:

- **Your own store, tested.** A conformance suite that checks that a custom store behaves exactly like the built-in Postgres, MySQL and SQLite stores.
- **An accessible viewer, measured.** WCAG AA contrast is tested for every colour pair in the light and dark theme, and an axe-core audit in a real browser reports no violations in the light, dark and German variants.
- **Migrations you can trust.** The table layout has a recorded version, and `migrate*` refuses to run old code against a newer table, for example after a rollback.
- **Scale.** 10 million events in SQLite: the default viewer queries stay below one millisecond, filters within a tenant of 50,000 events take about 100 milliseconds, and the performance guide says which index to add when tenants grow beyond that.
- **Security.** A review of the free packages fixed secret redaction for `snake_case` and `kebab-case` names. A review of the Pro packages fixed an evidence-pack check and a download parameter check. Both are written up in the release notes, and the security model has its own chapter.
- **Evidence, not just logs.** Logarithm Pro records tamper-evident events in a hash chain per tenant, has trusted time-stamping authorities certify the chain head, and now verifies the authority's signature and certificate chain in your own code, without OpenSSL. Evidence packs for auditors, retention reports, Elasticsearch, Loki, Splunk and Datadog sinks, Slack and Teams alerts, and learned anomaly baselines per tenant complete it.

## Update

```bash
pnpm add @sweberdev/logarithm@latest @sweberdev/logarithm-react@latest
pnpm add @weber-development/logarithm-export@latest @weber-development/logarithm-integrity@latest @weber-development/logarithm-retention@latest
```

Logarithm is on the [package page](https://packages.sweber.dev/logarithm). Logarithm Pro is part of the [Compliance Bundle](https://packages.sweber.dev/bundles/compliance).
