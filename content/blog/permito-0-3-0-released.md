---
title: "Permito 0.3.0: the cookie banner as a script tag, no React needed"
excerpt: "Permito 0.3.0 brings the banner, preference dialog and Consent Mode v2 to WordPress, static sites and CMS templates with a single script tag."
date: 2026-10-06
author: Seya Weber
type: release
packages: [permito]
tags: [Permito, WordPress, JavaScript, GDPR, revDSG, Consent Mode, release]
---

Permito 0.3.0 is out. Until now the banner and the preference dialog existed only as React components. Many agency sites run on WordPress, Craft, Kirby, Webflow exports or plain HTML, and those projects had to build their own UI on top of `@permitojs/core`. That gap is now closed.

## One script tag

```html
<script type="application/json" id="permito-config">
  {
    "config": {
      "consentVersion": "2026-10",
      "categories": [
        { "id": "necessary", "required": true },
        { "id": "statistics" },
        { "id": "marketing" }
      ]
    },
    "privacyPolicyUrl": "/datenschutz",
    "googleConsentMode": true,
    "consentModeDefault": true
  }
</script>
<script src="/vendor/permito.global.js" data-config="#permito-config"></script>
```

That renders the same banner, preference dialog and floating settings button as the React package, with the same styles, translations and keyboard handling. "Reject all" stays exactly as prominent as "Accept all". The file is about 12 KB gzip and ships inside `@permitojs/core` as `dist/permito.global.js`, so you can host it yourself and nothing loads from a third party.

Scripts you mark with `type="text/plain" data-consent-category="statistics"` run only after consent, and Google Consent Mode v2 defaults are set before any tag fires. Any link or button with `data-permito-open` opens the settings, which is handy for the privacy policy and the footer.

## The same UI from JavaScript

If you use a bundler but no React, for example with Astro, Svelte or vanilla TypeScript, import the UI directly:

```ts
import { createConsentUI } from "@permitojs/core/ui";
import "@permitojs/core/styles.css";

const ui = createConsentUI({ config, privacyPolicyUrl: "/datenschutz" });
ui.openPreferences();
```

`window.Permito` offers the same `open()`, `close()` and `manager` for script-tag setups.

## Upgrade

```bash
pnpm add @permitojs/core@^0.3.0 @permitojs/react@^0.3.0
```

Nothing changes for React setups. The stylesheet now lives in `@permitojs/core/styles.css`, and `@permitojs/react/styles.css` keeps working. The new guide [Without a framework](https://packages.sweber.dev/permito/docs/guides/script-tag) covers self-hosting, CDN use and all options.

## What comes next

Consent bridges for Microsoft UET, Microsoft Clarity and Matomo, and more languages. Permito Pro adds the scanner, which checks any URL regardless of the framework behind it, and the generated cookie table.

Permito is technical consent infrastructure, not legal advice. Whether a service needs consent is your assessment.
