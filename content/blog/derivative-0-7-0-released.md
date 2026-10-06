---
title: "Derivative 0.7.0: tested in a real browser, feature flags and LinkedIn"
excerpt: "Chromium tests found two accessibility bugs that jsdom could not see, and both are fixed. Four starter projects show the widget in Vite, Next.js, SvelteKit and Astro. Derivative Pro ties entries to feature flags and posts releases to LinkedIn."
date: 2026-10-06
author: Seya Weber
type: release
packages: [derivative]
tags: [Derivative, Changelog, Release notes, Accessibility, Feature flags, release]
---

Derivative 0.7.0 is on npm. The headline is not a new switch but a new kind of test: the widget now runs in a real Chromium browser in CI, and it found two problems straight away.

## What the browser found

Version 0.6.0 put axe into the test suite, with one gap: jsdom has no layout and no colours, so contrast could not be checked. 0.7.0 closes it. The browser tests open the panel, press Escape, check the phone layout, search, reduced motion, and run axe's colour-contrast rules in light mode, dark mode and with a theme forced against the system setting.

- **Contrast.** The Breaking, Security and Fixed badges had a contrast of about 4.2:1 in light mode, just under the 4.5:1 that WCAG AA asks for. They are darker now.
- **Right-to-left pages.** On a page with `dir="rtl"`, the panel opened off-screen. The panel and the toast now use logical CSS properties and open from the correct side.

Both fixes ship in this release for everyone, free and Pro.

## Four starter projects

The repository has an `examples` folder with a small project each for Vite, Next.js (App Router, with the React component), SvelteKit and Astro. Each reads its own `CHANGELOG.md`, writes `changelog.json` before the build and embeds the widget with search and the announcement toast. CI builds all four against the published package, so they do not rot.

## Derivative Pro: feature flags

If you ship behind flags, the changelog should follow them. Mark an entry with the flag key and pass a provider to the feed handler:

```ts
import { createFeedHandler, unleashFlags } from "@weber-development/derivative-segments";

export const GET = createFeedHandler({
  feed: () => loadFeed(),
  rules,
  viewer: async (request) => ({ userId: (await getSession(request))?.id }),
  flags: unleashFlags({ url: "https://unleash.acme.example", token: process.env.UNLEASH_FRONTEND_TOKEN! }),
});
```

An entry written as `Export to DATEV [for: datev-export]` is then shown only to users who have that flag on. There are adapters for Unleash and LaunchDarkly, and any function that returns flag keys works too. Results are cached for 30 seconds per user, and if the flag service is down the feed is served without the flagged entries instead of failing.

## Derivative Pro: LinkedIn

`derivative-announce post --to linkedin` publishes each new release on your company page, with the summary and entries as text and the changelog as a link card. It joins Slack, Teams, Discord, Mattermost, Google Chat, Mastodon and Bluesky, and works with the same `--state` file that prevents double posts.

Existing licences get the update automatically. Pro starts at 12 CHF per month.

## Try it

The [docs](https://packages.sweber.dev/derivative/docs) cover the examples, feature flags and LinkedIn. The [live demo](https://packages.sweber.dev/derivative/demo) runs the 0.7.0 widget, and the full list of changes is in the [changelog on GitHub](https://github.com/Weber-Development/derivative/blob/main/packages/core/CHANGELOG.md).
