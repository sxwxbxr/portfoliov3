/** Code shown in the Pro section of the Vector demo (/vector/demo). */

export const VECTOR_PORTAL_HANDLER = `// app/api/webhooks/[...path]/route.ts
import { createPortalHandler } from "@weber-development/vector-portal"
import { vector } from "@/lib/vector"
import { getSession } from "@/lib/auth"

const handler = createPortalHandler(vector, {
  basePath: "/api/webhooks",
  // Every route is scoped to the tenant you return here.
  authorize: async (request) => {
    const session = await getSession(request)
    return session ? { tenant: session.organisationId } : null
  },
  eventTypes: [
    { type: "invoice.paid", description: "An invoice was paid in full." },
    { type: "customer.updated", description: "Customer details changed." },
  ],
})

export { handler as GET, handler as POST, handler as PATCH, handler as DELETE }`

export const VECTOR_PORTAL_UI = `// app/settings/webhooks/page.tsx
"use client"
import { WebhookPortal } from "@weber-development/vector-portal/react"
import "@weber-development/vector-portal/styles.css"

export default function WebhooksSettings() {
  return <WebhookPortal apiBase="/api/webhooks" />
}`

export const VECTOR_CATALOG = `import { z } from "zod"
import { defineCatalog } from "@weber-development/vector-catalog"

export const catalog = defineCatalog({
  "invoice.paid": {
    description: "An invoice was paid in full.",
    schema: z.object({ invoiceId: z.string(), amount: z.number().int(), currency: z.string() }),
  },
})

// Validated against the schema before Vector stores the message
await catalog.send(vector, { tenant: "acme", eventType: "invoice.paid", payload })

// npx vector-catalog docs | asyncapi | types`
