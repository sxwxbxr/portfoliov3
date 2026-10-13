---
title: "Cosine Pro 2.1.0: plugins for Docusaurus, VitePress and Astro, and a model for each language"
excerpt: "Cosine Pro 2.1 puts the search field into Docusaurus, VitePress and Starlight themes, and builds one index per page language so visitors download only the model of the language they read."
date: 2026-10-13
author: Seya Weber
type: release
packages: [cosine]
tags: [Cosine, Search, Documentation, release, "2.1"]
---

Cosine Pro 2.1.0 is out for subscribers. It adds three plugins that put Cosine search into the themes of Docusaurus, VitePress and Astro with Starlight, and a package that picks the embedding model by page language. The free packages stay at 2.0.0.

Cosine is search for documentation sites that runs entirely in the browser: keyword search with typo tolerance on the first keystroke, semantic ranking once the model is loaded, and no search server or API key.

## Plugins for Docusaurus, VitePress and Astro

Cosine 2.0 could already index the output of these tools, but you had to wire the search field into the theme yourself. The Pro plugins do both:

- **`@weber-development/cosine-docusaurus`** builds the index per locale after `docusaurus build`, with an embedding cache and shards, and replaces the navbar search with `<cosine-search>`.
- **`@weber-development/cosine-vitepress`** is a config wrapper plus a theme that puts the search field in the nav bar. VitePress locales map to languages and models.
- **`@weber-development/cosine-astro`** is an Astro integration and a Starlight plugin that replaces Starlight's built-in search and turns Pagefind off.

Each one reads your framework's own locale setup, so a site that is already multilingual needs only the model choice.

## One model per page language

The English model is about 23 MB and the multilingual one about 120 MB. With a single index, every visitor downloads the large one. `@weber-development/cosine-i18n` builds one index per language instead:

```ts
cosine({
  docs: "docs",
  languages: { en: "english", de: "multilingual", fr: "multilingual" },
});
```

A page's language comes from `lang:` front matter, a file name suffix such as `intro.de.md`, or a language folder. In the browser, the search field picks the index that matches `<html lang>`, so an English visitor never downloads the multilingual model. `languages` is also an option of `cosine-vite`, which the plugins use.

## A fix in cosine-vite

In Astro 6 and later, `cosine-vite` wrote no index because Astro builds the client and server with one shared config. It now decides by build environment, so Astro builds write the index again.

## What we tested

The plugins run real builds in their tests: `docusaurus build` with two locales, `vitepress build` and `dev`, and `astro build` and `dev` with Starlight in two locales. The tests use keyword-only or stand-in embedders, because the sandbox cannot reach Hugging Face, and we have not run the search field in a real browser yet. Treat the plugins as beta until you have seen them on your own site, and tell us what breaks.

## Upgrading

```sh
npm i -D @weber-development/cosine-docusaurus   # or cosine-vitepress, cosine-astro
npm i @weber-development/cosine-vite@latest
```

All Pro packages move to 2.1.0 together and work with Cosine 2.x. Nothing breaks, and prices and licences are unchanged. The [docs](https://packages.sweber.dev/cosine/docs/pro/overview) have a page for each plugin and for the [language setup](https://packages.sweber.dev/cosine/docs/pro/i18n).
