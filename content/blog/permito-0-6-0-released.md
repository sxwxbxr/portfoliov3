---
title: "Permito 0.6.0: Vue and Svelte adapters, and server guides for Nuxt, SvelteKit, Remix and Astro"
excerpt: "Permito 0.6.0 adds reactive consent state for Vue 3 and Svelte on top of the same core engine, and shows how to read the stored decision on the server in four frameworks."
date: 2026-10-06
author: Seya Weber
type: release
packages: [permito]
tags: [Permito, Vue, Svelte, SvelteKit, Nuxt, Astro, release]
---

Permito 0.6.0 is out on npm. Until now the framework-free engine was usable from Vue and Svelte, but you had to wire it up yourself. Two small adapters close that gap.

## Vue 3

```ts
import { createApp } from "vue";
import { createConsentManager } from "@permitojs/core";
import { permito } from "@permitojs/core/vue";

const manager = createConsentManager({ consentVersion: "2026-10", categories });
createApp(App).use(permito(manager)).mount("#app");
```

```vue
<script setup lang="ts">
import { useConsent, useHasConsent } from "@permitojs/core/vue";

const { snapshot, acceptAll, rejectAll } = useConsent();
const statistics = useHasConsent("statistics");
</script>
```

`useConsent`, `useHasConsent` and `useHasServiceConsent` are reactive and stop listening with the component. `vue` is an optional peer dependency, so nobody else pays for it. The adapter is 487 bytes gzip.

## Svelte and SvelteKit

```svelte
<script lang="ts">
  import { categoryStore, needsConsentStore } from "@permitojs/core/svelte";
  const needsConsent = needsConsentStore(manager);
  const statistics = categoryStore(manager, "statistics");
</script>

{#if $needsConsent}<button on:click={() => manager.acceptAll("banner")}>Accept all</button>{/if}
```

The stores follow the Svelte store contract and need no Svelte dependency, so they work in Svelte 3, 4 and 5. The adapter is 238 bytes gzip.

## Reading the decision on the server

A new guide shows the same two helpers in SvelteKit hooks, Remix and React Router loaders, Astro pages and Nuxt: `readConsentFromCookieHeader` and `readGpcFromHeaders`. Pass the result as `initialState` so the first render already knows what the visitor chose and gated content does not flash.

## What is not there yet

There is no Vue or Svelte banner. Use the script tag UI or build your own with the composables and stores. A ready-made banner per framework is a candidate for a later release.

## Upgrade

```bash
pnpm add @permitojs/core@^0.6.0
```

Both adapters are subpath exports of `@permitojs/core`, so there is no new package to install. Permito Pro keeps working with this release.

Permito is technical consent infrastructure, not legal advice.
