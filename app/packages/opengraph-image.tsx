import { OG_SIZE, ogImage } from "@/lib/packages/og"

export const runtime = "nodejs"
export const alt = "Libraries for agencies by Seya Weber"
export const size = OG_SIZE
export const contentType = "image/png"

export default function OpenGraphImage() {
  return ogImage({
    eyebrow: "packages.sweber.dev",
    title: "Libraries for agencies",
    subtitle: "Small, focused libraries for agencies in Switzerland, Germany and Austria.",
    footerLeft: "Open source core · Pro add-ons",
    footerRight: "Seya Weber",
  })
}
