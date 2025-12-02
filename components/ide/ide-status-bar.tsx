"use client"

import { GitBranch, CheckCircle2 } from "lucide-react"

export function IdeStatusBar() {
  return (
    <div className="h-6 bg-[var(--ide-accent)] border-t border-[var(--ide-border)] flex items-center justify-between px-3 text-xs">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <GitBranch className="h-3 w-3" />
          <span>main</span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="h-3 w-3 text-[var(--ide-success)]" />
          <span>Portfolio Ready</span>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <span>UTF-8</span>
        <span>TypeScript JSX</span>
        <span>Ln 1, Col 1</span>
      </div>
    </div>
  )
}
