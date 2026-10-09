---
title: "Cosine 1.0.0: semantic docs search with a stable API"
excerpt: "Cosine 1.0 is out, free and Pro. The API is stable and follows semantic versioning, with browser tests, benchmarks, guides and a live demo behind it."
date: 2026-10-09
author: Seya Weber
type: release
packages: [cosine]
tags: [Cosine, Search, Documentation, release, "1.0"]
---

Cosine 1.0.0 is out. `@sweberdev/cosine` and `@sweberdev/cosine-react` are on npm, and the five Cosine Pro packages are at 1.0.0 for subscribers.

Cosine is search for documentation sites that runs entirely in the browser: keyword search with typo tolerance on the first keystroke, semantic ranking on top once the model is loaded, and no search server, account or API key.

## What 1.0 means

The public API is the one 0.9 froze, and from now on it follows [semantic versioning](https://packages.sweber.dev/cosine/docs/reference/stability). Patch releases fix bugs, minor releases only add, and breaking changes wait for 2.0. A test lists every export, every `<cosine-search>` attribute and part, and every CLI option, so a removal fails CI. Custom embedders, model presets and chunking rules stay marked `@experimental`. If you run 0.9, upgrading changes nothing.

## What is in it

- Hybrid ranking in the browser: BM25 keyword search with prefix matching and typo tolerance, plus cosine similarity on embeddings
- Scoped search, facets with filter buttons, synonyms, boosting, `"exact phrases"` and `-excluded` words
- Several indexes in one search field, incremental builds in the CLI
- An accessible `<cosine-search>` web component in four languages, and React components and hooks
- Browser tests in Chromium with an axe-core scan on every release, benchmarks with fixed limits, and a nightly real-model test
- Guides for moving from Pagefind, Orama, MiniSearch and Lunr, and for Next.js, Astro, VitePress, Docusaurus, SvelteKit and Vue

## Cosine Pro 1.0

Pro adds what you need once search runs on more than one site: plugins that build the index with Vite and Next.js, a migration from Algolia DocSearch, search insights without tracking (queries without results, trends, gap suggestions, a one-file dashboard and a weekly report) and short answers that quote the sentence that answers the question. Pro 1.0 works with Cosine 1.x. Prices are unchanged.

## Try it

The [live demo](https://packages.sweber.dev/cosine/demo) now runs the 1.0 build on 42 pages of the Cosine and Surjection docs, with filters, synonyms and search syntax. Start with the [getting started guide](https://packages.sweber.dev/cosine/docs/getting-started).
