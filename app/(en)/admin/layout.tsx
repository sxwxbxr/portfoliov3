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
    // data-site="admin": the quiet night look of the package site (see
    // globals.css).
    <div className="min-h-screen grain-overlay" data-site="admin">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-md">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-6 py-3">
          <h1 className="font-display text-lg font-semibold tracking-tight whitespace-nowrap">
            <span className="block-label mr-3 text-xs">Weber Development</span>
            Admin
          </h1>
          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-muted-foreground font-mono sm:inline">
              {session.email}
            </span>
            <LogoutButton />
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="max-w-[1400px] mx-auto flex flex-col gap-6 px-6 py-8 md:flex-row">
        <AdminSidebar />
        <main className="flex-1 min-w-0">{children}</main>
      </div>
    </div>
  )
}
