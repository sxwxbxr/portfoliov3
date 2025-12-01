"use client"

import type React from "react"

import { useState } from "react"
import { X, FileCode } from "lucide-react"
import { cn } from "@/lib/utils"

interface Tab {
  id: string
  name: string
  active: boolean
  modified?: boolean
}

export function IdeTabs() {
  const [tabs, setTabs] = useState<Tab[]>([
    { id: "about", name: "about.tsx", active: true },
    { id: "experience", name: "experience.tsx", active: false },
    { id: "projects", name: "projects.tsx", active: false },
  ])

  const closeTab = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setTabs(tabs.filter((tab) => tab.id !== id))
  }

  const setActiveTab = (id: string) => {
    setTabs(tabs.map((tab) => ({ ...tab, active: tab.id === id })))
  }

  return (
    <div className="h-9 bg-[var(--ide-bg)] border-b border-[var(--ide-border)] flex items-center overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "h-full px-3 flex items-center gap-2 border-r border-[var(--ide-border)] text-sm group hover:bg-[var(--ide-border)] transition-colors min-w-0",
            tab.active && "bg-[var(--ide-bg)] text-[var(--ide-text)]",
            !tab.active && "text-[var(--ide-text-muted)]",
          )}
        >
          <FileCode className="h-4 w-4 flex-shrink-0 text-[var(--ide-accent)]" />
          <span className="truncate">{tab.name}</span>
          {tab.modified && <div className="h-2 w-2 rounded-full bg-[var(--ide-warning)] flex-shrink-0" />}
          <X
            className="h-3 w-3 flex-shrink-0 opacity-0 group-hover:opacity-100 hover:bg-[var(--ide-sidebar)] rounded transition-opacity"
            onClick={(e) => closeTab(tab.id, e)}
          />
        </button>
      ))}
    </div>
  )
}
