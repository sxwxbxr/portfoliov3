---
title: "Cosine 0.9.0: the API is frozen, plus short answers and a dashboard"
excerpt: "Cosine's public API is now covered by a test that guards it for 1.x. Cosine Pro adds sentence-level answers without an LLM and a one-file insights dashboard."
date: 2026-10-09
author: Seya Weber
type: release
packages: [cosine]
tags: [Cosine, Search, API, Documentation, release]
---

Cosine 0.9.0 is out. `@sweberdev/cosine` and `@sweberdev/cosine-react` are on npm, and Cosine Pro 0.7.0 is available to subscribers. This is the release candidate for 1.0: there are no breaking changes, and from here on the API only grows.

## The API is frozen

We went through every export, every `<cosine-search>` attribute and part, and every CLI option. A test now lists all of them, so removing or renaming one fails CI. The new [Stability page](https://packages.sweber.dev/cosine/docs/reference/stability) says what 1.x promises. Three areas stay marked `@experimental` because they are still moving: custom embedders, the model presets and the chunking rules.

## Guides for switching and for your framework

New guides cover moving from Pagefind, Orama, MiniSearch and Lunr, setups for Next.js, Astro, VitePress, Docusaurus, SvelteKit, Vue and plain HTML, and troubleshooting. Reference pages explain performance numbers and how to upgrade. A nightly CI job runs the real-model test every day, so a change in the model libraries shows up within a day.

## Cosine Pro: short answers

`@weber-development/cosine-answers` reads the top results, picks the sentence that best answers the question and shows it above the list with a link to the page. It runs in the browser, needs no API key and gives the same answer every time. If no sentence is good enough, or two pages answer equally well, it shows nothing.

```ts
import { attachAnswer } from "@weber-development/cosine-answers";
attachAnswer(searchElement, answerElement, { maxLength: 280 });
```

## Cosine Pro: one dashboard

```bash
npx cosine-insights dashboard --log searches.ndjson --index public/cosine --out dashboard.html
```

One HTML file with no external requests: overview numbers, the gaps with suggested fixes, weekly trends, the most searched content and CSV downloads for each table.

## Upgrading

Both free packages are drop-in. Cosine Pro has a new package, `cosine-answers`, and the five Pro packages share the version 0.7.0, so update them together.

Details are in the [answers docs](https://packages.sweber.dev/cosine/docs/pro/answers), the [insights docs](https://packages.sweber.dev/cosine/docs/pro/insights) and the [live demo](https://packages.sweber.dev/cosine/demo).
