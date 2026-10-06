---
title: "Cosine 0.4.0: synonyms and incremental builds"
excerpt: "A synonym list teaches Cosine the words your visitors use, and the CLI now rebuilds an index by embedding only the sections that changed."
date: 2026-10-06
author: Seya Weber
type: release
packages: [cosine]
tags: [Cosine, Search, Documentation, release]
---

Cosine 0.4.0 is out. `@sweberdev/cosine` and `@sweberdev/cosine-react` are on npm.

## Synonyms

Keyword search only finds words that are on the page. Visitors often use others: they type `login`, your page says "sign in". Give the build a synonym list:

```json
{
  "login": ["sign-in", "anmelden"],
  "invoice": ["bill", "receipt", "rechnung"]
}
```

```bash
npx cosine build docs --synonyms synonyms.json
```

Every word in a group finds the others, ranked a little below the exact word. The list is stored in `cosine-index.json`, so nothing else has to be loaded. This helps most before the embedding model has arrived, or when it never loads because the visitor saves data. In code, pass `synonyms` to `buildIndex()`, or to `loadIndex()` to override the stored list.

## Incremental builds

`cosine build --incremental` reads the index already in the output directory and embeds only new and changed sections. Fixing a typo on one page no longer means embedding the whole site again:

```bash
npx cosine build docs --out public/cosine --incremental
# Reused 412 sections, embedded 3
```

Cosine reuses vectors only when the model, the passage prefix and the precision are the same. Otherwise it embeds everything and says so. From code, `readIndex(dir)` from `@sweberdev/cosine/node` gives you the last build to pass as `previous`.

## Update

```bash
pnpm add @sweberdev/cosine@latest @sweberdev/cosine-react@latest
```

Existing indexes keep working without a rebuild. Read the details in the [docs](https://packages.sweber.dev/cosine/docs/guides/indexing), or try the search in the [live demo](https://packages.sweber.dev/cosine/demo).
