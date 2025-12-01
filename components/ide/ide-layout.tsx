"use client"

import { type ReactNode, useState } from "react"
import { IdeSidebar } from "./ide-sidebar"
import { IdeTabs } from "./ide-tabs"
import { IdeStatusBar } from "./ide-status-bar"
import { ThemeToggle } from "@/components/theme-toggle"

interface IdeLayoutProps {
  children: ReactNode
}

export function IdeLayout({ children }: IdeLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="h-screen w-full flex flex-col bg-[var(--ide-bg)] text-[var(--ide-text)]">
      {/* Title Bar */}
      <div className="h-9 bg-[var(--ide-sidebar)] border-b border-[var(--ide-border)] flex items-center justify-between px-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
          </div>
          <span className="text-sm text-[var(--ide-text-muted)] ml-2">portfolio.dev</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <IdeSidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

        {/* Editor Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Tabs */}
          <IdeTabs />

          {/* Content */}
          <div className="flex-1 overflow-auto">{children}</div>
        </div>
      </div>

      {/* Status Bar */}
      <IdeStatusBar />
    </div>
  )
}
