---
title: "Surjection 0.5.0 released"
excerpt: "Two more criteria tested automatically, reflow at 320 pixels and text spacing, and the manual checklist of Surjection Pro in French and Italian."
date: 2026-10-06
author: Seya Weber
type: release
packages: [surjection]
tags: [Surjection, Accessibility, WCAG 2.2, Reflow, release]
---

Surjection 0.5.0 closes two more gaps that axe-core leaves open and brings the manual checklist to the Swiss national languages.

## What is new in 0.5.0

**Free: layout checks.** `--layout` tests two criteria that depend on a changed window or changed styles:

- **Reflow (WCAG 1.4.10).** The window is set to 320 CSS pixels, a 1280 pixel window at 400 % zoom. The page must not need sideways scrolling. Surjection lists the elements that reach past the right edge, the cause and not every child. Content that scrolls inside its own box, such as a wide table in a scrolling container, is allowed by the criterion and not reported.
- **Text spacing (WCAG 1.4.12).** Surjection applies the spacing values of the criterion (line height 1.5, letter spacing 0.12 em, word spacing 0.16 em, paragraph spacing 2 em) and reports text that gets cut off. Fixed heights with `overflow: hidden` on buttons and cards are the usual cause.

```bash
npx surjection check --base-url https://preview.example.ch / /shop --layout
```

In Playwright tests it is `expectAccessible(page, { layout: true })`. The new guide [Layout checks](https://packages.sweber.dev/surjection/docs/guides/layout) explains both rules and their limits.

**Pro: checklist in French and Italian.** All 55 criteria of `surjection-checklist` now come with a title and a test step in French and Italian, following the official WCAG translations for the titles. The browser editor and the Markdown list speak the language too, and the client report shows the criteria in it. Together with German, Swiss German and English the checklist now covers all four national languages of Switzerland. Try the editor in all three languages on the [live demo](https://packages.sweber.dev/surjection/demo).

```bash
npx surjection-checklist edit --checklist checklist.json --locale it --out checklist.html
```

## Upgrade

```bash
pnpm add -D @sweberdev/surjection@^0.5.0
```

Nothing breaks: the layout check is opt-in. Pro customers update the three `@weber-development` packages to 0.5.0.

Automated tests, including the layout and keyboard checks, find only part of all barriers. A passing run is no proof of conformance.
