import { AboutView } from "@/components/views/AboutView"
import { staticPageMetadata } from "@/lib/page-meta"

export const revalidate = 86400

export const metadata = staticPageMetadata("about", "en")

export default async function About() {
  return AboutView({ locale: "en" })
}
