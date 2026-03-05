# Design Brief: Portfolio V2 — "Magnetic Presence"

**Date:** March 2026
**Author:** Seya Weber
**Objective:** Full visual redesign to create an Awwwards-caliber portfolio that commands attention from employers and clients through refined craft, purposeful interaction, and distinctive visual identity.

---

## 1. Design Philosophy

**"Quiet confidence, loud craft."**

Inspired by the intersection of:
- **Dennis Snellenberg** — Minimal layout, bold typography, smooth scroll, editorial feel
- **Brittany Chiang** — Clean developer portfolio, sticky sidebar, elegant dark mode
- **Rauno Freiberg** — Playful interaction design, cursor-reactive elements, OS-like feel
- **Linear.app** — Dark-first aesthetic, glassmorphism, thin borders, gradient glows
- **Stripe** — Whitespace mastery, hierarchy through typography alone

The goal is NOT a flashy WebGL showpiece. It's a **tasteful, editorial-quality** portfolio that feels like a premium product — the kind of site where every pixel feels intentional.

**Theme strategy:** System-preference-first (`prefers-color-scheme`). Both light and dark modes are equally polished — neither is secondary. The user's OS setting is respected by default, with a manual toggle available.

---

## 2. Research: What Makes Outstanding Portfolios Stand Out

### Patterns from 50+ Awwwards winners & top portfolios (2025-2026):

| Pattern | Examples | Why It Works |
|---------|----------|-------------|
| **System-aware theming (light + dark equally polished)** | Linear, Brittany Chiang, Stripe | Respects user preference; shows craft in BOTH modes |
| **Massive editorial typography** | Dennis Snellenberg, Ragged Edge | Instant visual authority; type IS the design |
| **Smooth scroll + scroll-triggered reveals** | Dennis Snellenberg, Joffrey Spitzer | Creates cinematic pacing; rewards scrolling |
| **Sticky sidebar navigation** | Brittany Chiang | Persistent context without noise |
| **Cursor-reactive elements** | Rauno, OHZI Interactive, Dave Holloway | Shows craft; delights without disrupting |
| **Horizontal project showcase** | Rauno, many agencies | Breaks vertical monotony; feels app-like |
| **Real-time details (clock, location)** | Dennis Snellenberg | Adds personality + living feeling |
| **Numbered/indexed project lists** | Dennis Snellenberg, many agencies | Professional, structured, editorial |
| **Gradient glow borders on hover** | Linear, many SaaS | Premium feel; subtle depth |
| **Noise/grain texture overlay** | Linear, already in V1 | Adds warmth; prevents flat digital feel |
| **Monochrome + single accent (both modes)** | Brittany Chiang, Stripe, Linear | Maximum impact with minimum palette; coherent across themes |

### Anti-patterns to avoid:
- Overused bento grids (every portfolio does this now)
- Generic card-heavy layouts
- Marquee tickers (too common, feels template-y)
- Gradient text on everything
- Animation for animation's sake

---

## 3. Visual Identity Overhaul

### 3.1 Color System — "Ink & Signal"

Shift from warm orange/teal dual-accent to a **monochrome-first palette with a single, intentional accent**. Both modes are designed as first-class citizens — neither is an afterthought.

**Theme:** System preference by default (`prefers-color-scheme`), manual toggle available via `next-themes` with `defaultTheme="system"`.

```
LIGHT MODE:
  Background:      oklch(0.98 0.003 90)     — Warm paper white
  Surface:         oklch(0.96 0.003 90)     — Card/elevated surfaces
  Surface Hover:   oklch(0.94 0.003 90)     — Interactive surface state
  Foreground:      oklch(0.12 0.01 260)     — Near-black text (cool undertone)
  Muted:           oklch(0.50 0.01 260)     — Secondary text
  Border:          oklch(0.90 0.005 90)     — Subtle warm borders
  Accent:          oklch(0.50 0.16 160)     — Deep teal (THE accent, WCAG AA on white)
  Accent Glow:     oklch(0.50 0.16 160 / 0.12) — Glow variant

DARK MODE:
  Background:      oklch(0.09 0.005 260)    — Near-black with cool undertone
  Surface:         oklch(0.12 0.005 260)    — Elevated surface
  Surface Hover:   oklch(0.15 0.005 260)    — Interactive surface state
  Foreground:      oklch(0.95 0.005 90)     — Warm off-white
  Muted:           oklch(0.55 0.01 260)     — Secondary text
  Border:          oklch(0.18 0.005 260)    — Subtle cool dividers
  Accent:          oklch(0.75 0.15 160)     — Bright teal (THE accent, WCAG AA on dark)
  Accent Glow:     oklch(0.75 0.15 160 / 0.15) — Glow variant
```

**Rationale:** The current V1 orange/teal palette is pleasant but safe. A cool monochrome base with a single teal accent is more contemporary, matches the "Linear look" trend, and creates stronger visual hierarchy. The accent gets used sparingly — links, hover states, active indicators — making each usage more impactful. Both modes share identical layout, spacing, and interaction patterns — only color values change.

### 3.2 Typography — "Swiss Editorial"

Replace Geist + Manrope with a more distinctive pairing:

```
Display/Headings:  "Space Grotesk" or "Plus Jakarta Sans"
                   — Geometric, slightly quirky, more character than Geist
                   — Weights: 500 (subheads), 700 (headings)

Body:              "Inter" — The standard. Clean, readable, professional.
                   — Weight: 400 (body), 500 (emphasis)

Monospace:         "JetBrains Mono" or "Geist Mono"
                   — For code snippets, technical details, dates

Type Scale (desktop):
  Hero heading:     clamp(3.5rem, 8vw, 7rem)  — Massive, fills the viewport
  Section heading:  clamp(2rem, 4vw, 3.5rem)
  Subheading:       1.25rem
  Body:             1rem (16px)
  Small/Meta:       0.875rem
  Caption:          0.75rem

Letter-spacing:
  Headings:  -0.03em (tight)
  Body:      0
  Uppercase: 0.1em (wide)
```

### 3.3 Spacing & Layout

```
Max content width:  1200px (tighter than current 7xl/1280px for more editorial feel)
Grid:               12-column CSS grid with 24px gutter
Section padding:    clamp(80px, 10vh, 160px) vertical
Page margin:        clamp(20px, 5vw, 80px) horizontal
```

### 3.4 Border Radius

```
Cards/containers:   12px  (current)
Buttons:            999px (fully rounded pill shape)
Chips/tags:         6px   (subtle rounding)
Avatars:            50%   (circle)
```

---

## 4. Page Architecture — Complete Restructure

### 4.1 Homepage — Single Long-Scroll Narrative

Consolidate from 10+ pages to a **focused single-page narrative** with anchor sections. Secondary pages remain for detail.

```
SECTION 1: HERO
  — Full viewport height
  — Name in massive type (clamp 7rem)
  — Single-line role descriptor
  — Subtle cursor-reactive gradient orb background
  — Scroll indicator at bottom
  — Real-time local time + "Available for work" indicator

SECTION 2: INTRODUCTION
  — 2-3 sentences about who you are
  — Professional photo (editorial crop, slightly desaturated)
  — Key metrics: years experience, projects delivered, tech stacks
  — Minimal, left-aligned layout

SECTION 3: SELECTED WORK (The Star Section)
  — Numbered project list (01, 02, 03...)
  — Each row: number | project title | role/category | year
  — On hover: project thumbnail slides in from right
  — Click navigates to project detail page
  — Dennis Snellenberg inspired interaction pattern

SECTION 4: EXPERTISE
  — Two-column layout: left = category label, right = skills
  — Clean, structured, no cards or bento
  — Categories: Development, Project Management, Tools & Frameworks
  — Subtle line separators between categories

SECTION 5: EXPERIENCE TIMELINE
  — Compact timeline (not a full page)
  — Company name, role, period — one line each
  — Current role highlighted with accent dot
  — Link to full resume/CV (download)

SECTION 6: TESTIMONIALS
  — Single featured testimonial (large, editorial quote)
  — Author attribution with company
  — Rotate/pagination for multiples (optional)

SECTION 7: WRITING (if blog posts exist)
  — 2-3 latest posts
  — Title + date + read time, minimal presentation
  — Link to full blog

SECTION 8: CONTACT / FOOTER
  — "Let's work together" heading
  — Email link (primary CTA, large type)
  — Social links row
  — Site credit, local time, copyright
  — No separate contact page needed (or keep as optional)
```

### 4.2 Project Detail Pages

```
— Full-width hero with project title (massive type)
— Meta bar: client | role | year | stack
— Project description (2-3 paragraphs)
— Key outcomes / metrics
— Screenshots or mockups (if available)
— Links: live site, GitHub
— "Next project" navigation at bottom
```

### 4.3 Navigation

**Replace current fixed header with:**

Option A: **Minimal top bar** — Name/logo left, 3-4 links right, theme toggle
- Links: Work, About, Contact
- Mobile: hamburger opens full-screen overlay menu

Option B: **Brittany Chiang style** — Sticky left sidebar on desktop (name, nav, socials), content scrolls on right
- Better for single-page scroll
- Mobile: collapses to top bar

**Recommendation: Option A** — cleaner, more universal, easier to maintain.

**Navigation animation:**
- Glassmorphism background (blur + transparency)
- Hide on scroll down, show on scroll up
- Smooth border-bottom appears after hero section

---

## 5. Interaction & Animation Language

### 5.1 Core Principles
1. **Purposeful** — Every animation communicates something (entrance, relationship, state)
2. **Fast** — 200-400ms maximum for micro-interactions; 600-800ms for section reveals
3. **Subtle** — If someone questions "was that animated?" — perfect
4. **Accessible** — Respect `prefers-reduced-motion`

### 5.2 Animation Catalogue

| Element | Animation | Duration | Easing |
|---------|-----------|----------|--------|
| Section reveal | Fade up + slight Y translate (20px) | 600ms | cubic-bezier(0.16, 1, 0.3, 1) |
| Text lines | Staggered word/line reveal via clip-path | 500ms each, 50ms stagger | ease-out |
| Project list hover | Image slides in from right | 300ms | cubic-bezier(0.4, 0, 0.2, 1) |
| Buttons | Scale 0.98 on press, subtle glow on hover | 150ms | ease |
| Navigation | Background blur fades in after hero | 200ms | ease |
| Page transitions | Fade out/in (Framer Motion AnimatePresence) | 300ms | ease |
| Links | Underline expands from left | 300ms | ease |
| Cursor orb (optional) | Smooth follow with spring physics | spring | spring(100, 10) |

### 5.3 Smooth Scrolling
- **Add Lenis** for buttery smooth scroll (replaces native `scroll-behavior: smooth`)
- GSAP ScrollTrigger for scroll-linked animations (section reveals, parallax)
- Lenis + GSAP integration is industry standard for premium feel

### 5.4 Cursor Effects (Optional — Desktop Only)
- Subtle custom cursor dot that scales on interactive elements
- OR: Spotlight gradient that follows cursor on hero section
- Implementation: CSS `radial-gradient` positioned via `mousemove` event
- Disable for touch devices and `prefers-reduced-motion`

---

## 6. Component Overhaul

### 6.1 Components to REMOVE
- `ParticleBackground` — too common, adds little
- `Marquee` — feels template-y, not editorial
- `MagneticButton` — keep concept but simplify to pure CSS
- `AnimatedCounter` — rarely needed
- `ProjectCard` — replace with list-based project display
- `BentoCard` pattern — too overused in 2025-2026

### 6.2 Components to REDESIGN
- `Navigation` — Minimal top bar with scroll-aware behavior
- `Footer` — Merge with contact CTA, add real-time clock
- `AnimatedSection` — Simplify, potentially switch to GSAP ScrollTrigger
- `ThemeToggle` — Smaller, more subtle placement

### 6.3 Components to ADD
- `ProjectListItem` — Hover-reveal row for project showcase
- `SmoothScroll` — Lenis wrapper provider
- `CursorSpotlight` — Optional gradient following cursor
- `SectionReveal` — GSAP-powered scroll reveal (replaces AnimatedSection)
- `FullscreenMenu` — Mobile menu overlay
- `TimeDisplay` — Real-time local clock component

---

## 7. Technical Implementation Plan

### Phase 1: Foundation (Design System & Layout)
1. Update `globals.css` — New color tokens, typography, spacing
2. Install new fonts (Space Grotesk + Inter)
3. Update `layout.tsx` — New font loading, structure
4. Create new `Navigation` component — Minimal top bar
5. Create new `Footer` component — Contact CTA + footer merged

### Phase 2: Homepage Rebuild
6. Hero section — Massive type, cursor gradient, scroll indicator
7. Introduction section — Photo + bio + metrics
8. Selected Work — Numbered list with hover-reveal images
9. Expertise section — Two-column structured list
10. Experience timeline — Compact, inline
11. Testimonial section — Single editorial quote
12. Writing section — Minimal post list
13. Contact/footer section — Email CTA + socials

### Phase 3: Interaction Layer
14. Install & configure Lenis for smooth scroll
15. Add GSAP + ScrollTrigger for reveals
16. Implement hover-reveal on project list
17. Add cursor spotlight effect (optional)
18. Page transition animations
19. Navigation scroll behavior (hide/show)

### Phase 4: Detail Pages
20. Redesign project detail template
21. Update blog post layout
22. Update about page
23. Remove or consolidate unnecessary pages

### Phase 5: Polish & QA
24. Responsive testing (mobile, tablet, desktop)
25. Accessibility audit (contrast, motion, keyboard)
26. Performance audit (Core Web Vitals)
27. Dark/light mode testing
28. Cross-browser testing

---

## 8. New Dependencies

```
ADD:
  @studio-freight/lenis  — Smooth scroll (or lenis package)
  gsap                   — Animation engine (free including plugins since 2025)

KEEP:
  framer-motion          — Page transitions, component animations
  next-themes            — Dark/light mode
  lucide-react           — Icons
  react-hook-form + zod  — Contact form

EVALUATE FOR REMOVAL:
  recharts               — Only if charts are used
  react-icons            — Consolidate to lucide-react only
  tailwindcss-animate    — May be redundant with GSAP
  tw-animate-css         — May be redundant with GSAP
  @dotlottie/player      — Replace checkmark with CSS animation
```

---

## 9. Inspiration Board (Direct References)

| Reference Site | What to Take | Link |
|----------------|-------------|------|
| Dennis Snellenberg | Project list interaction, minimal layout, footer clock | dennissnellenberg.com |
| Brittany Chiang | Dark palette, clean hierarchy, developer-focused | brittanychiang.com |
| Rauno Freiberg | Cursor interactions, playful details | rauno.me |
| Linear.app | Glassmorphism, gradient glows, dark aesthetic | linear.app |
| Joffrey Spitzer | GSAP reveals, flip transitions, minimal motion | joffreysptizer.com |
| Stripe | Whitespace, typography hierarchy | stripe.com |
| OHZI Interactive | Cursor-driven visual effects | ohzi.io |

---

## 10. Success Criteria

- [ ] Passes Awwwards self-evaluation (Design 7+, Usability 8+, Creativity 7+)
- [ ] Lighthouse score: Performance 95+, Accessibility 100, Best Practices 100
- [ ] Loads in under 2s on 3G
- [ ] Every animation respects `prefers-reduced-motion`
- [ ] Both light and dark modes are equally polished; system preference respected
- [ ] A hiring manager or client can find: who you are, what you do, your work, and how to contact you — within 10 seconds
- [ ] The site itself demonstrates the quality of your work

---

## 11. Sources & Research

- [Top 100 Most Creative Portfolio Websites 2025 (Muzli)](https://muz.li/blog/top-100-most-creative-and-unique-portfolio-websites-of-2025/)
- [19 Portfolio Design Trends 2026 (Colorlib)](https://colorlib.com/wp/portfolio-design-trends/)
- [Awwwards Sites of the Day](https://www.awwwards.com/websites/sites_of_the_day/)
- [Linear Design: The SaaS Trend (LogRocket)](https://blog.logrocket.com/ux-design/linear-design/)
- [The Linear Look (Frontend Horse)](https://frontend.horse/articles/the-linear-look/)
- [Web Design Trends 2026 (Figma)](https://www.figma.com/resource-library/web-design-trends/)
- [10 Best Interactive Websites 2026 (Lovable)](https://lovable.dev/guides/best-interactive-websites)
- [GSAP Animation Websites (Awwwards)](https://www.awwwards.com/websites/gsap/)
- [UX Portfolios 2026 (Site Builder Report)](https://www.sitebuilderreport.com/inspiration/ux-portfolios)
- [Creative Developer Portfolio 2026 (DEV)](https://dev.to/nk2552003/the-anthology-of-a-creative-developer-a-2026-portfolio-56jp)
- [Joffrey Spitzer Portfolio Build (Codrops)](https://tympanus.net/codrops/2026/02/18/joffrey-spitzer-portfolio-a-minimalist-astro-gsap-build-with-reveals-flip-transitions-and-subtle-motion/)
- [Dennis Snellenberg (Awwwards)](https://www.awwwards.com/dennissnellenberg/)
- [Brittany Chiang](https://brittanychiang.com/)
- [Rauno Freiberg](https://rauno.me/)
