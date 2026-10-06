---
title: "Inverse 0.3.0 released"
excerpt: "The withdrawal and cancellation buttons now work on every website, not only in React: one script tag for WordPress, Shopify themes and static sites. Plus Dutch, Spanish and Polish, and in Inverse Pro a ledger in PostgreSQL or SQLite."
date: 2026-10-06
author: Seya Weber
type: release
packages: [inverse]
tags: [Inverse, Widerrufsbutton, Kündigungsbutton, WordPress, Shopify, release]
---

Inverse 0.3.0 is out. `@sweberdev/inverse` and `@sweberdev/inverse-react` are on npm under the MIT licence, and the Pro packages are updated on GitHub Packages for licence holders. Nothing breaks: 0.2.0 code keeps working as it is.

## One script tag, no React

Most shops and company sites do not run React. The new module `@sweberdev/inverse/ui` renders the same accessible two-step flow as the React `DeclarationFlow`, with labels, linked error messages, focus handling and a receipt announced to screen readers. It posts to the same handler endpoint.

On WordPress, in a Shopify theme or on a static page you only need the markup and one script:

```html
<div data-inverse-form="withdrawal" data-endpoint="https://example.com/api/inverse"></div>
<a data-inverse-link="withdrawal" href="/widerruf"></a>

<script src="https://cdn.jsdelivr.net/npm/@sweberdev/inverse@0.3/dist/inverse.global.js" defer></script>
```

The script (about 9.5 kB gzipped, all languages included) mounts every marked form and fills empty footer links with the statutory label. The language follows `data-locale` or the page's `lang`. In a bundler, call it yourself:

```ts
import { mountCancellationForm } from "@sweberdev/inverse/ui"

const form = mountCancellationForm(document.querySelector("#kuendigen")!, {
  endpoint: "/api/inverse",
  locale: "de",
})
```

The new guide [Plain HTML, WordPress and Shopify](https://packages.sweber.dev/inverse/docs) walks through it.

## Dutch, Spanish and Polish

Forms, error messages, the receipt e-mail and the downloadable copy now also come in `nl`, `es` and `pl`, with dates in the local format. The two withdrawal button labels use the official wording of Article 11a of the directive in each language. The other texts are our translation: have a native speaker or your lawyer check them before going live. `inverse check` recognises the new labels.

## Inverse Pro 0.3.0

- **Ledger in your database.** `postgresStore()` and `sqliteStore()` keep the tamper-evident ledger in PostgreSQL or SQLite through any driver (`pg`, Neon, PGlite, `node:sqlite`, better-sqlite3, Bun). The table is append-only and created on first use, two server instances cannot fork the chain, and verification, evidence sheets and retention work as before.

## Update

```sh
pnpm add @sweberdev/inverse@^0.3.0 @sweberdev/inverse-react@^0.3.0
```

Inverse Pro is available on the [package page](https://packages.sweber.dev/inverse), from CHF 19 a month, and is part of the [Compliance Bundle](https://packages.sweber.dev/bundles/compliance).
