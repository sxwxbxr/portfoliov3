---
title: "Inverse 0.8.0 released"
excerpt: "Inverse gets a WordPress plugin with a settings page, and the links and both forms are now checked with axe in the tests. Inverse Pro adds the evidence dossier as a PDF, one ledger per client for agencies, and time stamp anchors on a schedule."
date: 2026-10-09
author: Seya Weber
type: release
packages: [inverse]
tags: [Inverse, Widerrufsbutton, Kündigungsbutton, WordPress, WooCommerce, accessibility, release]
---

Inverse 0.8.0 is out. `@sweberdev/inverse` and `@sweberdev/inverse-react` are on npm under the MIT licence, and the Pro packages are updated on GitHub Packages for licence holders. Nothing breaks: 0.7.0 code keeps working as it is.

## What is in 0.8.0

- **WordPress plugin.** If you prefer a settings page to pasted code, copy [`wordpress/inverse-widerruf`](https://github.com/Weber-Development/inverse/tree/main/wordpress/inverse-widerruf) to `wp-content/plugins/` and activate it. Set the handler URL under *Settings → Inverse*. The plugin adds the footer links with the statutory labels on every page, the shortcodes `[inverse_withdrawal]` and `[inverse_cancellation]`, and, with WooCommerce, links in the account area and below every order with the order number prefilled. It is one PHP file (PHP 7.4 or newer) and loads the script-tag build; the handler stays on your own server.
- **Accessibility tests.** The links and both forms, in German and English, with and without validation errors, are checked with axe in the test suite. Colour contrast cannot be checked without a browser layout, so the tests leave it out; check your own theme for contrast.

```sh
pnpm add @sweberdev/inverse@^0.8.0 @sweberdev/inverse-react@^0.8.0
```

Docs: [packages.sweber.dev/inverse/docs](https://packages.sweber.dev/inverse/docs/guides/platforms). Try the flows in the [demo](https://packages.sweber.dev/inverse/demo).

## Inverse Pro 0.8.0

- **Dossier as PDF.** `inverse-ledger dossier --pdf dossier.pdf` writes the evidence dossier as an A4 PDF with chain status, declarations, anchors and the manifest hash, in German or English.
- **One ledger per client.** `createTenantLedgers({ storeFor })` keeps each shop in its own hash chain, so a client can be verified, exported or erased on its own. `verifyAll()` checks every chain.
- **Anchors on a schedule.** `inverse-ledger anchor --tsa <url> --if-due-hours 24` from a daily cron job anchors only when there are new entries and the last anchor is old enough.

Inverse Pro is available on the [package page](https://packages.sweber.dev/inverse), from CHF 19 a month.
