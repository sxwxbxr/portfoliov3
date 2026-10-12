import type React from "react"
import "@/app/globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import { Analytics } from "@/components/Analytics"
import { SpeedInsights } from "@/components/SpeedInsights"
import { JsonLd } from "@/components/JsonLd"
import { Footer } from "@/components/Footer"
import SmoothScroll from "@/components/SmoothScroll"
import { ScrollProgress } from "@/components/ScrollProgress"
import { ChatWidget } from "@/components/chat-widget/ChatWidget"
import { LocaleProvider } from "@/components/LocaleProvider"
import { AI_FEATURES_ENABLED } from "@/lib/features"
import { getSiteSettings } from "@/lib/data"
import { localizeSettings } from "@/lib/i18n-data"
import { getCopy, type Locale } from "@/lib/i18n"
import { inter, jetbrainsMono } from "@/lib/fonts"
import { siteGraph } from "@/lib/structured-data"

/** BCP 47 tag for <html lang>. German is the Swiss variety. */
const HTML_LANG: Record<Locale, string> = { en: "en", de: "de-CH" }

/**
 * The one root layout both editions share. `app/(en)/layout.tsx` and
 * `app/(de)/layout.tsx` are thin wrappers that pass their locale, so
 * `<html lang>` is right in the static HTML without any page becoming dynamic.
 */
export async function RootShell({
  locale,
  children,
}: Readonly<{
  locale: Locale
  children: React.ReactNode
}>) {
  const settings = localizeSettings(await getSiteSettings(), locale)
  const copy = getCopy(locale)
  const structuredData = siteGraph(settings, locale)

  return (
    <html lang={HTML_LANG[locale]} className={`${inter.variable} ${jetbrainsMono.variable} dark antialiased`} suppressHydrationWarning>
      <head>
        <JsonLd data={structuredData} />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#0a0a0a" />
        <meta name="color-scheme" content="dark" />
      </head>
      <body className="font-sans">
        {/* Skip to main content — keyboard / screen reader accessibility */}
        <a
          href="#main-content"
          className="control sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2.5 focus:text-sm focus:font-medium"
        >
          {copy.common.skipToContent}
        </a>
        <LocaleProvider locale={locale}>
        <ThemeProvider attribute="class" forcedTheme="dark" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          {/* .portfolio-chrome is hidden on physio pages, see globals.css. */}
          <div className="portfolio-chrome">
            <ScrollProgress />
          </div>
          <SmoothScroll>
            <div className="flex min-h-screen flex-col">
              <main id="main-content" className="flex-1">{children}</main>
              <div className="portfolio-chrome">
                <Footer settings={settings} locale={locale} />
              </div>
            </div>
          </SmoothScroll>
          {AI_FEATURES_ENABLED && (
            <div className="portfolio-chrome">
              <ChatWidget />
            </div>
          )}
        </ThemeProvider>
        </LocaleProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
