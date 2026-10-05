---
title: "Gradient 0.2.0: status colors, color vision checks and light-dark()"
excerpt: "Gradient now generates success, warning, danger and info scales that match your brand, warns when two colors look alike for people with a color vision deficiency, and exports CSS light-dark()."
date: 2026-10-05
author: Seya Weber
type: release
packages: [gradient]
tags: [Gradient, Color, Accessibility, Color blindness, Dark mode, release]
---

Gradient 0.2.0 is out. It adds the colors most interfaces need next to the brand, a check that goes beyond contrast, and a shorter dark mode export. Update with `npm install @sweberdev/gradient@latest`. Nothing in the existing API changed.

## Status colors that match your brand

Pass `status: true` and Gradient adds `success`, `warning`, `danger` and `info` scales. Their hues are fixed (green, amber, red and blue), their colorfulness follows your brand color, so a muted brand gets muted status colors and a bright one gets bright ones. Every status scale keeps the same contrast promises as the brand: `danger-600` reaches 4.5:1 on the page in both modes.

```ts
const palette = createPalette({ brand: "#e30613" }, { status: true })
// or override one: { status: { danger: "#d4351c" } }
```

On the command line it is `--status`.

## Colors that look alike

About one in twelve men has a red-green color vision deficiency. Two colors with perfect contrast to the page can still look the same to them, which is a problem when red means "failed" and green means "saved". The new `checkDistinguishable()` simulates protanopia, deuteranopia and tritanopia and lists the pairs that look alike. `gradient --check` prints them as notes:

```
note success and danger look alike (deuteranopia): add an icon or a label.
```

It is a note, not a failure: the fix is an icon or a word next to the color, not a different palette. `simulate()` and `deltaE()` are exported too, if you want to build your own checks.

## Dark mode with light-dark()

`--dark light-dark` writes one `light-dark()` value per variable instead of a second block of variables. The page follows the system setting through `color-scheme`, and the classes `.light` and `.dark` still force a mode. All current browsers support it; keep the default for older ones.

## Try it

The [live demo](https://packages.sweber.dev/gradient/demo) now shows the status colors, lets you view the whole palette as people with each color vision deficiency see it, and has a light-dark() export tab. The new [status colors guide](https://packages.sweber.dev/gradient/docs/guides/status-colors) explains the details.
