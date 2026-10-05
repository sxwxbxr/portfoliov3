---
title: "Witness 0.1.0 released"
excerpt: "AI notices, AI labels and machine-readable marking for Article 50 of the EU AI Act: web components, React components, image and text marking and middleware for the Vercel AI SDK."
date: 2026-10-05
author: Seya Weber
type: release
packages: [witness]
tags: [Witness, EU AI Act, Article 50, AI transparency, Vercel AI SDK, Web Components, React, release]
---

Witness 0.1.0 is out. It gives you the building blocks for the transparency duties in Article 50 of the EU AI Act: a chatbot notice, labels for AI content and machine-readable marking for images and text. `@sweberdev/witness` and `@sweberdev/witness-react` are on npm under the MIT licence.

## Why

Article 50 has applied since 2 August 2026. People must know when they are talking to an AI system, generated content must be marked in a machine-readable way, and deepfakes and AI text on matters of public interest must be disclosed. For the machine-readable marking of systems that were already on the market before that date, the Digital Omnibus agreement gives time until 2 December 2026. Most of the tooling so far sits with the large model providers. Witness covers the part that ends up in your app: what visitors see, and what the files you publish carry.

Witness is a tool, not legal advice. It helps you implement the duties; it does not confirm compliance. The [Article 50 summary](https://packages.sweber.dev/witness/docs/legal/article-50) in the docs lists who has which duty, with sources.

## What is in 0.1.0

- `<witness-notice>`: a chatbot notice that stays expanded until the visitor acknowledges it, then shrinks to a compact label that can be reopened. It fires `witness-shown` and `witness-acknowledged` events you can keep as evidence.
- `<witness-label>`: a badge for AI-generated, AI-edited or deepfake content with a details popover, inline or as an overlay on an image.
- Image marking: XMP with the IPTC digital source type written straight into PNG, JPEG and WebP files, in the browser or on the server. Files that already carry a C2PA manifest are left untouched.
- An invisible text watermark that survives copy and paste and can be read back.
- Middleware for the Vercel AI SDK that marks text from `generateText` and `streamText` and images from `generateImage` as the model produces them.
- schema.org JSON-LD, meta tags and Next.js metadata for AI content.
- The `witness` CLI to mark images in a build step and inspect files.
- React components: `<AiNotice>`, `<AiLabel>`, `<AiContent>` and `useAiDisclosure`.
- Wording in English, German, French and Italian.

## Install

```bash
pnpm add @sweberdev/witness @sweberdev/witness-react
```

Put the notice above your chat and wrap generated content:

```tsx
import { AiNotice, AiContent } from "@sweberdev/witness-react"
import "@sweberdev/witness/styles.css"

export default function Chat() {
  return (
    <>
      <AiNotice kind="chatbot" id="support-chat" />
      <AiContent labelPosition="overlay" marking={{ kind: "generated", generator: "gpt-image-2" }}>
        <img src="/hero.png" alt="Beach at dusk" />
      </AiContent>
    </>
  )
}
```

Try the notice, the labels, the watermark and the image marking in the [live demo](https://packages.sweber.dev/witness/demo). The full reference is at [packages.sweber.dev/witness/docs](https://packages.sweber.dev/witness/docs).

## Witness Pro

Witness Pro is for agencies that look after several client sites. It adds the notice and label wording in all 24 official EU languages, a CI scanner that fails the build when AI images or text lack a label or marking, and an AI register that turns into a transparency report for your client and a public "How we use AI" page. The [demo](https://packages.sweber.dev/witness/demo#pro) shows its output for a made-up client. Licences start at 19 CHF a month for one person; see the [package page](https://packages.sweber.dev/witness) for all plans.
