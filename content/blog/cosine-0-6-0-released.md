---
title: "Cosine 0.6.0: search syntax, boosting and Next.js"
excerpt: "Visitors can search for exact phrases and exclude words, you can rank parts of your site higher, and Cosine Pro builds the index for Next.js."
date: 2026-10-06
author: Seya Weber
type: release
packages: [cosine]
tags: [Cosine, Search, Documentation, Next.js, release]
---

Cosine 0.6.0 is out. `@sweberdev/cosine` and `@sweberdev/cosine-react` are on npm, and Cosine Pro 0.4.0 is available to subscribers.

## Search syntax

Visitors can narrow a search without any setup on your side:

| Query | Finds |
|---|---|
| `"reset password"` | Sections with these words next to each other, in this order |
| `webhook -retry` | Sections about webhooks that do not contain `retry` |

Phrases and exclusions work in keyword mode and also filter the results of the semantic ranking. Small words such as "the" do not break a phrase. A hyphen only excludes at the start of a word, so `sign-in` and `e-mail` stay normal words.

## Boosting

Not every page deserves the same rank. Weights are stored in the index:

```bash
npx cosine build docs --boost /docs/api=1.5 --boost /blog=0.7
```

Results below `/docs/api` rank 50 % higher, blog results 30 % lower. Paths match whole segments, and the longest matching path wins.

## Cosine Pro: Next.js

`@weber-development/cosine-next` builds the index from the pages `next build` has prerendered, or from `out/` after a static export:

```json
{ "scripts": { "build": "next build && cosine-next --base-path /docs" } }
```

The index lands in `public/cosine`. The last index is kept in `.next/cache`, which Vercel and most CI setups keep between builds, so fixing a typo embeds one section instead of the whole site. Error pages and `noindex` pages are skipped, and it reads the `<main>` element, so navigation stays out of the results. Synonyms and boosts go into a small `cosine.config.json`.

Pro now covers the Vite family (Astro, VitePress, SvelteKit, Nuxt) with `cosine-vite` and Next.js with `cosine-next`.

## Update

```bash
pnpm add @sweberdev/cosine@latest @sweberdev/cosine-react@latest
```

Existing indexes keep working without a rebuild. The details are in the [docs](https://packages.sweber.dev/cosine/docs), and you can try the syntax in the [live demo](https://packages.sweber.dev/cosine/demo).
