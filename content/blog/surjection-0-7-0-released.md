---
title: "Surjection 0.7.0 released"
excerpt: "SARIF output, dark mode and reduced-motion checks, a JSON schema for the config file, and monitoring that notifies you by webhook or mail."
date: 2026-10-06
author: Seya Weber
type: release
packages: [surjection]
tags: [Surjection, Accessibility, WCAG 2.2, Monitoring, release]
---

Surjection 0.7.0 makes the check fit more setups and tells you when a client site gets worse, without anyone opening a CI log.

## What is new in 0.7.0

**Free: dark mode and reduced motion.** Many contrast problems exist only in the dark theme. `--color-scheme dark` emulates the visitor's colour scheme, `--reduced-motion` emulates "reduce motion". Both are also config fields (`colorScheme`, `reducedMotion`) and work together with states, keyboard and layout checks.

```bash
npx surjection check --base-url https://preview.example.ch / /shop --color-scheme dark
```

**Free: SARIF.** `--out-sarif a11y.sarif` writes SARIF 2.1.0 with one result per affected element, rule descriptions and the WCAG criteria as tags. SARIF viewers and tools that import it can use the file. GitHub code scanning accepts the upload, but it cannot link a URL to a line of code, so keep using the Markdown summary there.

**Free: JSON schema for the config.** The package ships `surjection.config.schema.json`. `surjection init` now writes a `$schema` line, so editors such as VS Code complete field names, show descriptions and flag a mistyped step in `states` while you type. For an existing config add the line from the [config reference](https://packages.sweber.dev/surjection/docs/reference/config).

**Pro: monitoring notifications.** `surjection-history regressions` can now notify the team when something got worse:

```bash
npx surjection-history regressions --fail-on serious \
  --webhook "$MONITORING_WEBHOOK" \
  --mail-to team@agency.ch --mail-from monitoring@agency.ch
```

The webhook message works with Slack, Mattermost, Discord and Microsoft Teams workflows, mail goes by SMTP (`SURJECTION_SMTP_URL`, kept as a CI secret). A quiet week sends nothing. See the [monitoring example](https://packages.sweber.dev/surjection/demo#monitoring) on the live demo.

## Upgrade

```bash
pnpm add -D @sweberdev/surjection@^0.7.0
```

Nothing breaks: everything new is opt-in. Pro customers update the three `@weber-development` packages to 0.7.0.

Automated tests find only part of all barriers. A passing run is no proof of conformance.
