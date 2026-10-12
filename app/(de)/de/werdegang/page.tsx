import { CareerView } from "@/components/views/CareerView"
import { staticPageMetadata } from "@/lib/page-meta"

export const revalidate = 86400

export const metadata = staticPageMetadata("career", "de")

export default async function CareerDe() {
  return CareerView({ locale: "de" })
}
