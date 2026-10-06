---
title: "Gradient 0.3.0: check any two colors"
excerpt: "gradient check measures any pair of colors against WCAG 2, shows the APCA value and suggests the closest color that passes. Plus Sass and TypeScript export."
date: 2026-10-06
author: Seya Weber
type: release
packages: [gradient]
tags: [Gradient, Color, Accessibility, WCAG 2.2, APCA, release]
---

Gradient 0.3.0 is out. Until now it checked the contrast of its own palette. Real interfaces also use colors from elsewhere: a logo, text on a photo overlay, a color someone picked in the design file. 0.3.0 checks those too. Update with `npm install @sweberdev/gradient@latest`; nothing in the existing API changed.

## gradient check

```sh
npx @sweberdev/gradient check "#ff5a5f" "#ffffff"
```

```
#ff5a5f on #ffffff
WCAG 2   3.05:1
  text        AA fail   AAA fail
  large text  AA pass   AAA fail
  icons, UI   pass (3:1)
APCA     Lc 56.3 (WCAG 3 draft, for information)
Needs 4.5:1. Closest color that passes: #db3742 (4.53:1, same hue).
```

The first color is the text, the second the background. The command exits with `1` when the pair is below the target, so it works in CI. `--target 7` checks for AAA, `--target 3` for large text, icons and borders.

The suggestion keeps the hue and colorfulness of your color and changes only its lightness, darker or lighter, whichever is closer. The color still looks like yours, only darker or lighter.

## In code

```ts
import { checkPair, fixContrast } from "@sweberdev/gradient"

checkPair("#ffffff", "#e30613") // { ratio: 4.88, aa: true, aaa: false, apca: -76.5, … }
fixContrast("#ff5a5f", "#ffffff") // "#db3742"
```

## Why APCA is only shown

APCA is the contrast method in the WCAG 3 working draft. It rates light text on dark backgrounds more strictly than the WCAG 2 ratio, which matches how people actually read. But WCAG 2.2 is the standard the European Accessibility Act and EN 301 549 refer to, so pass and fail follow WCAG 2.2. Gradient shows the APCA value next to it, so you can already see where a pair is borderline.

## Sass and TypeScript

Two new export formats. `--format scss` writes `$brand-600`, `$brand-600-dark` and `$brand-on-600` for projects that still compile Sass. `--format ts` writes a typed module for CSS-in-JS, React Native or charts:

```ts
import { colors } from "./colors"

colors.brand.light[600] // "#e20211"
```

## Try it

The [live demo](https://packages.sweber.dev/gradient/demo) has a new section to check any two colors, with a button that applies the suggested color, and tabs for the Sass and TypeScript output. The [guide](https://packages.sweber.dev/gradient/docs/guides/check-colors) has the details.
