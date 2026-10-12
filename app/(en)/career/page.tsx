import { CareerView } from "@/components/views/CareerView"
import { staticPageMetadata } from "@/lib/page-meta"

export const revalidate = 86400

export const metadata = staticPageMetadata("career", "en")

export default async function CareerPage() {
  return CareerView({ locale: "en" })
}
