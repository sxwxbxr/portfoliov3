export const dynamic = "force-dynamic"

import { desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { physioSuggestions, physioUsers } from "@/lib/schema"
import PhysioSuggestionsAdmin, {
  type AdminSuggestion,
} from "@/components/admin/PhysioSuggestionsAdmin"
import { suggestionsAdminCopy } from "@/lib/physio/copy/suggestions"

export default async function AdminPhysioSuggestionsPage() {
  const rows = await db
    .select({
      id: physioSuggestions.id,
      title: physioSuggestions.title,
      description: physioSuggestions.description,
      category: physioSuggestions.category,
      contactEmail: physioSuggestions.contactEmail,
      userEmail: physioUsers.email,
      status: physioSuggestions.status,
      adminNote: physioSuggestions.adminNote,
      createdAt: physioSuggestions.createdAt,
    })
    .from(physioSuggestions)
    .leftJoin(physioUsers, eq(physioSuggestions.userId, physioUsers.id))
    .orderBy(desc(physioSuggestions.createdAt), desc(physioSuggestions.id))

  const initial: AdminSuggestion[] = rows.map((r) => ({
    ...r,
    createdAt: r.createdAt.toISOString(),
  }))

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-semibold tracking-tight">
          {suggestionsAdminCopy.title}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Tool ideas sent in via physio.sweber.dev/vorschlaege
        </p>
      </div>
      <PhysioSuggestionsAdmin initial={initial} />
    </div>
  )
}
