---
title: "Cosine 0.1.0 released"
excerpt: "Semantic search for documentation sites that runs entirely in the browser. Keyword results on the first keystroke, ranking by meaning once the model has loaded. No server, no API key."
date: 2026-10-05
author: Seya Weber
type: release
packages: [cosine]
tags: [Cosine, Search, Documentation, Embeddings, Web Components, React, release]
---

Cosine 0.1.0 is out. It adds search by meaning to your documentation site without a search server or an API key. `@sweberdev/cosine` and `@sweberdev/cosine-react` are on npm under the MIT licence.

## Why

Most docs search either needs a hosted service or matches only exact words. Someone who types "how do I get rid of the app" finds nothing on a page called "Uninstall". Cosine closes that gap in the browser. `cosine build` splits your Markdown, MDX or HTML pages at their headings and stores a small vector for each section next to your site. Keyword results appear on the first keystroke, and once the embedding model has loaded, the ranking combines keywords and meaning. Queries are never sent anywhere.

## What is in 0.1.0

- An index builder and CLI for Markdown, MDX and built HTML, split at headings with deep links.
- Hybrid ranking in the browser: BM25 keyword search with prefix matching plus cosine similarity on embeddings.
- Instant keyword results, semantic ranking as soon as the model is loaded, and keyword-only search for visitors who save data.
- Compact int8 vectors of about 400 bytes per section. The library itself is about 7 KB gzip.
- An accessible `<cosine-search>` web component in English, German, French and Italian that works in any framework.
- A React component and hooks, English or multilingual models, and the option to serve the model from your own domain for the GDPR and the Swiss FADP.

## Install

```bash
pnpm add @sweberdev/cosine @huggingface/transformers
```

Build the index from your docs and add the search field:

```html
<!-- npx cosine build docs --out public/cosine --base-url /docs -->
<script type="module">
  import "@sweberdev/cosine/element"
</script>

<cosine-search index="/cosine/cosine-index.json" lang="de"></cosine-search>
```

The English model is about 23 MB. It loads only when the search field gets focus and is then cached by the browser.

Try it in the [live demo](https://packages.sweber.dev/cosine/demo). The full reference is at [packages.sweber.dev/cosine/docs](https://packages.sweber.dev/cosine/docs).

## Cosine Pro

Cosine Pro is available from 12 CHF per month. It adds a Vite plugin that builds the index with every build in Vite, Astro, VitePress, SvelteKit and Nuxt and re-embeds only the sections that changed, plus search insights without tracking: queries without results and results nobody opened. Plans and checkout are on the [package page](https://packages.sweber.dev/cosine).
