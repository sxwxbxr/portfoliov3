import { notFound } from "next/navigation"
import { getPackage, getPackages } from "@/lib/packages"
import { OG_SIZE, ogImage } from "@/lib/packages/og"

export const runtime = "nodejs"
export const alt = "Package by Seya Weber"
export const size = OG_SIZE
export const contentType = "image/png"

export function generateStaticParams() {
  return getPackages().map((p) => ({ slug: p.slug }))
}

const STATUS = { stable: "Stable", beta: "Beta", "coming-soon": "Coming soon" } as const

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const p = getPackage(slug)
  if (!p) notFound()

  return ogImage({
    eyebrow: "packages.sweber.dev",
    title: p.name,
    subtitle: p.tagline,
    footerLeft: `${STATUS[p.status]} · ${p.license}`,
    footerRight: "packages.sweber.dev",
  })
}
