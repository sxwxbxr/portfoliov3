"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

export function Analytics() {
  const pathname = usePathname()

  useEffect(() => {
    // Track page views
    if (typeof window !== "undefined") {
      console.log("[v0] Page view tracked:", pathname)

      // Here you would integrate with your analytics service
      // Example: Google Analytics, Vercel Analytics, etc.
      // gtag('config', 'GA_MEASUREMENT_ID', {
      //   page_path: pathname,
      // })
    }
  }, [pathname])

  return null
}
