# CAST — Handover

**Branch:** `newDesignV3` · **PR:** [#39](https://github.com/sxwxbxr/portfoliov3/pull/39) → `main` (open, mergeable)
**Last commit at time of writing:** `354c302`
**Written:** 2026-08-11

This is the pick-up-from-anywhere document for the redesign. It records what was built, the decisions behind it, what was verified and what was not, and what is still open.

Two companion documents already live in `docs/`:

- `DESIGN_MOTION_PLAN.md` — the original design and animation study, including the animation catalogue and the anime.js v4 integration plan. Its visual direction ("Datum") was **superseded** by the decision to build neumorphism; its motion catalogue, its bug findings and its anime.js reference are still current.
- `NEUMORPHISM_EVALUATION.md` — the evidence pass on neumorphism, accessibility overlays and spatial UI. Explains *why* the palette had to be re-based and why the accessibility argument turned out to be the weakest one.

---

## 1. Getting the project running

```bash
pnpm install --frozen-lockfile   # pnpm-lock.yaml is authoritative; package-lock.json is stale
pnpm dev                          # http://localhost:3000
```

`.env.local` must contain `DATABASE_URL` (Neon). Without it the site still runs: `lib/data.ts` falls back to defaults and empty arrays, so you can work on markup and styling. **A configured-but-failing database still throws** — that is deliberate, a broken production database must not be papered over with placeholder content.

Checks:

```bash
npx tsc --noEmit         # must be clean; next.config.mjs has ignoreBuildErrors: false
pnpm check:contrast      # verifies the palette against its targets
pnpm build               # full production build
```

Do not run `build` while `dev` is running — they share `.next` and the dev server dies.

---

## 2. What CAST is

Objects are cast **out of** the ground rather than laid on top of it. One light source at the top-left, a raised polarity and a sunken one, nothing floating.

Two rules keep it from reading as a 2020 throwback. Both matter more than they look:

1. **Geometry is halved.** Canonical soft-UI uses 8–9px offsets and 16–18px blur. That is what reads as "pillow". CAST uses `--cast-x: 6px` / `--cast-blur: 14px` with tight radii, which reads as milled. If it ever starts looking soft-in-a-bad-way, these two numbers are the dial.
2. **Every control keeps a real border.** The shadow is the material; the border is the affordance. That separation is the entire reason the system can stay soft while its edges still clear 3:1 — it is precisely the degree of freedom classic neumorphism gives up by deleting the border. **Do not remove `border` from `.control` or `.field`.**

### The utility contract — `app/globals.css`

Never hand-write a `box-shadow`. Never use `bg-white`, `bg-black`, `text-gray-*`.

| Class | Meaning |
|---|---|
| `.cast` / `.cast-sm` | raised plate (cards, tiles, panels) / tighter (chips, seats) |
| `.well` / `.well-sm` | sunken container (tracks, groups, recesses, image frames) / tighter |
| `.rim` | hairline light catch. **Large `.cast` surfaces only**, never chips |
| `.control` | button: raised + real border; pressing inverts polarity |
| `.control-primary` | the one accent-filled surface. Primary action only |
| `.field` | text input: sunken, opposite polarity to a button |
| `.annotate` | mono uppercase label, tabular numerals |
| `.tabular` | tabular numerals |
| `.tab` | small raised index marker |
| `.sheet` | page container. Replaces every hand-written `max-w-[1200px] mx-auto px-6` |
| `.measure` | 68ch max-width for running text |
| `.def-grid` | the two-column label/content grid |
| `.link-underline` | link with a left-growing underline |

Colour utilities: `bg-ground bg-plate bg-well` · `text-fg text-fg-muted text-fg-subtle` · `text-signal bg-signal bg-signal-bright` · `border-edge border-edge-soft` · `text-destructive`.

The shadcn token names (`--background`, `--card`, `--muted-foreground`, …) are still defined as aliases onto CAST tokens, which is what keeps `/admin` and `components/ui/` coherent without being redesigned.

### Live style guide

`/design` renders every material in isolation with its measured contrast, fetches nothing, and is `noindex`. Use it to judge a token change before touching a page. It is the fastest way to see the material in both themes.

---

## 3. The palette is derived, not chosen

This is the part most likely to be undone by accident, so it is worth understanding.

The objection to neumorphism was contrast arithmetic, so the palette was **solved** rather than picked by eye. Every text and edge token is the value closest to its ground that still clears its target against the **worst surface it can land on**, clamped to the sRGB gamut.

**The worst surface differs per mode**, and this is the single easiest thing to get wrong:

- **Light mode → the sunken well.** It is the darkest surface, so dark text has least room there.
- **Dark mode → the raised plate.** It is the lightest surface, so light text has least room there.

Checking against `--ground` alone passes tokens that then fail inside a real `.well` or on a real `.cast`.

Measured, both modes:

| | Light | Dark |
|---|---|---|
| Body text | 10.02:1 | 10.03:1 |
| Muted text | 4.62:1 | 4.61:1 |
| Annotation / control edge | 3.11:1 | 3.11:1 |
| Accent as text | 4.62:1 | 4.60:1 |

**Accent hue is 165** (`#026e4f` light / `#03b483` dark). The solver preferred hue 150 because it maximises available chroma at those lightnesses — but that renders as a traffic-light green rather than a brand colour. This was a deliberate override of the optimiser.

### If you change any token

```bash
pnpm check:contrast          # fails loudly, exit code 1
pnpm check:contrast -- --all # also prints the decorative separations
```

`scripts/check-contrast.mjs` **parses `app/globals.css`** rather than holding its own copy, so it cannot drift from what ships. It also flags out-of-gamut oklch, which is a silent failure otherwise: the browser clamps, so the colour you get is not the colour the token names and its real contrast is not the computed one.

### Why the grounds are where they are

Neumorphism needs mid-tone grounds. The old palette was `oklch(0.98)` light / `oklch(0.09)` dark. At `oklch(0.09)` (`#020203`) the maximum contrast **any** darker shadow can reach — even pure black — is **1.01:1**. The dual-shadow trick was not difficult there, it was unavailable. Re-basing to `0.920` / `0.300` is what makes the material possible at all, and it is why this had to be a rebuild rather than a restyle.

---

## 4. Layout decisions and their reasons

The old site rendered nine surfaces as the same `border-t` row list. That was its biggest visual weakness, so content now gets object shapes:

- **Collections with imagery** → tiles in a grid.
- **Sequences** (experience, education, engagement models) → a sunken channel with entries seated in it, the current one raised.
- **Groups of small labels** → a `.well` holding `.well-sm` or `.cast-sm` chips.
- **Pricing / offers** → the most raised objects on the site.
- **Forms** → `.field` inputs in a `.cast` panel with a `.control-primary` submit.
- **Empty states** → `components/EmptyState.tsx`, never a bare paragraph.

Specific calls worth keeping:

**Project tiles recess the image into the plate.** This is the one place the material metaphor is literally true — a screen set into a panel. The important side effect: a tile with no image still reads as deliberate, because the recess is filled by an engraved index instead of a broken frame. Five of nine seeded projects point at files that do not exist, so that is the common case, not the edge case. Never render a bare `next/image` for a content-authored path; resolve it with `resolveImage()` from `lib/project-image.ts` (server-side, keeps the `fs` check out of the client bundle) and pass the result down.

**Navigation runs the primary links in a sunken track with the active page as a raised seat.** "Where am I" is answered by physical position, not only by hue. Contact sits outside the track as the single accent-filled control, because it is an action rather than a peer destination. There is deliberately **no disclosure menu** — an earlier "More" dropdown was a 540px three-column panel rendering three links, and it sat as a raised control beside a sunken track, two opposite polarities at the same level of hierarchy.

**Reveal travel is 8px, not 32px, and list stagger offsets horizontally.** A long slide reads as a template; a vertical stagger down a vertical list reads as the whole list sagging.

**`/skills` folded into `/about`.** It was a route advertised in the nav that rendered an empty state. It is now one section with two sources: the database rows when they exist, the hand-written summary when they do not — so filling the admin upgrades the page instead of producing a second section that says the same thing twice. Old URL 308s to `/about#skills` via `next.config.mjs`.

**No proficiency bars anywhere.** Self-assessed meters invent precision the data does not have, and to a technical reader they are the clearest junior signal on a portfolio. Skill level stays a mono word. This came up repeatedly during the build; it is a standing decision, not an oversight.

---

## 4b. Fonts are self-hosted, deliberately

`app/layout.tsx` uses `next/font/local` against three woff2 files in `app/fonts/`, not `next/font/google`.

A Vercel build failed because three Space Grotesk instances did not come back from `fonts.gstatic.com`. `next/font/google` downloads the files during `next build`, and it reports that failure as `TypeError: Cannot read properties of null (reading '1')` rather than as a network error — an opaque failure for something entirely outside our control. Making the site's typography depend on a third party being reachable at build time is not a trade worth keeping, least of all right after fixing the bug that stopped those faces rendering at all.

The vendored files are the **latin subsets of the same variable fonts** Google serves, all SIL OFL licensed — see `app/fonts/OFL.md` for the licence and for how to refresh them. Because they are variable, the declared ranges cover every weight the design uses, which also fixed a smaller pre-existing problem: the old config loaded Inter 400 and 500 only, while the UI asks for `font-semibold` (600) in several places, so the browser was synthesising it.

Total cost: ~108 KB across three files, which is what `next/font/google` was downloading and emitting anyway.

## 4c. /experience and /education are one page

They merged into `/career`. Both old URLs 308 there.

The reason is factual rather than cosmetic. In the Swiss apprenticeship model work and school run **concurrently** — an EFZ is a job and a school at the same time. Split across two pages, the work page showed an unexplained 11-month gap in 2024/25 where the Berufsmaturität actually sat, and a 6-month one between an EFZ finishing and the next role starting. Neither page was wrong; both were partial.

That also dictates the shape of the chart: **two lanes, not one line.** Collapsing work and education onto a single axis would misrepresent the biography, because the overlap during the apprenticeships is the thing worth seeing.

- `lib/career.ts` builds the model. Positions come from the `startDate` / `endDate` `"YYYY-MM"` columns, which are the source of truth; the stored `period` string is derived and must never be parsed back.
- `components/career/CareerTimeline.tsx` draws the chart. Bars are revealed with `clip-path`, **never `scaleX`** — they carry a text label, and scaling a bar horizontally squashes its own contents for the length of the animation. The bars are `<button>` elements that move focus to their entry, so the chart is a way to navigate the page rather than a picture of it.
- `components/career/CareerExplorer.tsx` owns the shared selection: hovering a bar highlights its entry and vice versa.
- `now` is injected into `buildCareerTimeline` so a statically rendered page cannot bake in a stale "today" and so the model is testable.

### A dating bug fixed along the way

`isCurrentRange` only looked at the end date, so anything ending in the future was labelled "Present" — including the ZHAW degree that starts in September 2026, which rendered as `Sep 2026 -- Present` in August 2026. It now requires the range to have **started** as well, and `isFutureRange` was added alongside it.

Because `period` is persisted on save, existing rows keep the old string until someone re-saves them in the admin. `lib/career.ts` therefore recomputes the display range itself rather than trusting the stored value — see `displayPeriod()`.

## 5. Traps discovered the hard way

**The `@layer components` cascade trap.** `.cast`, `.well`, `.field` live in `@layer components`, which Tailwind emits **before** utilities. The shadcn primitives bake `border p-4 shadow-md` in as utilities, so they win. A caller writing `className="cast"` on a Radix popover silently got a flat 2020 card, with no error from `tsc` or lint. `components/ui/select.tsx` and `components/ui/popover.tsx` now carry the material themselves — the portalled element **is** the plate. If you add `.cast` to another shadcn primitive, strip its baked `border`/`shadow-*`/`p-*` at the same time.

**`.rim` must not close on a dark stop.** The first version ran the gradient from `--cast-hi` to `--cast-lo`, which traced a near-black hairline around half the perimeter of every large plate (`--cast-lo` is `#141922` in dark mode). Invisible on chips, obvious on the footer CTA. A milled edge catches light along its lit side and falls into its own drop shadow on the other; it does not get an outline. The rim now fades to transparent.

**A backtick inside the GLSL silently truncates the shader.** The shader source is a TypeScript template literal, so a backtick in a GLSL comment closes it. This has happened twice, and the second time was the instructive one: the backticks came in a *pair*, around an identifier in a doc comment, so the literal closed and reopened. `tsc` was perfectly happy — the file was valid TypeScript — and the shader lost everything after that point, failing at runtime with `EOF while in a comment`. Never put a backtick in the GLSL, not even escaped; write "the px argument" instead. The offline harness now asserts that the extracted source contains `void main(`, because absence of the last function is proof of truncation.

**Anything positioned against the object's projected size must be solved, not approximated.** The framing first used the orthographic shorthand `uv ≈ world · fov / distance`, asked for 80% of the stage height, and got 92.6% with the object clipped off the bottom. Two reasons, both worth knowing: the base's near corner sits ~1.8 units from the camera while the lid's top sits nearly 4, so perspective enlarges the near corner far beyond the approximation; and the object *rotates*, so which corner is nearest changes and the projected size pulses. A constant tuned at one angle clips at another.

The exact solve is simple once seen — `uv.y = fov · dot(P−ro, cv) / dot(P−ro, cw)`, and that second factor does not involve `fov`, so uv is exactly linear in it. `lib/heroFraming.ts` therefore takes the extreme ratios over every corner at 48 rotations once at module load and divides. The harness then checks the promise empirically: it measures the real bounding box at twelve rotations and asserts the object never clips vertically and never reaches the left edge where the type is.

**Never call `loseContext()` in a WebGL cleanup.** This one silently disabled the hero for every development page load. React strict mode runs effects mount → cleanup → mount against the *same* canvas element, and `getContext("webgl2")` on a canvas whose context was force-lost returns that same lost context rather than a fresh one. Every call then fails quietly — `compileShader` does nothing, `COMPILE_STATUS` reads false — so the component concluded WebGL was broken and left the poster up permanently. The symptom is indistinguishable from "the machine can't do WebGL", which is why it survived a full build, a lint pass and a headless shader harness: only looking at the actual page in dev exposed it.

**The hero's ground plane is derived from the tilt, not hard-coded.** `PLANE_Y` was a literal tuned for `TILT = 0.34`. Raising the tilt to 0.60 moved the object's lowest point from −0.318 to −0.442, which would have put the plane *inside* the solid, where the shadow march is undefined. Anything positioned relative to the object's rotated extent has to be computed from the angle.

**Never render a zero as a derived metric.** Hero tiles and page labels fall back to counts derived from the database. On an unseeded database those read "0 Projects delivered" — a metric that counts nothing turns the weakest possible state into the most prominent element on the page. All derived metrics are omitted when they would be zero.

---

## 6. Copy and language

`lib/copy.ts` holds **every user-visible chrome string** in one typed object: labels, buttons, section eyebrows, empty states, validation messages, aria labels, alt text. No component inlines copy.

Rules:

- **Counted strings are functions**, never concatenations — `copy.projects.label(n)`, not `` `${n} projects` ``. Plural rules differ per language.
- **No punctuation-only glue at call sites.** Build `" · "` inside the helper so a translation can reorder the parts.
- **Database content is never duplicated here.** Project titles, descriptions, skill names, `site_settings` values are authored in `/admin`.

The site is **English only** right now, matching the database content, metadata and JSON-LD. It had drifted bilingual during the rebuild, which read as an accident.

**Adding German later** — this is why the file exists:

1. Copy to `lib/copy.de.ts`, translate the values, keep the keys.
2. Type it against the exported `Copy` type so a missing key is a compile error, not a blank.
3. Replace the `copy` export with a resolver that picks by locale.

Components are not touched in any of those steps.

---

## 7. Verification status

**Verified:**

- `pnpm build` passes. All routes prerender; the four project detail pages generate statically via `generateStaticParams`.
- `npx tsc --noEmit` clean.
- `pnpm check:contrast` passes in both modes.
- All public routes return 200 against the production database. `/skills` returns 308. Unknown paths return 404.
- Contact form select `value` strings unchanged (all fourteen including `other`) — they are posted to `/api/contact`.

**Not verified — read this before assuming the design is finished:**

> **The rendered pages were never seen.** No screenshot tooling was available during the build. "Builds and renders without error" is checked; "looks right" is not. Everything in section 4 is a decision on paper until someone opens it in a browser, in **both themes**. Light mode especially: `--cast-hi` is nearly white there, so the rim highlight behaves differently than in dark mode.

Also unverified: keyboard-only traversal, a real axe/Lighthouse run, and mobile behaviour on an actual device.

**Partially lifted for the hero object.** The milled plate *was* seen, in both themes, and two defects were fixed as a result — see §9 item 1. There is no browser dependency in the repo, so the method was: generate a standalone page from the real shader source and the real `globals.css` tokens, serve it over loopback, drive **headless Edge** at it (`--headless=new --enable-unsafe-swiftshader --use-angle=swiftshader`, which is present on Windows without installing anything), have the page POST its own `COMPILE_STATUS`/`LINK_STATUS`/`glGetError` plus a `readPixels` histogram back to the server, and screenshot it. Note `--dump-dom` is useless here: Edge on Windows does not attach to the parent console, hence the POST.

That harness is worth rebuilding if you touch the shader. It caught the white-clipping and the moiré, and it asserts the useful invariants cheaply: shaders compile and link, all 8 uniforms survive optimisation, `glGetError` is 0, the object covers a plausible share of the canvas, and **zero pixels are blown to white**.

Still unverified for the hero: the *composed* page in a real browser (the harness renders the object alone, not the object behind the type), the poster-to-canvas cross-fade, behaviour on a real GPU rather than SwiftShader, and the watchdog's downgrade path.

---

## 8. Out of scope in this PR

**`/admin` is untouched.** `git diff main -- app/admin/ components/admin/` is empty. It stays coherent through a compatibility shim in `globals.css` that maps `.glass` onto CAST material, and through the shadcn token aliases — but the layout is unchanged and its shadcn primitives still carry their own flat shadows. This is the most obvious follow-up, since `/admin` is where content actually gets authored.

The shim is marked in `globals.css` and should be deleted once `/admin` is converted.

---

## 9. Open items

### Content — these are admin work, not code

1. **`site_settings` says "2+ Projects Delivered" while four project tiles render on the same page.** The metric contradicts the content next to it. Consider replacing it with something that cannot be counted on the page — "150+ properties · Credit Suisse" from the energy-optimisation work is a stronger number than a project count.
2. **The skills table is empty**, so `/about` shows the hand-written fallback. `scripts/seed-data.ts` has 16 entries across 4 categories as a template.
3. **Three project descriptions and one education title are German** while their titles are English. The Berufsmaturität title should stay German — it is a Swiss qualification name.
4. **Four of nine project images are missing** from `public/`. The fallback is deliberate and looks intentional, but real screenshots would be better.
5. ~~**`public/documents/` does not exist**, so the CV download on `/about` is hidden.~~ **Resolved by removing the download.** A CV on a public URL is scraped and indexed and carries more personal data than a portfolio page needs. The replacement is an opt-in checkbox on the contact form — specified in `docs/CV_DELIVERY.md`, deliberately not built. Note the blocker recorded there: the contact route sends **no** confirmation email today, so this needs a new outbound message rather than an extra attachment.
6. **`privacyContent` in `site_settings`** — while empty, `/privacy` 404s and the contact form omits the link. Fill it or leave it; both paths are handled.

### Code — pending work

1. ~~**Hero signature animation.**~~ **Shipped, as a different concept.** The "Signal Descent" idea recorded here (`C# source → IL opcodes → machine code hex → bit grid → clock/logic`) was **not** built — it was presented alongside three alternatives sourced from the 2026 award winners and lost to a WebGL direction.

   What shipped is a raymarched **open laptop with an editor on the screen**, over a **cold-start splash**:

   | File | Role |
   |---|---|
   | `components/hero/HeroStage.tsx` | the stage: poster, canvas, type, and the settled signal |
   | `components/hero/MilledBlock.tsx` | the renderer: context, palette, loop, watchdog |
   | `components/hero/milledBlockShader.ts` | the GLSL — geometry, material, screen, keyboard, easter egg |
   | `components/hero/ColdStart.tsx` | the splash |
   | `lib/heroFraming.ts` | camera and framing, solved. **Single source of truth** |
   | `lib/oklch.ts` | `oklch()` → linear sRGB, for handing CAST's palette to the shader |

   The Descent is still a good idea and nothing blocks it. If you build it, the depth limit still stands: it stops at the level of the computer, no contactor, motor, relay or power schematic. The laptop's etched easter egg deliberately observes the same limit — a monogram and a clock line, nothing below.

   **How the animejs.com objection was answered.** That teardown disqualified the *delivery model*, not 3D — 301 KB of non-deferred JS behind `.page { opacity: 0 }`. And `NEUMORPHISM_EVALUATION.md` disqualified R3F because `dynamic(ssr: false)` lands after hydration. Both objections are about payload and blocking. So the hero uses **no 3D library at all**: one fullscreen triangle, one fragment shader, no geometry pipeline, no loader, no scene graph. Measured — the renderer is a lazy chunk of **28.4 KB raw / 11.7 KB gzip**, it is not in any first-load shared chunk, and `/` sits at 175 kB First Load JS.

   **The splash is a gate, not decoration.** The renderer arrives after hydration, so for the first second the page showed a CSS poster and then swapped it for the object — and that swap was visible, which is what prompted it. `ColdStart` holds the frame until three real gates settle: `document.fonts.ready`, the window `load` event, and the hero having painted *or having given up*. The progress it reports is those three gates, a third each, not a timer. It can never trap anyone: `MAX_MS` forces the exit, `prefers-reduced-motion` and a `<noscript>` style remove it in CSS, and an inline script in `app/layout.tsx` flags a repeat visit **before first paint** — a React effect would run after the server HTML had already painted, which is the flash being avoided.

   **The screen is an emitter, and that is not a second light source.** CAST allows exactly one. A key light illuminates from outside; a display emits, which is a different category — so the screen is excluded from the diffuse term, from AO and from shadowing, and spills a little light back onto the deck. It is also the one deliberate loosening of "the accent is rationed": syntax colour is content, and it uses `--signal-bright` rather than `--signal` because the panel is dark in *both* themes.

   Order of operations is the important part and must not be inverted: the type is server-rendered and is the LCP, the poster is a real `.cast` plate holding a real `.well` pocket, and the canvas is fetched only after `requestIdleCallback`. **There is no `<canvas>` in the prerendered HTML** — verified against `.next/server/app/index.html`. The renderer is never armed under `prefers-reduced-motion` or `navigator.connection.saveData`, refuses a software-rendered context via `failIfMajorPerformanceCaveat`, and has a frame-time watchdog that downgrades resolution once and then hands the page back to the poster. Every one of those paths ends at the poster, which is a finished design rather than a placeholder.

   Two things the shader gets right for non-obvious reasons, both found by looking at a render rather than by reading the code:

   - **The diffuse term tops out at 0.92 of `--plate`, not at 1.0.** In light mode `--plate` is `oklch(0.938)`, so a term reaching it leaves no headroom and the specular and rim additions clip the top face to white. The first render read as white plastic.
   - **The machining marks are band-limited.** A mark is a normal perturbation and specular response to it carries a far higher frequency than the pattern, so on the pocket floor — seen at a grazing angle — an unattenuated pattern aliased into moiré rosettes. The attenuation uses an analytically derived pixel footprint rather than `fwidth()`, because neighbouring fragments in a quad may have missed the object entirely and would poison a screen-space derivative.
2. **Glassmorphism as a second material.** Discussed, not started. The constraint: glass needs something to show through. Over an opaque single-colour ground, `backdrop-filter` is pure GPU cost for a result optically identical to an opaque fill — that is why the old `.glass` was removed from ~30 places. It only earns its keep where content genuinely passes underneath: the sticky nav while scrolling, the chat panel, a modal backdrop. Keep CAST for objects and glass for layers that sit *over* something. Note iOS Safari does not support `prefers-reduced-transparency`, and a DACH audience is Apple-heavy — so opaque baseline, glass as enhancement, never the reverse.
3. **`/admin` conversion** (section 8).
4. **framer-motion exit migration.** Removing the nav dropdown already deleted one `AnimatePresence` usage. Remaining exit-animation sites: `FullscreenMenu`, `ChatWidget`, `DeepDiveButton`. Note `ChatWidget` mounts in `app/layout.tsx` with `AI_FEATURES_ENABLED` true, so **framer-motion loads on every route until that one is converted** — a partial migration saves exactly zero kilobytes.
5. **Per-page metadata.** Twelve routes still share one title, one description and one canonical (`https://sweber.dev`), which works against indexing the subpages. Flagged in `DESIGN_MOTION_PLAN.md`, not addressed here.

### Security item carried over from the original audit

~~**`applicationDocuments/` is tracked in git**~~ — **the visibility question is answered: the repository is PUBLIC**, and the five PDFs were confirmed anonymously downloadable over `raw.githubusercontent.com` (HTTP 200, no auth) on 2026-08-13.

They are now untracked and gitignored, and the files remain on disk locally. **The history has not been rewritten**, so the blobs are still reachable by their old commit SHA. Closing that needs either `git filter-repo` plus a force-push — which cannot recall forks or caches — or making the repository private, which cuts anonymous access to the history immediately without rewriting anything. See `docs/CV_DELIVERY.md`.

---

## 10. Commits on this branch

```
354c302  fix(design): drop the More dropdown, stop the rim drawing a dark outline
d94cca5  refactor(copy): unify on English, route all chrome through lib/copy.ts
c68cdb9  refactor: fold /skills into /about, add lib/copy.ts
c301251  fix(design): never render a zero as a derived metric
f0e74da  feat(design): convert the remaining pages and components to CAST
48ed4ea  feat(design): convert services and experience to CAST
50a1e7c  feat(design): convert projects, contact and about to CAST
6393644  feat(design): rebuild the shell in CAST
e9ce112  feat(design): CAST material system — derived palette, tactile surfaces
```

Each message carries its own reasoning; `git log` is the detailed record behind this summary.

### Pre-existing bugs fixed along the way

Worth knowing separately, because they were not part of the redesign brief and are the most valuable part of the diff:

- **The fonts were loading but never applied.** `globals.css` named the families literally while `layout.tsx` declares `--font-inter` / `--font-space-grotesk` / `--font-jetbrains-mono`. next/font self-hosts under hashed names reachable only through those variables, so every visitor without the fonts installed locally was served `ui-sans-serif`. The entire typographic identity was invisible.
- **The focus ring was invisible** — an already-transparent token halved again, landing near 15% opacity. The `.focus-ring` utility that would have fixed it had zero usages.
- **`globals.css` had no `prefers-reduced-motion` block at all.** `FullscreenMenu` ignored the preference entirely; `CheckmarkAnimation` played for everyone.
- **Contact form validation shifted layout on every keystroke** — CLS in the only conversion funnel.
- **Two dead trust links**: the CV download and the privacy notice, the latter linked unconditionally from a form collecting name, company and a CHF budget band.
- **Dead `"#"` project links** rendered as buttons that went nowhere.
- Nav scroll reads coalesced into one rAF per frame instead of `setState` per scroll event at the root of the tree.
- Deleted `styles/globals.css`, a dead duplicate carrying a different palette — a trap for anyone editing tokens.
- Deleted `CursorSpotlight`: a light that follows the pointer contradicts a single fixed light source.
