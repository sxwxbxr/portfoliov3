import { ContactView } from "@/components/views/ContactView"
import { staticPageMetadata } from "@/lib/page-meta"

export const revalidate = 86400

export const metadata = staticPageMetadata("contact", "de")

export default async function ContactDe() {
  return ContactView({ locale: "de" })
}
