import { notFound } from "next/navigation"
import { ServiceDetailView } from "@/components/views/ServicesView"
import { SERVICE_KEYS, serviceBySlug, serviceMetadata } from "@/lib/services"

export const dynamicParams = false

export function generateStaticParams() {
  return SERVICE_KEYS.map((slug) => ({ slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const service = serviceBySlug((await params).slug, "en")
  return service ? serviceMetadata(service.key, "en") : {}
}

export default async function ServicePage({ params }: Props) {
  const service = serviceBySlug((await params).slug, "en")
  if (!service) notFound()
  return <ServiceDetailView serviceKey={service.key} locale="en" />
}
