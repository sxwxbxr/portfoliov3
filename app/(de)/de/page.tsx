import { HomeView } from "@/components/views/HomeView"
import { staticPageMetadata } from "@/lib/page-meta"

export const revalidate = 86400

export const metadata = staticPageMetadata("home", "de")

export default async function HomeDe() {
  return HomeView({ locale: "de" })
}
