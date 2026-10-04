import type { MetadataRoute } from "next"
import { pkgUrl } from "@/lib/packages/urls"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: ["https://sweber.dev/sitemap.xml", pkgUrl("/sitemap.xml")],
  }
}
