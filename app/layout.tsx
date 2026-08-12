import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import { Analytics } from "@/components/Analytics"
import { SpeedInsights } from "@/components/SpeedInsights"
import { JsonLd } from "@/components/JsonLd"
import { Suspense } from "react"
import { Footer } from "@/components/Footer"
import SmoothScroll from "@/components/SmoothScroll"
import { ScrollProgress } from "@/components/ScrollProgress"
import { ChatWidget } from "@/components/chat-widget/ChatWidget"
import { AI_FEATURES_ENABLED } from "@/lib/features"
import { getSiteSettings, type SiteSettings } from "@/lib/data"
import { copy } from "@/lib/copy"

/**
 * Self-hosted rather than fetched from Google at build time.
 *
 * next/font/google downloads the woff2 files from fonts.gstatic.com during
 * `next build`. A Vercel build failed when three Space Grotesk instances did
 * not come back, and next/font reports that as
 * `TypeError: Cannot read properties of null (reading '1')` rather than as a
 * network error — an opaque failure for something entirely outside our
 * control. Making the site's typography depend on a third party being
 * reachable at build time is not a trade worth keeping, especially right
 * after fixing the bug that stopped these faces rendering at all.
 *
 * These are the latin subsets of the same files Google serves, all three
 * SIL OFL licensed (see app/fonts/OFL.md). They are VARIABLE fonts, so the
 * declared weight ranges cover every step the design uses — which also fixes
 * synthesised weights: the previous config loaded Inter 400 and 500 only,
 * while the UI asks for `font-semibold` (600) in several places and the
 * browser had to fake it.
 */
const inter = localFont({
  src: "./fonts/Inter-Variable-latin.woff2",
  weight: "100 900",
  style: "normal",
  display: "swap",
  variable: "--font-inter",
  preload: true,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
})

const spaceGrotesk = localFont({
  src: "./fonts/SpaceGrotesk-Variable-latin.woff2",
  weight: "300 700",
  style: "normal",
  display: "swap",
  variable: "--font-space-grotesk",
  preload: true,
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
})

const jetbrainsMono = localFont({
  src: "./fonts/JetBrainsMono-Variable-latin.woff2",
  weight: "100 800",
  style: "normal",
  display: "swap",
  variable: "--font-jetbrains-mono",
  preload: false,
  fallback: ["ui-monospace", "monospace"],
})

export const metadata: Metadata = {
  metadataBase: new URL("https://sweber.dev"),
  title: {
    default: "Seya Weber - Project Manager & Software Developer",
    template: "%s | Seya Weber",
  },
  description:
    "Experienced Project Manager specializing in software development and digital transformation in St. Gallen, Switzerland. Expert in C#, .NET, automation workflows, and agile methodologies.",
  keywords: [
    "Seya Weber",
    "Project Manager",
    "Software Developer",
    "Digital Transformation",
    "C# Developer",
    ".NET Developer",
    "Automation Workflows",
    "St. Gallen",
    "Switzerland",
    "Agile Methodologies",
    "Process Automation",
    "Healthcare Technology",
    "Manufacturing Software",
  ],
  authors: [{ name: "Seya Weber", url: "https://sweber.dev" }],
  creator: "Seya Weber",
  publisher: "Seya Weber",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sweber.dev",
    siteName: "Seya Weber Portfolio",
    title: "Seya Weber - Project Manager & Software Developer",
    description:
      "Experienced Project Manager specializing in software development and digital transformation in St. Gallen, Switzerland.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "https://sweber.dev",
  },
  category: "technology",
}

function buildStructuredData(settings: SiteSettings) {
  const sameAs = [settings.linkedinUrl, settings.githubUrl, settings.twitterUrl].filter(
    Boolean
  )

  const [city, country = "Switzerland"] = (settings.contactLocation || "St. Gallen, Switzerland")
    .split(",")
    .map((s) => s.trim())

  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Seya Weber",
    jobTitle: settings.currentRole || "Project Manager & Software Developer",
    description:
      "Experienced Project Manager specializing in software development and digital transformation in St. Gallen, Switzerland.",
    url: "https://sweber.dev",
    ...(sameAs.length > 0 && { sameAs }),
    address: {
      "@type": "PostalAddress",
      addressLocality: city,
      addressCountry: country,
    },
    ...(settings.knowsAbout.length > 0 && { knowsAbout: settings.knowsAbout }),
    ...(settings.alumniOf && {
      alumniOf: {
        "@type": "Organization",
        name: settings.alumniOf,
      },
    }),
    ...(settings.currentEmployer && {
      worksFor: {
        "@type": "Organization",
        name: settings.currentEmployer,
      },
    }),
  }
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const settings = await getSiteSettings()
  const structuredData = buildStructuredData(settings)

  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable} antialiased`} suppressHydrationWarning>
      <head>
        <JsonLd data={structuredData} />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" media="(prefers-color-scheme: light)" content="#1a8a6a" />
        <meta name="theme-color" media="(prefers-color-scheme: dark)" content="#0d0d14" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="font-sans">
        {/* Skip to main content — keyboard / screen reader accessibility */}
        <a
          href="#main-content"
          className="control sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium"
        >
          {copy.common.skipToContent}
        </a>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <ScrollProgress />
            <SmoothScroll>
              <div className="flex min-h-screen flex-col">
                <main id="main-content" className="flex-1">{children}</main>
                <Footer settings={settings} />
              </div>
            </SmoothScroll>
            {AI_FEATURES_ENABLED && <ChatWidget />}
          </ThemeProvider>
        </Suspense>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
