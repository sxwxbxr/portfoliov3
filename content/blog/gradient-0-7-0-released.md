---
title: "Gradient 0.7.0: one config file, a build command and a GitHub Action"
excerpt: "Describe your colors once in gradient.config.json, generate every file with gradient build, and let a GitHub Action fail pull requests that leave the files out of date."
date: 2026-10-06
author: Seya Weber
type: release
packages: [gradient]
tags: [Gradient, Color, CI, GitHub Actions, release]
---

Gradient 0.7.0 is out. Until now every generated file needed its own command, and nothing stopped a pull request from changing the brand color without regenerating the stylesheet. 0.7.0 fixes both. Update with `npm install @sweberdev/gradient@latest`; nothing in the existing API changed.

## One config file

```sh
npx @sweberdev/gradient init "#e30613" accent=#0a84ff --format shadcn --out app/globals.css
npx @sweberdev/gradient build
```

`init` writes a starter `gradient.config.json`, `build` writes every file in it:

```json
{
  "$schema": "https://unpkg.com/@sweberdev/gradient/gradient.config.schema.json",
  "colors": { "brand": "#e30613", "accent": "#0a84ff" },
  "palette": { "status": true },
  "outputs": [
    { "file": "app/globals.css", "format": "shadcn" },
    { "file": "src/colors.ts", "format": "ts" },
    { "file": "app/chart.css", "format": "series", "count": 5 }
  ]
}
```

Every format of the CLI works as an output, including the chart colors. A typo in a key is an error that names the field instead of silently doing nothing, and the JSON schema gives your editor completion.

## Verify in CI

```sh
npx @sweberdev/gradient build --verify
```

`--verify` writes nothing. It exits with `1` when a generated file is missing or differs from what the config produces, when a contrast promise fails (for example with `pin`), or when a stylesheet listed under `audit` breaks the contrast steps. `--json` and `--markdown` print the result for other tools.

## GitHub Action

```yaml
- uses: actions/checkout@v4
- uses: Weber-Development/gradient@v0
```

The action runs the same checks on a pull request, writes the result to the job summary and keeps one comment on the pull request that it updates on every push. Inputs let you audit stylesheets without a config file and pin the version. Pull requests from forks get a read-only token, so there the comment is skipped and the summary stays.

## In code

`parseConfig()` validates a config and `renderConfig()` returns the content of every file without touching the file system, so it also runs in the browser, for example in a theme editor.

## Try it

The [live demo](https://packages.sweber.dev/gradient/demo) has a new section that shows the config file for your colors and the files `gradient build` would write. The guides for the [config file](https://packages.sweber.dev/gradient/docs/guides/config-file) and the [GitHub Action](https://packages.sweber.dev/gradient/docs/guides/github-action) have the details.
