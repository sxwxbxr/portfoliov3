import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import AdminSidebar from "@/components/admin/AdminSidebar"
import LogoutButton from "@/components/admin/LogoutButton"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()
  if (!session) redirect("/login")

  return (
    <div className="min-h-screen grain-overlay">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 py-3">
          <h1 className="font-display text-lg font-semibold tracking-tight">
            Admin Dashboard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground font-mono">
              {session.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-[1400px] mx-auto flex gap-6 px-6 py-8">
        <AdminSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
