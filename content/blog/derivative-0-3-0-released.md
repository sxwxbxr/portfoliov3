---
title: "Derivative 0.3.0: one-step setup and JSON Feed"
excerpt: "derivative init sets up a project in one command, and the build can now write a JSON Feed. Pro adds Bluesky posts and a database store for read statistics."
date: 2026-10-06
author: Seya Weber
type: release
packages: [derivative]
tags: [Derivative, Changelog, Release notes, JSON Feed, Bluesky, release]
---

Derivative 0.3.0 is on npm. It makes the first five minutes shorter and gives feed readers another format. Derivative Pro gains a new channel and a home for its statistics on serverless hosts.

## derivative init

Setting up used to mean writing `derivative.config.json` and editing the build script by hand. Now one command does both:

```sh
npx derivative init
```

It picks the source (your `CHANGELOG.md`, a Changesets folder, or git), writes `changelog.json` and an Atom feed to `public/` (or `static/` for SvelteKit), and puts `derivative build` in front of your `build` script so the feed is current on every deploy. It never overwrites an existing config, and `--no-scripts` leaves `package.json` alone.

## JSON Feed

Next to Atom, the build can now write a [JSON Feed 1.1](https://jsonfeed.org) with one item per release, including title, summary, image and the full release notes as HTML:

```sh
npx derivative build --json-feed public/feed.json
```

In the config, set `out.jsonFeed` and `jsonFeedUrl`. The widget does not change and stays at about 6 kB.

## Derivative Pro 0.3.0

- **Bluesky:** `derivative-announce post --to bluesky --handle acme.bsky.social` posts each release with the changelog as a link card and your hashtags as real tags. It signs in with an app password from an environment variable, never the account password.
- **Statistics in your database:** `sqlStore` keeps the read statistics in Postgres or SQLite instead of a file, which is what serverless hosts such as Vercel need. It works with any driver (Neon, pg, postgres.js, better-sqlite3, Cloudflare D1) and creates its one table itself.

Existing licences get the update automatically. Pro starts at 12 CHF per month.

## Try it

The [docs](https://packages.sweber.dev/derivative/docs) cover `init`, the JSON Feed and both Pro additions. The [live demo](https://packages.sweber.dev/derivative/demo) shows the widget, and the full list of changes is in the [changelog on GitHub](https://github.com/Weber-Development/derivative/blob/main/packages/core/CHANGELOG.md).
