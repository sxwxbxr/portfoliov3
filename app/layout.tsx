import type React from "react"
import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Manrope } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import { ScrollProgress } from "@/components/ScrollProgress"
import { Analytics } from "@/components/Analytics"
import { JsonLd } from "@/components/JsonLd"
import { Suspense } from "react"
import { Footer } from "@/components/Footer"

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-geist",
  preload: true,
})

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
  preload: true,
})

export const metadata: Metadata = {
  metadataBase: new URL("https://seyaweber.com"),
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
  authors: [{ name: "Seya Weber", url: "https://seyaweber.com" }],
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
    url: "https://seyaweber.com",
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
  verification: {
    google: "your-google-verification-code",
  },
  alternates: {
    canonical: "https://seyaweber.com",
  },
  category: "technology",
    generator: 'v0.app'
}

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Seya Weber",
  jobTitle: "Project Manager & Software Developer",
  description:
    "Experienced Project Manager specializing in software development and digital transformation in St. Gallen, Switzerland.",
  url: "https://seyaweber.com",
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
    <html lang="en" className={`${geist.variable} ${manrope.variable} antialiased`} suppressHydrationWarning>
      <head>
        <JsonLd data={structuredData} />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#6366f1" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className="font-sans">
        <Suspense fallback={null}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <ScrollProgress />
            <div className="flex min-h-screen flex-col">
              <div className="flex-1">{children}</div>
              <Footer />
            </div>
          </ThemeProvider>
        </Suspense>
        <Analytics />
      </body>
    </html>
  )
}
