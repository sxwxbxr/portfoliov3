---
title: "Inverse 0.6.0 released"
excerpt: "Inverse now comes with ready-to-paste integrations for WooCommerce, Shopware, Shopify and WordPress. Inverse Pro's ledger CLI works directly on a SQLite file or a PostgreSQL database."
date: 2026-10-06
author: Seya Weber
type: release
packages: [inverse]
tags: [Inverse, Widerrufsbutton, Kündigungsbutton, WooCommerce, Shopware, Shopify, release]
---

Inverse 0.6.0 is out. `@sweberdev/inverse` and `@sweberdev/inverse-react` are on npm under the MIT licence, and the Pro packages are updated on GitHub Packages for licence holders. Nothing breaks: 0.5.0 code keeps working as it is.

## What is in 0.6.0

- **Integrations for shop platforms.** Most online shops run on a platform, not on React. `inverse snippet <platform> --endpoint <url>` prints a snippet you can paste into your shop: for WooCommerce (footer links, account area, links under every order, shortcodes for the two forms), Shopware 6 (footer block and Custom HTML elements), Shopify (a theme snippet and Custom Liquid sections), WordPress and plain HTML. The snippets load the script-tag build and post to your handler.

```sh
pnpm add @sweberdev/inverse@^0.6.0 @sweberdev/inverse-react@^0.6.0
npx @sweberdev/inverse snippet woocommerce --endpoint https://api.example.com/inverse
```

The snippets are starting points: test them in your theme, and check the live pages with `inverse check <url>`. Guide: [packages.sweber.dev/inverse/docs/guides/platforms](https://packages.sweber.dev/inverse/docs/guides/platforms). Try the flows in the [demo](https://packages.sweber.dev/inverse/demo).

## Inverse Pro 0.6.0

- **Ledger CLI on a database.** `inverse-ledger` no longer needs a JSON Lines file. Pass a SQLite file or a PostgreSQL URL and every command (`verify`, `evidence`, `export`, `retain`, `anchor`, `dossier`) works on it, with `--table` for the table name. SQLite needs Node 22.5 or newer; PostgreSQL needs the `pg` package.

```sh
npx inverse-ledger verify ./data/inverse.db
npx inverse-ledger dossier postgres://user@host/db --html dossier.html
```

Inverse Pro is available on the [package page](https://packages.sweber.dev/inverse), from CHF 19 a month.
