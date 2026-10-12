---
title: "Cosine 2.0.0: a smaller index format, shards and Pro quality tests"
excerpt: "Cosine 2.0 is out, free and Pro. Index format 2 is smaller and can be split into shards, vectors can be stored in 4 bits, and Pro adds golden-query tests, synonym pull requests and answers in more languages."
date: 2026-10-12
author: Seya Weber
type: release
packages: [cosine]
tags: [Cosine, Search, Documentation, release, "2.0"]
---

Cosine 2.0.0 is out. `@sweberdev/cosine` and `@sweberdev/cosine-react` are on npm, and the six Cosine Pro packages are at 2.0.0 for subscribers, including the new `@weber-development/cosine-quality`.

Cosine is search for documentation sites that runs entirely in the browser: keyword search with typo tolerance on the first keystroke, semantic ranking on top once the model is loaded, and no search server, account or API key.

## What is new in the free packages

- **Index format 2.** Page id, URL and title are stored once per page and every section is a short array, which made the index of our own docs 15 percent smaller. Cosine 2 still reads format 1 with a one-time warning.
- **Shards.** `cosine build --shard-size 200` splits a large index into several files. The browser loads them in parallel and ranks them as one index, so results are identical. When only one page changes, only its shard changes, and the others stay in the browser cache.
- **4-bit vectors.** `--vector-bits 4` stores each vector in half the space of the default int8 vectors, for sites where the index size matters more than the last bit of precision.
- **Integrations for Docusaurus, Astro (Starlight too) and VitePress** as subpath exports of the core package, plus `indexFiles()` if you write your own build step.
- **Languages without spaces.** Chinese, Japanese, Thai and similar scripts are now split into words with `Intl.Segmenter`, so a search for 東京 finds 東京タワー and the snippet highlights it.
- **Tested in Chromium, Firefox and WebKit** on every change, next to the axe-core scan and the benchmarks.

## What is new in Cosine Pro

- **`cosine-quality`** runs golden queries in CI: a list of queries and the page each should find. It fails the build when a change moves the right page down and prints what moved.
- **Synonym pull requests.** `cosine-insights synonyms` turns queries without results into a reviewable list of synonym suggestions. An example GitHub Action opens it as a pull request every week.
- **Answers in more languages.** `cosine-answers` stems English, German, French, Italian, Spanish, Dutch and Portuguese, so the quoted sentence matches inflected words.
- The Vite, Next.js and migration packages accept `shardSize` and write format 2.

Prices and licences are unchanged.

## Breaking changes

There are three, and most sites are not affected by more than the first two.

1. **Node 22 or later** for the CLI, `@sweberdev/cosine/node` and the integrations. Node 20 reached its end of life in April 2026. The browser code has no new requirement.
2. **Index format 2.** Cosine 1.x cannot read it, so rebuild the index and deploy it together with the new JavaScript. If you read `cosine-index.json` yourself, use `parseManifest` instead of `JSON.parse`.
3. **Scripts without spaces and accent folding.** Results for Chinese, Japanese and Thai change because words are now split. Accent folding applies to Latin, Greek, Cyrillic, Arabic and Hebrew text only.

`Embedder`, `transformersEmbedder` and `DEFAULT_MODEL` are now stable. The default model stays the 23 MB English one, because a multilingual default would make every English site download about 120 MB. Choose `--model multilingual` when your visitors need it.

## Upgrading

```sh
npm i @sweberdev/cosine@latest @sweberdev/cosine-react@latest
npx cosine build docs --out public/cosine
```

Cosine Pro 1.0.1 already accepts Cosine 2, so you can upgrade the free packages first and move Pro when you are ready. The full list is in the [migration guide](https://packages.sweber.dev/cosine/docs/reference/migrating-to-2).

Cosine 1.x gets security and bug fixes for 12 months from today.

## Try it

The [live demo](https://packages.sweber.dev/cosine/demo) now runs the 2.0 build on 44 pages of the Cosine and Surjection docs. Start with the [getting started guide](https://packages.sweber.dev/cosine/docs/getting-started).
