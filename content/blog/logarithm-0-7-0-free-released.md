---
title: "Logarithm 0.7.0 released"
excerpt: "We ran an axe-core accessibility audit of the audit log viewer in a real browser: no violations in light, dark and German. A new headingLevel option fits the viewer under your page's headings."
date: 2026-10-07
author: Seya Weber
type: release
packages: [logarithm]
tags: [Logarithm, Audit log, SaaS, React, accessibility, release]
---

Logarithm 0.7.0 is out on npm as `@sweberdev/logarithm` and `@sweberdev/logarithm-react`, with provenance. The Pro packages stay at 0.9.0. Nothing breaks.

## An accessibility audit with real tools

Until now we checked the viewer's colour contrast in a test and claimed the rest. For 1.0 we wanted evidence. We render the viewer in Chromium and run axe-core against it for WCAG 2.0, 2.1 and 2.2 level A and AA plus best practices, in the light theme, the dark theme (forced and from the system setting) and in German. Then we tab through every control and press Enter and Space on the details button.

The result: no violations in any of the four runs. 34 rules pass, and none are left for manual review. Focus is visible on every control, the details button reports its state, and Enter and Space open and close it.

The audit found one thing, and it depends on your page: the day headings were always `h3`, so on a page with an `h1` and no `h2` above the viewer, axe reports a skipped heading level. The new `headingLevel` option sets it:

```tsx
<AuditLog endpoint="/api/audit" headingLevel={2} />
<ActivityFeed endpoint="/api/audit" headingLevel={2} title="Recent activity" />
```

Automated tools find about half of all accessibility problems, so please test with your own screen reader too. The audit harness is in the repository (`audits/a11y`), and the React guide says what we checked and what we did not.

## Update

```bash
pnpm add @sweberdev/logarithm@latest @sweberdev/logarithm-react@latest
```

Logarithm is on the [package page](https://packages.sweber.dev/logarithm).
