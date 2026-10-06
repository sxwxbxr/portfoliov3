---
title: "Gradient 0.4.0: a shadcn/ui theme from one color, and chart colors for color blindness"
excerpt: "Gradient now writes the whole shadcn/ui theme from your brand color with the contrast intact, and picks chart colors that stay apart with protanopia, deuteranopia and tritanopia."
date: 2026-10-06
author: Seya Weber
type: release
packages: [gradient]
tags: [Gradient, shadcn/ui, Tailwind CSS, Color, Accessibility, release]
---

Gradient 0.4.0 is out. Two things many projects need right at the start: the colors of a shadcn/ui theme, and colors for charts. Update with `npm install @sweberdev/gradient@latest`; nothing in the existing API changed.

## A shadcn/ui theme from one color

```sh
npx @sweberdev/gradient "#e30613" --format shadcn --out app/globals.css
```

The file has all semantic variables of shadcn/ui, `--background`, `--primary`, `--muted-foreground` and the rest, for `:root` and `.dark`, plus the `@theme inline` block that maps them to Tailwind v4 colors. Replace the theme section of your `globals.css` and `bg-primary` and `text-muted-foreground` work.

Most generated themes pick these colors by eye. Gradient picks them from the palette steps, so the contrast promises carry over, in light and dark mode:

- Text on the background and on cards reaches 7:1.
- The text on buttons, badges, muted and accent areas reaches 4.5:1.
- The border of form fields reaches 3:1 on the page, which the usual light grey `--input` does not. If you prefer the lighter look, override `--input` after the generated block.

In code it is `toShadcn(palette)`, and `shadcnTokens(palette)` gives you the values as hex.

## Chart colors that stay apart

Default series colors in chart libraries often turn into one color for people with red-green deficiency. `createSeries` picks them differently: the first color has your brand hue, every next one is the candidate whose closest neighbor is farthest away, measured with normal vision and with simulated protanopia, deuteranopia and tritanopia, in light and dark mode. Every color reaches 3:1 on the page, the minimum for graphical objects.

```sh
npx @sweberdev/gradient series "#e30613" --count 5
```

```ts
import { createSeries } from "@sweberdev/gradient"

const { light, dark, distance } = createSeries("#e30613", { count: 5 })
```

`distance` is the smallest gap between two colors. With the usual brand colors, up to six series reach 0.08, which is clearly different. For seven or eight series it drops to 0.055 to 0.09, and no choice of colors fixes that: label the lines and bars directly or use different markers. The same colors fill `--chart-1` to `--chart-5` of the shadcn theme.

## Share a palette

The [live demo](https://packages.sweber.dev/gradient/demo) now has a shadcn/ui tab and a section with chart colors, where you can switch the whole page to a color vision deficiency. The colors you pick are in the address, so you can send a palette to a colleague with one link. The guides for the [shadcn/ui theme](https://packages.sweber.dev/gradient/docs/guides/shadcn) and [chart colors](https://packages.sweber.dev/gradient/docs/guides/chart-colors) have the details.
