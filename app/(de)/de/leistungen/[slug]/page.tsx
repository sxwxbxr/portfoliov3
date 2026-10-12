import { notFound } from "next/navigation"
import { ServiceDetailView } from "@/components/views/ServicesView"
import { SERVICE_KEYS, getService, serviceBySlug, serviceMetadata } from "@/lib/services"

export const dynamicParams = false

export function generateStaticParams() {
  return SERVICE_KEYS.map((key) => ({ slug: getService(key, "de").slug }))
}

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props) {
  const service = serviceBySlug((await params).slug, "de")
  return service ? serviceMetadata(service.key, "de") : {}
}

export default async function ServicePageDe({ params }: Props) {
  const service = serviceBySlug((await params).slug, "de")
  if (!service) notFound()
  return <ServiceDetailView serviceKey={service.key} locale="de" />
}
