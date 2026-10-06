---
title: "Surjection 0.8.0 released"
excerpt: "Show clients what you fixed: before and after images of every resolved issue, in the HTML, PDF and Word report."
date: 2026-10-06
author: Seya Weber
type: release
packages: [surjection]
tags: [Surjection, Accessibility, Reports, release]
---

A report that only lists problems does not show the work behind it. Surjection 0.8.0 adds the other half: what you fixed since the last report, with the element before and after.

## What is new in 0.8.0

**Free: `--compare-with`.** Pass the results of the previous run and Surjection records every issue that is gone as `fixed`. With `--screenshots` it keeps the old screenshot aside before the run overwrites it and photographs the same element again.

```bash
npx surjection check --config surjection.config.json --screenshots a11y-shots \
  --compare-with last-a11y.json --out-json a11y.json
```

Pages are matched by path, so a preview and the live site can be compared. An element that was removed from the page is listed without an after image. At most ten items per page are recorded.

**Pro: "Fixed since the last report".** The client report gets a new section with the image before and after for every fixed item, in HTML, PDF and the Word document, in German, English, French and Italian. The images have alternative text, the section is part of the table of contents, and the report is still checked for accessibility itself. See the [live demo](https://packages.sweber.dev/surjection/demo) for an example with the made-up bakery site.

One honest limit: many accessibility fixes are invisible. A missing alternative text or label looks the same before and after, so those pairs of images show the same picture. The list of what was fixed is the evidence there; the images shine for contrast, size and layout fixes.

## Upgrade

```bash
pnpm add -D @sweberdev/surjection@^0.8.0
```

Nothing breaks: `--compare-with` is opt-in. Pro customers update the three `@weber-development` packages to 0.8.0.

Automated tests find only part of all barriers. A passing run is no proof of conformance.
