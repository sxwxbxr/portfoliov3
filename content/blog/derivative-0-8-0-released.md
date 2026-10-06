---
title: "Derivative 0.8.0: a dashboard route for Pro and a widget you can style"
excerpt: "Derivative Pro serves its insights dashboard from your own backend, behind your login. The widget gains seven custom properties and a set of styling parts, plus recipes for dark mode switches and right-to-left pages."
date: 2026-10-06
author: Seya Weber
type: release
packages: [derivative]
tags: [Derivative, Changelog, Release notes, Theming, Insights, release]
---

Derivative 0.8.0 is on npm. It makes the widget easier to bend to your design, and it lets Derivative Pro show you its numbers without a script or a file to host.

## Derivative Pro: the dashboard as a route

Until now the insights report was a file: you ran a command, got an HTML page and put it somewhere. In 0.8.0 the dashboard is a route in your own backend:

```ts
import { basicAuth, createDashboardHandler } from "@weber-development/derivative-insights";

export const GET = createDashboardHandler({
  store,
  feed: () => loadFeed(),
  authorize: basicAuth("team", process.env.INSIGHTS_PASSWORD!),
});
```

Open it in a browser for the last 30 days, add `?days=7` for a different period, `?format=json` for the summary or `?format=csv` for a spreadsheet. Access control is required, there is no open default: use `basicAuth`, `bearerAuth` for scripts, or your own session check. The page is never cached, tells search engines to stay away, and ships with a Content-Security-Policy that forbids scripts and external requests, so the numbers cannot leak through a third-party asset.

## Theming

The widget already took colours from CSS custom properties. 0.8.0 adds the rest of what people ask for first:

- `--dv-button-radius`, `--dv-button-bg` and `--dv-button-fg` for the button
- `--dv-badge-fg` for the unread badge
- `--dv-shadow` and `--dv-max-height` for the panel
- `--dv-z` for the stacking order

Beyond properties, `::part()` now reaches the header, the title, the close button, the search field, every release and entry, the type badges, scopes and the toast:

```css
derivative-widget::part(release-title) { font-family: "Space Grotesk", sans-serif; }
derivative-widget::part(entry) { padding-block: 0.25rem; }
```

The widget guide also has a short recipe for apps with their own dark mode switch (a class on `<html>`) and a note on right-to-left pages, where the panel and the toast open from the correct side since 0.7.0. The browser tests check both, and that your page styles really reach the shadow DOM.

## Try it

The [widget guide](https://packages.sweber.dev/derivative/docs) lists all properties and parts, the Pro guides cover the dashboard route, and the [live demo](https://packages.sweber.dev/derivative/demo) runs the 0.8.0 widget. Existing Pro licences get the update automatically, and Pro starts at 12 CHF per month. The full list of changes is in the [changelog on GitHub](https://github.com/Weber-Development/derivative/blob/main/packages/core/CHANGELOG.md).
