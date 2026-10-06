import type { ReactNode } from "react"
import type { Metadata, Viewport } from "next"
import localFont from "next/font/local"
import { PhysioShell } from "@/components/physio/PhysioShell"
import { siteCopy } from "@/lib/physio/copy/site"
import "./physio.css"

/**
 * Headings only. A text serif reads as "journal, textbook" next to Inter's UI
 * text, which suits a tool for people who read papers all day, and it is the
 * clearest break from the portfolio's all-sans look. Self-hosted for the same
 * reason as the fonts in app/layout.tsx (see app/fonts/OFL.md).
 */
const sourceSerif = localFont({
  src: "../fonts/SourceSerif4-Variable-latin.woff2",
  weight: "500 700",
  style: "normal",
  display: "swap",
  variable: "--font-physio-serif",
  preload: true,
  fallback: ["Georgia", "Times New Roman", "serif"],
})

export const metadata: Metadata = {
  title: { default: siteCopy.landing.metaTitle, template: "%s | Physio Tools" },
  description: siteCopy.landing.metaDescription,
  openGraph: { siteName: "Physio Tools", locale: "de_CH", type: "website" },
}

/** Light page: tints the mobile browser bar. The CSS `color-scheme` is set in physio.css. */
export const viewport: Viewport = {
  themeColor: "#faf9f5",
  colorScheme: "light",
}

export default function PhysioLayout({ children }: { children: ReactNode }) {
  return <PhysioShell className={sourceSerif.variable}>{children}</PhysioShell>
}
