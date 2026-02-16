# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Dev server:** `npm run dev` (Next.js on localhost:3000)
- **Build:** `npm run build`
- **Lint:** `npm run lint` (ESLint with next config)
- **Start production:** `npm run start`
- **No test suite** is configured.

Note: `next.config.mjs` ignores ESLint and TypeScript errors during build. Run `npm run lint` and `npx tsc --noEmit` separately to catch issues.

## Architecture

This is a **Next.js 15 App Router** portfolio site deployed on Vercel at sweber.dev. It was originally scaffolded with v0.app and auto-syncs with v0 deployments.

### Data layer

All content (projects, case studies, blog posts, navigation links) lives in **`src/config.ts`** as plain TypeScript arrays. There is no CMS or database — pages read directly from these exported constants. Dynamic routes (`/projects/[slug]`, `/case-studies/[slug]`, `/blog/[slug]`) look up items by `slug` from these arrays. Additional page data comes from `data/pages.json`.

### Routing

App Router pages are in `app/`. Each top-level route has its own `page.tsx`. Dynamic detail pages use `[slug]` folders. The single API route is `app/api/contact/route.ts` (POST, Node.js runtime).

### Components

- `components/ui/` — shadcn/ui primitives (New York style, Radix UI + Tailwind). Add new ones via `npx shadcn@latest add <component>`.
- `components/` (root) — app-specific components: Navigation, Footer, ContactForm, ParticleBackground, ProjectCard, etc.
- `components/PageLayout.tsx` — standard wrapper used by most pages (includes Navigation).

### Styling

Tailwind CSS 4 with CSS variables defined in `app/globals.css` (oklch color tokens for light/dark themes). The `cn()` utility from `lib/utils.ts` merges Tailwind classes. Dark mode uses the `class` strategy via `next-themes`.

### Contact form

`app/api/contact/route.ts` validates with Zod, sends email via Nodemailer (SMTP), and enforces in-memory rate limiting (3 submissions/24h per IP + browser cookie). Requires env vars from `.env.local` (see `.env.local.example`).

### Key conventions

- Path alias: `@/*` maps to the project root (e.g., `@/components/Button`).
- Fonts: Geist (sans) and Manrope loaded via `next/font/google` as CSS variables.
- Images are unoptimized (`next.config.mjs`: `images.unoptimized: true`).
- SEO: `app/robots.ts`, `app/sitemap.ts`, JSON-LD structured data in layout, OpenGraph metadata per page.
- Analytics: Vercel Analytics loaded in root layout.
- Animations: Framer Motion for transitions, DotLottie for the contact success animation (`public/animations/checkmark.lottie`).
