"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { navLinks } from "@/src/config"
import { personalInfo, skillStacks } from "@/src/content"
import {
  Files,
  Search,
  GitBranch,
  Settings,
  User,
  ChevronRight,
  ChevronDown,
  FileCode,
  Folder,
  FolderOpen,
} from "lucide-react"

interface IdeSidebarProps {
  collapsed: boolean
  onToggle: () => void
}

const iconButtons = [
  { icon: Files, label: "Explorer", id: "explorer" },
  { icon: Search, label: "Search", id: "search" },
  { icon: GitBranch, label: "Source Control", id: "git" },
  { icon: User, label: "Account", id: "account" },
]

export function IdeSidebar({ collapsed, onToggle }: IdeSidebarProps) {
  const [activeView, setActiveView] = useState("explorer")
  const [expandedFolders, setExpandedFolders] = useState<string[]>(["portfolio"])

  const toggleFolder = (folder: string) => {
    setExpandedFolders((prev) => (prev.includes(folder) ? prev.filter((f) => f !== folder) : [...prev, folder]))
  }

  return (
    <div className="flex h-full">
      {/* Icon Bar */}
      <div className="w-12 bg-[var(--ide-sidebar)] border-r border-[var(--ide-border)] flex flex-col items-center py-2 gap-1">
        {iconButtons.map(({ icon: Icon, label, id }) => (
          <button
            key={id}
            onClick={() => setActiveView(id)}
            className={cn(
              "w-10 h-10 flex items-center justify-center rounded hover:bg-[var(--ide-border)] transition-colors",
              activeView === id && "bg-[var(--ide-border)] text-[var(--ide-accent)]",
            )}
            title={label}
          >
            <Icon className="h-5 w-5" />
          </button>
        ))}
        <div className="flex-1" />
        <button
          className="w-10 h-10 flex items-center justify-center rounded hover:bg-[var(--ide-border)] transition-colors"
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {/* Sidebar Content */}
      {!collapsed && (
        <div className="w-64 bg-[var(--ide-bg)] border-r border-[var(--ide-border)] flex flex-col">
          <div className="h-9 border-b border-[var(--ide-border)] flex items-center justify-between px-3">
            <span className="text-xs uppercase tracking-wide text-[var(--ide-text-muted)]">
              {activeView === "explorer" && "Explorer"}
              {activeView === "search" && "Search"}
              {activeView === "git" && "Source Control"}
              {activeView === "account" && "Account"}
            </span>
          </div>

          <div className="flex-1 overflow-auto p-2">
            {activeView === "explorer" && (
              <div className="space-y-0.5">
                {/* Portfolio Folder */}
                <div>
                  <button
                    onClick={() => toggleFolder("portfolio")}
                    className="w-full flex items-center gap-1 px-2 py-1 hover:bg-[var(--ide-border)] rounded text-sm"
                  >
                    {expandedFolders.includes("portfolio") ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                    {expandedFolders.includes("portfolio") ? (
                      <FolderOpen className="h-4 w-4 text-[var(--ide-warning)]" />
                    ) : (
                      <Folder className="h-4 w-4 text-[var(--ide-warning)]" />
                    )}
                    <span>portfolio</span>
                  </button>

                  {expandedFolders.includes("portfolio") && (
                    <div className="ml-4 space-y-0.5 mt-0.5">
                      {navLinks.map((link) => (
                        <Link
                          key={link.href}
                          href={link.href}
                          className="w-full flex items-center gap-1 px-2 py-1 hover:bg-[var(--ide-border)] rounded text-sm"
                        >
                          <FileCode className="h-4 w-4 text-[var(--ide-accent)]" />
                          <span>{link.name.toLowerCase().replace(" ", "-")}.tsx</span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>

                {/* Config Files */}
                <button className="w-full flex items-center gap-1 px-2 py-1 hover:bg-[var(--ide-border)] rounded text-sm">
                  <FileCode className="h-4 w-4 text-[var(--ide-text-muted)]" />
                  <span>README.md</span>
                </button>
              </div>
            )}

            {activeView === "account" && (
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3 px-2">
                  <div className="h-10 w-10 rounded-full bg-[var(--ide-accent)] flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{personalInfo.name}</p>
                    <p className="text-xs text-[var(--ide-text-muted)]">{personalInfo.title}</p>
                  </div>
                </div>
                <div className="border-t border-[var(--ide-border)] pt-3 px-2 space-y-2">
                  <div className="text-xs text-[var(--ide-text-muted)]">
                    <p>Skills: {skillStacks.skills.slice(0, 3).join(", ")}</p>
                    <p className="mt-1">Location: {personalInfo.location}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
