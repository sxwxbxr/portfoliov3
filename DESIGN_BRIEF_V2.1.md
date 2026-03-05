# Design Brief V2.1 — "Magnetic Presence" Revision

**Date:** March 2026
**Revision:** V2.1 — Navigation overhaul, glassmorphism pass, cursor toning, Nxrthstack link

---

## Changes from V2

### 1. Navigation: "More" dropdown for subpages
**Problem:** Only 3 links visible (Work, About, Contact). 7 pages hidden.
**Solution:** Add a "More" button that opens a glassmorphic dropdown panel with grouped subpage links. NOT shown by default — appears on click/hover.

```
Desktop nav layout:
  [seya weber]                    [Work] [About] [Contact] [More v] [theme]

"More" dropdown (on click):
  ┌─────────────────────────────────────────────┐
  │  glass backdrop-blur panel, rounded-xl       │
  │                                              │
  │  Work              Knowledge    Company      │
  │  Case Studies      Blog         Nxrthstack ↗ │
  │  Services          Skills                    │
  │                    Education                 │
  │  Career                                      │
  │  Experience                                  │
  └─────────────────────────────────────────────┘
```

- Panel uses `.glass` class (backdrop-blur + semi-transparent bg)
- 3-column grid inside
- Closes on click outside, Escape key, or route change
- Framer Motion animate: scale from 0.95 + opacity 0→1 (150ms)
- Mobile: FullscreenMenu already shows all links — add the missing ones there too

### 2. Cursor spotlight: tone it way down
**Current:** 400px radius, 6% opacity, follows cursor everywhere
**New:** 250px radius, 2-3% opacity, hero section ONLY (not fixed/global)
- Only renders inside the hero `<section>`, not as a fixed overlay
- Barely perceptible — just a subtle warmth around the cursor
- Remove from non-hero areas entirely

### 3. Glassmorphism throughout the UI
Add `.glass` treatment to these surfaces:
- **Navigation bar** (already has it when scrolled — good)
- **"More" dropdown panel** — glass with border
- **Project list items on hover** — subtle glass bg instead of plain bg-primary/5
- **Testimonial section** — wrap the quote in a glass card
- **Contact form card** on contact page — glass surface
- **Metrics section** on homepage intro — glass card for the numbers
- **Mobile fullscreen menu** — already has backdrop-blur, enhance the glass feel

Glass recipe (consistent everywhere):
```css
Light: bg-background/60 backdrop-blur-xl border border-border/50
Dark:  bg-background/40 backdrop-blur-xl border border-border/50
```

### 4. Nxrthstack link
- Add to nav "More" dropdown under a "Company" column
- Add to footer under the "Connect" column
- Display: "Nxrthstack" with an external link icon (↗)
- URL: https://nxrthstack.sweber.dev
- `target="_blank" rel="noopener noreferrer"`

### 5. FullscreenMenu (mobile) — add all subpages
Current: only Work, About, Contact
Add sections:
```
Work          About        More
Projects      About        Blog
Case Studies  Experience   Skills
Services      Education    Nxrthstack ↗
Contact
```
Use a 2-column grid for the sublinks, smaller text than the main 3 links.

---

## Implementation by Agent

### Agent 1: Foundation (Navigation + Dropdown)
- Rewrite Navigation.tsx with "More" dropdown
- Create NavDropdown component (glass panel with 3-column grid)
- Update FullscreenMenu with all subpages + Nxrthstack
- Ensure proper keyboard accessibility (Escape closes, arrow keys, focus trap)

### Agent 2: Glassmorphism Pass (Homepage)
- Tone down CursorSpotlight (250px, 2%, hero-only)
- Add glass treatment to testimonial section (wrap in glass card)
- Add glass treatment to metrics section in intro
- Add glass hover to ProjectListItem (replace bg-primary/5)
- Subtle glass divider cards throughout

### Agent 3: Glassmorphism Pass (Subpages)
- Contact page: glass card around the form
- About page: glass card around metrics/facts
- Project detail: glass card around meta bar
- Case study detail: glass card around testimonial
- Consistent glass treatment across all pages

### Agent 4: Footer + Links
- Add Nxrthstack to footer Connect column
- Verify all footer links work
- Ensure footer nav matches the nav dropdown groupings

### Agent 5: QA
- Build verification
- Lint check
- Visual consistency audit
- Accessibility check on new dropdown
