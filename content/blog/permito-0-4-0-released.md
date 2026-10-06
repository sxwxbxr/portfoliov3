---
title: "Permito 0.4.0: consent for Microsoft Advertising, Clarity and Matomo"
excerpt: "Permito 0.4.0 forwards the visitor's decision to Microsoft UET, Microsoft Clarity and Matomo, next to Google Consent Mode."
date: 2026-10-06
author: Seya Weber
type: release
packages: [permito]
tags: [Permito, Microsoft Advertising, Clarity, Matomo, GDPR, revDSG, release]
---

Permito 0.4.0 is out. Until now the visitor's decision reached Google tags through Consent Mode v2, while every other tool needed hand-written glue. Three tools that agencies in Switzerland, Germany and Austria use a lot now get a bridge each.

## Microsoft Advertising (UET)

Microsoft's UET tag has its own consent mode. Permito sets `ad_storage` to denied before the tag runs and sends an update as soon as the visitor decides. By default the `marketing` category decides.

## Microsoft Clarity

Clarity expects a consent signal for visitors from the EEA, the UK and Switzerland. Permito sends `consentv2` with separate values for analytics storage (`statistics`) and ad storage (`marketing`). Without a granted signal Clarity runs without cookies.

## Matomo

Matomo waits for consent with `requireConsent`, or tracks without cookies until consent with `requireCookieConsent`. Permito then gives or withdraws consent on every page view. The decision itself stays in Permito's cookie, so there is one source of truth for the banner, the cookie table and the consent log.

## Turn it on

```tsx
<PermitoProvider config={config} googleConsentMode microsoftUet clarity matomo>
```

For the script tag it is the same three keys in the JSON config. The script-tag build sets the UET and Matomo defaults itself, as long as it loads in `<head>` before those tags. React and Next.js setups render `getMicrosoftUetDefaultScript()` and `getMatomoDefaultScript()` from `@permitojs/react/server`.

## Upgrade

```bash
pnpm add @permitojs/core@^0.4.0 @permitojs/react@^0.4.0
```

The guide [Microsoft UET, Clarity and Matomo](https://packages.sweber.dev/permito/docs/guides/microsoft-matomo) lists every option and the category mapping.

Which category a tool belongs to, and whether cookieless Matomo tracking without consent is allowed for a site, is your assessment. Permito is technical consent infrastructure, not legal advice.
