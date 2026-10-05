---
title: "Cosine 0.3.0: typo tolerance and scoped search"
excerpt: "Keyword search in Cosine now forgives typos, a search field can cover just one part of your site, and Cosine Pro exports search insights as CSV."
date: 2026-10-05
author: Seya Weber
type: release
packages: [cosine]
tags: [Cosine, Search, Documentation, release]
---

Cosine 0.3.0 is out. `@sweberdev/cosine` and `@sweberdev/cosine-react` are on npm, and Cosine Pro 0.2.0 is available to subscribers.

## Typos still find the page

Until now, a typo only found something once the embedding model had loaded. Keyword search now also tries close spellings of a word that is not in the index. `instalation` finds the installation guide, and `pakcage` finds the package. One wrong, missing or swapped letter is forgiven, and from eight letters on, two are. These matches rank below exact ones, so exact API names still come first. Words shorter than four letters are never guessed.

This works from the first keystroke, without the model. It also helps visitors on slow connections or with "save data" turned on, who only get keyword search.

## Search one part of the site

The new `scope` option limits results to URL paths. A search field in the API reference can stay inside the API reference:

```html
<cosine-search index="/cosine/cosine-index.json" scope="/docs/api"></cosine-search>
```

```tsx
<CosineSearch index="/cosine/cosine-index.json" scope={["/docs/api", "/docs/guides"]} />
```

`scope` matches whole path segments, so `/docs/api` covers `/docs/api/auth` but not `/docs/apis`. It also works with `search()`, `searchLexical()` and `useCosineSearch`. One index can serve the whole site and every section.

## Cosine Pro: insights as CSV

`cosine-insights report --out insights.csv` writes the queries without results, the results nobody opened and the most searched queries as a single table. You can open it in a spreadsheet or turn the gaps into tickets. Queries that look like spreadsheet formulas are defused before they reach the file.

## Update

```bash
pnpm add @sweberdev/cosine@latest @sweberdev/cosine-react@latest
```

Nothing changes for existing indexes, so you do not need to rebuild them. Try typos in the [live demo](https://packages.sweber.dev/cosine/demo), and see the [docs](https://packages.sweber.dev/cosine/docs) for the details.
