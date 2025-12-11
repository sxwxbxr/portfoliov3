# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio website for Seya Weber built with Next.js 15, React 19, TypeScript, and Tailwind CSS v4. Live at https://www.sweber.dev.

## Common Commands

```bash
npm run dev      # Start development server with hot reload
npm run build    # Production build
npm run lint     # Run ESLint
npm run start    # Run production server
```

## Architecture

### App Router Structure (`/app`)
- Pages use Next.js 15 App Router with file-based routing
- Dynamic routes: `/projects/[slug]`, `/blog/[slug]`, `/case-studies/[slug]`, `/pages/[slug]`
- API route: `/api/contact/route.ts` - handles contact form with rate limiting (3 submissions per 24h per browser/IP)
- SEO files: `robots.ts` and `sitemap.ts` generate dynamic SEO configuration

### Data Layer (`/src/config.ts`)
All portfolio content is centralized here: navigation links, projects, blog posts, and case studies are defined as TypeScript arrays. Update this file to modify site content.

### Components (`/components`)
- **UI primitives** (`/components/ui/`): shadcn/ui components (button, input, card, etc.)
- **Feature components**: Navigation, Footer, ContactForm, ProjectCard, PageLayout
- **Visual effects**: ParticleBackground, EtherealShadows, FadeInSection, AnimatedCounter
- **Theme**: ThemeProvider and ThemeToggle for dark mode via next-themes

### Styling
- Tailwind CSS v4 with OKLCH color space
- Theme variables defined in `app/globals.css`
- Class merging utility: `cn()` from `lib/utils.ts`

## Environment Variables

Required for contact form (see `.env.local.example`):
```
SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS
SMTP_FROM, CONTACT_RECIPIENT
```

## Key Patterns

- **Form handling**: React Hook Form + Zod validation
- **Animations**: Framer Motion for complex animations, DotLottie for Lottie files
- **Icons**: Lucide React
- **Path alias**: `@/*` maps to project root
