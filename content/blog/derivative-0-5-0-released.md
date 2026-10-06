---
title: "Derivative 0.5.0: Vue, helpful votes and translated changelogs"
excerpt: "New Vue 3 bindings and a Svelte guide. Derivative Pro lets readers vote on each release and translates your changelog with DeepL or an AI model, only paying for what changed."
date: 2026-10-06
author: Seya Weber
type: release
packages: [derivative]
tags: [Derivative, Changelog, Release notes, Vue, Svelte, Translation, release]
---

Derivative 0.5.0 is on npm. The free part now fits more stacks, and Derivative Pro answers two questions product teams ask about every release: did it help, and can I show it in my customers' language?

## Vue and Svelte

`@sweberdev/derivative-vue` is a new package with a `<WhatsNew>` component and a `useChangelog` composable for Vue 3 and Nuxt:

```vue
<WhatsNew src="/changelog.json" lang="de" announce search @read="onRead" />
```

Props match the widget attributes, events are `open` and `read`, and the icon is a slot. Svelte needs no wrapper at all, so the docs have a guide with the dynamic import, event handling and the type declaration for `svelte-check`. The widget also fires a new `derivative-render` event after it draws the list, which extensions like the Pro votes use.

## Derivative Pro: did it help?

`addReactions` puts a "Was this helpful?" vote under every release in the widget. Votes go to your own insights endpoint, next to the opens and clicks you already collect. There is still no cookie and no visitor ID: the browser remembers its own votes, and a changed vote names the old one, so it replaces it instead of counting twice. The report and the CSV show helpful and not helpful per release and the share of helpful votes overall, so you can see which releases landed and which did not.

## Derivative Pro: translated changelogs

`derivative-segments translate` writes `changelog.de.json`, `changelog.fr.json` and `changelog.it.json` from your feed. It works with DeepL, any OpenAI-compatible endpoint (including a local model) and Anthropic, using your own API key, so your texts go only to the provider you chose.

```sh
npx derivative-segments translate --feed public/changelog.json --to de,fr,it --provider deepl --keep "Acme"
```

Three details make it usable in a release pipeline:

- **Nothing breaks:** versions, dates, scopes and links never change, and inline code, link targets and the names in `--keep` are protected. If a translation damages one of them, that text keeps its original wording and the command exits with 1, so CI notices.
- **You pay for changes only:** translations are cached in a file you commit. A run sends only new or changed texts, and `--dry-run` shows the number of characters before anything is sent.
- **Fixable by hand:** the cache is plain JSON, so you can correct a sentence and it stays corrected.

Point the widget at the file for the reader's language: `<derivative-widget src="/changelog.de.json" lang="de">`.

Existing licences get the update automatically. Pro starts at 12 CHF per month.

## Try it

The [docs](https://packages.sweber.dev/derivative/docs) cover the Vue and Svelte guides, reactions and translations. The [live demo](https://packages.sweber.dev/derivative/demo) runs the 0.5.0 widget, and the full list of changes is in the [changelog on GitHub](https://github.com/Weber-Development/derivative/blob/main/packages/core/CHANGELOG.md).
