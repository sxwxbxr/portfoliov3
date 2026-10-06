---
title: "Gradient 0.5.0: audit the colors you already have"
excerpt: "gradient audit checks the color steps of an existing stylesheet against the contrast promises and suggests one fixing color per step."
date: 2026-10-06
author: Seya Weber
type: release
packages: [gradient]
tags: [Gradient, Color, Accessibility, WCAG 2.2, CI, release]
---

Gradient 0.5.0 is out. Until now the contrast promises of the step numbers only held for palettes Gradient generated. Most projects already have a color system. 0.5.0 checks that one too. Update with `npm install @sweberdev/gradient@latest`; nothing in the existing API changed.

## gradient audit

```sh
npx @sweberdev/gradient audit app/globals.css
```

```
app/globals.css
  brand light: 14/14 pairs pass
  brand dark: 14/14 pairs pass
  yellow light: 0/2 pairs pass
    fail 600 on white = 2.94:1, needs 4.5:1 (try #9d6a00)
    fail 600 on 50 = 2.83:1, needs 4.5:1 (try #9d6a00)
```

Gradient reads custom properties that end in a step number: `--color-brand-600`, `--brand-600` or `--blue-500`, and the text colors `--color-brand-on-600`. Light mode comes from `:root`, dark mode from a `.dark` rule, `[data-theme="dark"]`, a `prefers-color-scheme: dark` block or the second value of `light-dark()`. Colors can be hex, `rgb()`, `hsl()` or `oklch()`.

The command exits with `1` when a pair fails, so it fits into CI. `--json` prints the full result.

## One fix per step

A step belongs to several pairs: 600 has to reach 4.5:1 on white and on step 50. Fixing one pair at a time often breaks the other. Gradient suggests one color that reaches all pairs of the step at once. It keeps hue and colorfulness and changes only the lightness, so the color still looks like yours.

## In code

```ts
import { auditCss } from "@sweberdev/gradient"

const result = auditCss(css)
result.checks.filter((c) => !c.pass) // { scale, mode, foreground, background, ratio, required, fix }
```

## A test for the promises themselves

0.5.0 also adds a sweep test that runs 144 palettes over every tenth hue, four ranges of colorfulness and three lightness levels, and requires every promise in both modes. It runs in CI with every change, so a change to the solver cannot silently break a hue.

## Try it

The [live demo](https://packages.sweber.dev/gradient/demo) has a new section: paste your stylesheet and see which pairs fail, with the suggested color next to each. The [guide](https://packages.sweber.dev/gradient/docs/guides/audit) has the details.
