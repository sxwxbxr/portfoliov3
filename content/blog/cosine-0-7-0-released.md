---
title: "Cosine 0.7.0: several indexes, facet filters and Algolia migration"
excerpt: "One search field can read several indexes, visitors can filter by section with a click, and Cosine Pro moves a DocSearch export over without a new crawl."
date: 2026-10-06
author: Seya Weber
type: release
packages: [cosine]
tags: [Cosine, Search, Documentation, Algolia, release]
---

Cosine 0.7.0 is out. `@sweberdev/cosine` and `@sweberdev/cosine-react` are on npm, and Cosine Pro 0.5.0 is available to subscribers.

## Several indexes in one search field

Docs, blog and changelog often live in separate builds. Pass all of them and Cosine merges the results into one list:

```html
<cosine-search index="/docs/cosine-index.json /blog/cosine-index.json"></cosine-search>
```

In React, `index` accepts a string or an array. Each index keeps its own synonyms and boosts, and results are merged by rank. Every index must be built with the same model, which `cosine build` does by default. In code, `loadIndexes(urls, { weights })` lets you rank one index higher.

## Facet filter buttons

Add `facets` and the dropdown shows a button per section of the site, such as `docs (7)` and `blog (3)`, plus `All`. A click narrows the results to that section. `facets="2"` uses two path segments:

```html
<cosine-search index="/cosine-index.json" facets></cosine-search>
```

The counts come from the facets API that 0.5.0 introduced, so they follow phrases and exclusions in the query. The labels come in English, German, French and Italian, and you can style the row with `::part(facets)`.

## Cosine Pro: moving from Algolia

`@weber-development/cosine-migrate` turns an Algolia DocSearch export into a Cosine index without crawling your site again:

```bash
npx cosine-migrate algolia --records records.json --synonyms synonyms.json --out public/cosine
```

Records are grouped by page, headings and anchors are rebuilt so results link to the exact section, and Algolia synonym groups and one-way synonyms become Cosine synonyms. The command reports how many records and synonyms it used and how many it skipped. See the [migration guide](https://packages.sweber.dev/cosine/docs/pro/migrate).

## Upgrading

Both packages are drop-in. Cosine Pro packages keep one shared version, so update `cosine-insights`, `cosine-vite`, `cosine-next` and `cosine-migrate` together.

Details are in the [docs](https://packages.sweber.dev/cosine/docs/guides/web-component), and you can try the search in the [live demo](https://packages.sweber.dev/cosine/demo).
