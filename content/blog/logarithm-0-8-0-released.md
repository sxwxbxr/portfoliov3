---
title: "Logarithm Pro 0.8.0 released"
excerpt: "Anomaly detection that learns what is normal for each tenant, so quiet customers get sensitive alerts and busy customers get fewer false alarms."
date: 2026-10-06
author: Seya Weber
type: release
packages: [logarithm]
tags: [Logarithm, Audit log, SaaS, security, anomaly detection, release]
---

Logarithm Pro 0.8.0 is out and available to all Pro customers. The free packages stay at 0.5.0. Nothing breaks: 0.7.0 code keeps working as it is, and anomaly detection behaves as before unless you turn the new option on.

## Anomaly detection that learns

Since 0.3.0, `detectAnomalies()` flags actors with unusually many exports, deletions or failed logins. The weak spot was the fixed threshold: 10 exports per hour is a burst for a five-person team and a normal morning for a large customer. Pass `baseline` and Logarithm learns what is normal per rule and tenant:

```ts
await detectAnomalies({
  store,
  sinks: [slackSink({ webhookUrl: process.env.SLACK_WEBHOOK_URL! })],
  baseline: true, // or { days: 30, sigma: 3, minThreshold: 5 }
  record: true,
})
```

For every rule and tenant it looks at the previous 14 days, counts events per subject and window, and flags a subject whose count exceeds the mean plus three standard deviations, never below three events. A quiet tenant, where people export once per hour, is alerted at three exports. A busy tenant, where people export twenty times, only far above that.

Only active windows count, so the baseline describes how people behave when they use a feature. New tenants without enough history (20 samples by default) keep the fixed threshold and stay covered. Every alert carries the learned threshold and the baseline behind it: mean, standard deviation, sample count and days, so your security team can see why it fired.

## Update

```bash
pnpm add @weber-development/logarithm-export@latest @weber-development/logarithm-integrity@latest @weber-development/logarithm-retention@latest
```

Logarithm Pro is available on the [package page](https://packages.sweber.dev/logarithm) and is part of the [Compliance Bundle](https://packages.sweber.dev/bundles/compliance).
