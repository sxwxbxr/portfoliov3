import type React from "react"
import type { Metadata } from "next"
import { Inter, Space_Grotesk, JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import { Analytics } from "@/components/Analytics"
import { JsonLd } from "@/components/JsonLd"
import { Suspense } from "react"
import { Footer } from "@/components/Footer"
import SmoothScroll from "@/components/SmoothScroll"
import { ScrollProgress } from "@/components/ScrollProgress"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500"],
  variable: "--font-inter",
  preload: true,
})

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  weight: ["500", "600", "700"],
  variable: "--font-space-grotesk",
  preload: true,
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  weight: ["400"],
  variable: "--font-jetbrains-mono",
  preload: true,
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
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Seya Weber - Project Manager & Software Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Seya Weber - Project Manager & Software Developer",
    description:
      "Experienced Project Manager specializing in software development and digital transformation in St. Gallen, Switzerland.",
    images: ["/og-image.jpg"],
    creator: "@seyaweber",
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

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Seya Weber",
  jobTitle: "Project Manager & Software Developer",
  description:
    "Experienced Project Manager specializing in software development and digital transformation in St. Gallen, Switzerland.",
  url: "https://sweber.dev",
  sameAs: ["https://linkedin.com/in/seyaweber", "https://github.com/sxwxbxr"],
  address: {
    "@type": "PostalAddress",
    addressLocality: "St. Gallen",
    addressCountry: "Switzerland",
  },
  knowsAbout: [
    "Project Management",
    "Software Development",
    "Digital Transformation",
    "C# Programming",
    ".NET Framework",
    "Process Automation",
    "Agile Methodologies",
  ],
  alumniOf: {
    "@type": "Organization",
    name: "University of Applied Sciences",
  },
  worksFor: {
    "@type": "Organization",
    name: "Freelance",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
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
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:border focus:border-border focus:rounded focus:text-sm focus:font-medium"
        >
          Skip to main content
        </a>
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <ScrollProgress />
            <SmoothScroll>
              <div className="flex min-h-screen flex-col">
                <main id="main-content" className="flex-1">{children}</main>
                <Footer />
              </div>
            </SmoothScroll>
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
