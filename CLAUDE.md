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

Content (projects, experience, blog posts, case studies, certificates, skills, site settings) lives in a Neon Postgres database accessed via Drizzle ORM (`lib/schema.ts`, `lib/db.ts`, `lib/data.ts`). Public pages call `lib/data.ts` helpers (e.g. `getProjects`, `getBlogPosts`, `getSiteSettings`). The admin UI under `/admin` (gated by JWT cookie auth in `lib/auth.ts`) writes via REST routes in `app/api/admin/*`. Initial seed data lives in `scripts/seed-data.ts` and is loaded by `npm run db:seed`.

`site_settings` is a singleton (one row) controlling hero metrics, social URLs, contact details, JSON-LD identity fields, and the privacy notice rendered at `/privacy`.

After schema changes run `npm run db:push` (idempotent diff); `db:generate` is for tracked migrations and is not currently used.

### Caching

Public pages use `export const revalidate = 60` (ISR). Admin mutation routes call `revalidatePublic()` from `lib/cache.ts` after every write to invalidate the entire site cache so saved content is visible on the next request. Admin and `/api/admin/*` routes stay `force-dynamic`.

### Routing

App Router pages are in `app/`. Each top-level route has its own `page.tsx`. Dynamic detail pages use `[slug]` folders. The single API route is `app/api/contact/route.ts` (POST, Node.js runtime).

### Components

- `components/ui/` — shadcn/ui primitives (New York style, Radix UI + Tailwind). Add new ones via `npx shadcn@latest add <component>`.
- `components/` (root) — app-specific components: Navigation, Footer, ContactForm, ParticleBackground, ProjectListItem, etc.
- `components/PageLayout.tsx` — standard wrapper used by most pages (includes Navigation).

### Styling

Tailwind CSS 4 with CSS variables defined in `app/globals.css` (oklch color tokens for light/dark themes). The `cn()` utility from `lib/utils.ts` merges Tailwind classes. Dark mode uses the `class` strategy via `next-themes`.

### Contact form

`app/api/contact/route.ts` validates with Zod, sends email via Nodemailer (SMTP), and enforces in-memory rate limiting (3 submissions/24h per IP + browser cookie). Requires env vars from `.env.local` (see `.env.local.example`).

### Key conventions

- Path alias: `@/*` maps to the project root (e.g., `@/components/Button`).
- Fonts: Inter (body), Space Grotesk (display), and JetBrains Mono (mono) loaded via `next/font/google` as CSS variables.
- Image optimization is enabled (Next.js Image component is the default for project artwork).
- SEO: `app/robots.ts`, `app/sitemap.ts`, JSON-LD structured data in layout, OpenGraph metadata per page.
- Analytics: Vercel Analytics loaded in root layout.
- Animations: Framer Motion for transitions, DotLottie for the contact success animation (`public/animations/checkmark.lottie`).
