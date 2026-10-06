---
title: "Witness 0.4.0 released"
excerpt: "Witness Pro 0.4.0 verifies C2PA Content Credentials instead of only reading them, scans single-page apps in a browser and imports the AI register from a spreadsheet. The free package adds readC2paManifests for validators."
date: 2026-10-06
author: Seya Weber
type: release
packages: [witness]
tags: [Witness, EU AI Act, Article 50, AI transparency, C2PA, Content Credentials, single-page apps, release]
---

Witness 0.4.0 is about depth. Reading a C2PA manifest tells you what a file claims. Checking it tells you whether the claim still belongs to the file. The same goes for the checks: a single-page app that renders its chat and images in the browser has an empty HTML shell, so a static scan finds nothing. Witness Pro 0.4.0 closes both gaps and lets you start the AI register from the spreadsheet you already have. `@sweberdev/witness` and `@sweberdev/witness-react` 0.4.0 are on npm under the MIT licence.

## What is in 0.4.0

- Free: `readC2paManifests(bytes)` returns the raw structure of a C2PA manifest store: the decoded claim, the signed claim bytes, every assertion with the bytes that are hashed, and the signature. It is the input for validators, and the Pro scanner builds on it.
- Pro: **C2PA verification** in `witness-scan`. For every image, sound or video with a manifest it checks the claim signature, the assertion hashes, the hash of the file content and the signer's certificate chain against trust anchors you supply, such as the C2PA trust list. A file that was changed after signing, an altered assertion or a broken signature is the new `c2pa-invalid` error. With a trust list, an intact manifest from an unknown signer is the `c2pa-untrusted` warning.
- Pro: **single-page apps**. With `render`, the scanner serves your build, opens the routes you list in headless Chromium and runs the same rules on the rendered page, so the chat notice and the AI images an app renders in the browser are checked.
- Pro: **register import**. `witness-report import systems.csv` reads a spreadsheet export into the register, with comma, semicolon or tab delimiters and English or German column headings, merges by id and names the line of any unusable row. `witness-report export` writes the register back. The report's check table shows how many files verified.

Verification tells you a manifest is intact and which certificate signed it. It does not tell you that what the manifest says is true. For MP4, MOV and M4A files the scanner checks signature and assertions, not yet the file binding.

## Install

```sh
npm install @sweberdev/witness@0.4.0
```

```ts
import { readC2paManifests } from "@sweberdev/witness";

const manifests = readC2paManifests(bytes); // claim, assertions and signature per manifest
```

The [images guide](/witness/docs/guides/images) covers C2PA. In the [live demo](/witness/demo#pro) the scanner output now includes a file whose manifest no longer matches it.

## Witness Pro 0.4.0

The three Pro packages move to 0.4.0 together. Add the trust list and the render routes to the `scan` section of `witness.config.json`:

```json
{
  "scan": {
    "root": "dist",
    "c2pa": { "trustAnchors": ["trust/c2pa-trust-list.pem"] },
    "render": { "routes": ["/", "/support"], "waitFor": "#chat" }
  }
}
```

Rendering needs the optional `playwright-core` and a Chromium. See the [scanner docs](/witness/docs/pro/scan) and the [report docs](/witness/docs/pro/report), and the [Witness page](/witness) for the Pro edition.
