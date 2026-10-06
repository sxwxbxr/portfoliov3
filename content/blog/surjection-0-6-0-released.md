---
title: "Surjection 0.6.0 released"
excerpt: "Check menus, dialogs and forms in their opened state, find a jumping focus order, and hand clients the report as an editable Word document."
date: 2026-10-06
author: Seya Weber
type: release
packages: [surjection]
tags: [Surjection, Accessibility, WCAG 2.2, Keyboard, release]
---

Many barriers hide behind a click: the open menu, the cookie dialog, the form with its error message. Surjection 0.6.0 can now check those states, and the Pro report comes as a Word file.

## What is new in 0.6.0

**Free: states with click steps.** Describe how to get to a state in the config file and Surjection checks the page again after those steps:

```json
{
  "baseUrl": "https://preview.example.ch",
  "states": [
    { "name": "menu-open", "url": "/", "steps": [{ "click": "#menu" }, { "waitFor": "#panel" }] },
    { "name": "contact-error", "url": "/kontakt", "steps": [{ "fill": ["#email", "x"] }, { "click": "button[type=submit]" }] }
  ]
}
```

The steps are `click`, `hover`, `fill`, `press`, `waitFor` and `wait`. Each state appears as its own page in the reports, for example `/#state:menu-open`, and the baseline keeps it apart from the plain page. If a step fails, the run stops and names the state and the step, so a redesigned page is never mistaken for an accessible one. All other checks, including keyboard and layout, run in each state. The new guide [States and click steps](https://packages.sweber.dev/surjection/docs/guides/states) has the details.

**Free: focus order.** The keyboard check has a third rule, `surjection-focus-order` (WCAG 2.4.3). If focus jumps up the page by more than 200 pixels while pressing Tab, typically because of positive `tabindex` values, Surjection lists the elements. Fixed headers are ignored. Whether an order makes sense stays a manual decision, so the finding has moderate impact and points at the cause.

**Pro: report as Word document.** `surjection-report --out report.docx` writes the client report as an editable `.docx`: real headings, table header rows, the document language and alt text for every element screenshot. It needs no Playwright. Download the example on the [live demo](https://packages.sweber.dev/surjection/demo).

```bash
npx surjection-report --results a11y.json --brand brand.json --client "Muster AG" --out bericht.docx
```

Pro history and monitoring keep states apart too, so a regression in an open menu is reported as such.

## Upgrade

```bash
pnpm add -D @sweberdev/surjection@^0.6.0
```

Nothing breaks: states are opt-in and the focus-order rule runs only with `--keyboard`. If you accepted keyboard findings in a baseline, new focus-order findings may appear once. Pro customers update the three `@weber-development` packages to 0.6.0.

Automated tests find only part of all barriers. A passing run is no proof of conformance.
