import { revalidatePath } from "next/cache"

// Invalidates all ISR cache entries across the public site. Call after any
// admin mutation so visitors see fresh content on the next request.
export function revalidatePublic() {
  revalidatePath("/", "layout")
}
