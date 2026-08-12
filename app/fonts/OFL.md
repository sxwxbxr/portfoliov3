# Self-hosted fonts

Latin subsets of the variable font files Google Fonts serves, vendored here so
`next build` does not depend on `fonts.gstatic.com` being reachable. See the
comment above the `localFont` calls in `app/layout.tsx` for why.

| File | Family | Axis range | Upstream |
|---|---|---|---|
| `Inter-Variable-latin.woff2` | Inter | 100–900 | https://fonts.google.com/specimen/Inter |
| `SpaceGrotesk-Variable-latin.woff2` | Space Grotesk | 300–700 | https://fonts.google.com/specimen/Space+Grotesk |
| `JetBrainsMono-Variable-latin.woff2` | JetBrains Mono | 100–800 | https://fonts.google.com/specimen/JetBrains+Mono |

## Licence

All three are licensed under the **SIL Open Font License 1.1**, which permits
redistribution and self-hosting, including as part of a larger work, provided
the fonts are not sold on their own and the licence travels with them.

- Inter — Copyright (c) 2016 The Inter Project Authors
  <https://github.com/rsms/inter> · <https://openfontlicense.org/>
- Space Grotesk — Copyright (c) 2020 The Space Grotesk Project Authors
  <https://github.com/floriankarsten/space-grotesk>
- JetBrains Mono — Copyright (c) 2020 The JetBrains Mono Project Authors
  <https://github.com/JetBrains/JetBrainsMono>

Full licence text: <https://openfontlicense.org/open-font-license-official-text/>

## Refreshing them

Only needed when upstream ships a new version. Fetch the CSS with a modern
browser user-agent, take the URL from the **last** `@font-face` block (the
plain `latin` subset — its unicode-range starts at U+0000 and covers German
umlauts), and download it:

```
https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap
https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300..700&display=swap
https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@100..800&display=swap
```

Without a browser user-agent Google serves ttf instead of woff2.
