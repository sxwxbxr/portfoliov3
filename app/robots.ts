import type { MetadataRoute } from "next"
import { pkgUrl } from "@/lib/packages/urls"
import { physioUrl } from "@/lib/physio/urls"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: ["https://sweber.dev/sitemap.xml", pkgUrl("/sitemap.xml"), physioUrl("/sitemap.xml")],
  }
}
