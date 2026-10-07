---
title: "Cosine 0.8.0: browser tests, an accessibility fix and gap suggestions"
excerpt: "Cosine is now tested in a real browser on every release, which found and fixed an accessibility problem. Cosine Pro tells you why a query found nothing."
date: 2026-10-07
author: Seya Weber
type: release
packages: [cosine]
tags: [Cosine, Search, Accessibility, Documentation, release]
---

Cosine 0.8.0 is out. `@sweberdev/cosine` and `@sweberdev/cosine-react` are on npm, and Cosine Pro 0.6.0 is available to subscribers.

## Tested in a real browser

Until now the web component was tested in a simulated DOM. Every release now also runs in Chromium with Playwright: typing, the arrow keys, <kbd>Enter</kbd>, <kbd>Esc</kbd>, the shortcut, <kbd>Tab</kbd>, the filter buttons, several indexes at once, a narrow screen and reduced motion. An axe-core scan against WCAG 2.1 AA runs with the result list open.

## An accessibility problem, fixed

The scan found one: each result was a link inside a list item with `role="option"`. Screen readers handle a control nested in an option badly. The link is now the option itself, so the markup is `<a role="option">`. The `result` part still styles the list item, and the title and snippet parts are unchanged. The scan reports no violations.

## Benchmarks with fixed limits

Index size and speed are checked in CI against fixed limits: bytes per section without the text, bytes per vector (about 400 for 384 dimensions) and the time of a keyword search over 3000 sections, which takes about a millisecond today. A change that makes any of them several times worse fails the build.

## Cosine Pro: why a query found nothing

The insights report lists the queries without results. `suggest` now says why:

```bash
npx cosine-insights suggest --log searches.ndjson --index public/cosine --out gaps.md
```

For each query it shows one of three verdicts:

- **Probably a typo.** A word is not in your docs but a similar one is. You get the corrected query and the page it finds.
- **Closest pages.** The words are known but no page covers them together. You get the pages that come closest.
- **Nothing comes close.** No page covers the topic. This is the list of pages to write.

`--semantic` also looks pages up by meaning. The docs now include a ready-made GitHub Action that runs every Monday, builds the trends and the gaps and opens them as an issue.

## Upgrading

Both packages are drop-in. Update the four Cosine Pro packages together, because they share one version. `cosine-insights` has a new optional peer dependency on `@sweberdev/cosine`, which only the `suggest` command uses.

Details are in the [insights docs](https://packages.sweber.dev/cosine/docs/pro/insights) and the [web component docs](https://packages.sweber.dev/cosine/docs/guides/web-component), and you can try the search in the [live demo](https://packages.sweber.dev/cosine/demo).
