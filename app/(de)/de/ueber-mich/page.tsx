import { AboutView } from "@/components/views/AboutView"
import { staticPageMetadata } from "@/lib/page-meta"

export const revalidate = 86400

export const metadata = staticPageMetadata("about", "de")

export default async function AboutDe() {
  return AboutView({ locale: "de" })
}
