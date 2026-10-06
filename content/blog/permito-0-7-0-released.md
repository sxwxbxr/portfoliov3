---
title: "Permito 0.7.0: accessibility checks in three browsers, a CSP and SRI guide, and a focus fix"
excerpt: "Permito 0.7.0 tests the banner and the preference center against WCAG 2.2 AA in Chromium, Firefox and WebKit on every change. The first run found a real bug: focus was lost after closing the preference center."
date: 2026-10-06
author: Seya Weber
type: release
packages: [permito]
tags: [Permito, accessibility, WCAG, CSP, release]
---

Permito 0.7.0 is out on npm. It is a quality release on the way to 1.0: nothing new to configure, but a lot more that is checked.

## Accessibility is now tested, and it found a bug

Every change now runs an axe-core scan against WCAG 2.0 to 2.2 level A and AA on the banner, the preference center and the blocked-embed placeholder, plus a keyboard test for focus trapping and focus return. The tests run in Chromium, Firefox and WebKit.

The scans passed. The keyboard test did not: after closing the preference center, focus did not return to the floating settings button. The button is removed while the dialog is open, so the element that should get focus back no longer existed. Keyboard and screen reader users landed at the top of the page instead of where they were. Permito now remembers the opener before it is removed and gives focus to the re-created button. The fix is in the React components and in the script tag UI.

An automated scan finds only part of all accessibility problems. The new accessibility page says what is tested, what is built in and what you still need to check on your own site with your own theme and texts.

## Strict Content Security Policy

A new guide shows how to run Permito under `default-src 'none'; script-src 'self'; style-src 'self'`. The main point: the default stylesheet is inserted as a `<style>` element, which a strict `style-src` blocks. Either link `styles.css` and set `injectStyles: false`, or pass a `styleNonce`. The guide also covers nonces for scripts that Permito activates after consent, and how to pin the script tag build with Subresource Integrity. The policy claims were checked in a browser against a real CSP header.

## What is stable

A new API status page lists which parts are expected to be frozen at 1.0, which may still change before then, and what is deprecated (nothing at the moment). It is the starting point for the API freeze planned for 0.8.

## Upgrade

```bash
pnpm add @permitojs/core@^0.7.0 @permitojs/react@^0.7.0
```

Permito Pro keeps working with this release.

Permito is technical consent infrastructure, not legal advice. Automated checks do not replace an accessibility review of your own site.
