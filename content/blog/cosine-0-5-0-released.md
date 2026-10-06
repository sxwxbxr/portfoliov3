---
title: "Cosine 0.5.0: facets and insights trends"
excerpt: "Cosine counts results per section of your site for filters, and Cosine Pro now shows whether your docs search gets better: new gaps, fixed gaps and rising queries."
date: 2026-10-06
author: Seya Weber
type: release
packages: [cosine]
tags: [Cosine, Search, Documentation, release]
---

Cosine 0.5.0 is out. `@sweberdev/cosine` and `@sweberdev/cosine-react` are on npm, and Cosine Pro 0.3.0 is available to subscribers.

## Facets: filters for your search page

`cosine.facets(query)` counts the results of a query per section of the site, so your own search page can offer filters:

```ts
const facets = await cosine.facets("webhook", { depth: 2 });
// [{ path: "/docs/guides", count: 7 }, { path: "/docs/api", count: 3 }]
const results = await cosine.search("webhook", { scope: facets[0].path });
```

`depth` sets how many path segments form a facet, and a facet's path works directly as `scope`. It runs on the same index, in the browser, in keyword mode and in hybrid mode.

## Cosine Pro: is your docs search getting better?

The insights report shows one snapshot. The new `trends` command compares the last 28 days with the 28 days before:

```bash
npx cosine-insights trends --log searches.ndjson --out trends.html
```

- **New gaps** are queries that found nothing and were not a problem before. These are the pages to write next.
- **Resolved gaps** found nothing before and now find something or get opened. That is the proof your fixes worked.
- **Rising** queries are searched clearly more often than before.
- A **weekly chart** shows searches, with the share that found nothing.

You can write the report as HTML, Markdown (for a monthly issue) or CSV (the weekly series). Like the rest of the insights, it works without tracking people: the log contains queries and clicks, no user ids, IP addresses or cookies.

## Update

```bash
pnpm add @sweberdev/cosine@latest @sweberdev/cosine-react@latest
```

Nothing changes for existing indexes. See the [docs](https://packages.sweber.dev/cosine/docs) for the details, or try the search in the [live demo](https://packages.sweber.dev/cosine/demo).
