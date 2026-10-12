import { ContactView } from "@/components/views/ContactView"
import { staticPageMetadata } from "@/lib/page-meta"

export const revalidate = 86400

export const metadata = staticPageMetadata("contact", "en")

export default async function ContactPage() {
  return ContactView({ locale: "en" })
}
