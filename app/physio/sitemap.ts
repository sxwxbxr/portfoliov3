import type { MetadataRoute } from "next"
import { PHYSIO_TOOLS, isUsable } from "@/lib/physio/tools"
import { physioUrl } from "@/lib/physio/urls"

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = PHYSIO_TOOLS.filter(isUsable)
  return [
    { url: physioUrl("/"), changeFrequency: "weekly", priority: 1 },
    { url: physioUrl("/tools"), changeFrequency: "weekly", priority: 0.9 },
    ...tools.flatMap((t) => [
      { url: physioUrl(t.path), changeFrequency: "monthly" as const, priority: 0.9 },
      ...(t.demoPath ? [{ url: physioUrl(t.demoPath), changeFrequency: "monthly" as const, priority: 0.8 }] : []),
    ]),
    { url: physioUrl("/abo"), changeFrequency: "monthly", priority: 0.7 },
    { url: physioUrl("/vorschlaege"), changeFrequency: "monthly", priority: 0.6 },
    { url: physioUrl("/datenschutz"), changeFrequency: "yearly", priority: 0.2 },
  ]
}
