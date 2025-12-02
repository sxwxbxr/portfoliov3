"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface IdeEditorProps {
  children: ReactNode
  className?: string
  showLineNumbers?: boolean
}

export function IdeEditor({ children, className, showLineNumbers = false }: IdeEditorProps) {
  return (
    <div
      className={cn(
        "h-full bg-[var(--ide-bg)] text-[var(--ide-text)] p-6 overflow-auto",
        showLineNumbers && "line-numbers",
        className,
      )}
    >
      {children}
    </div>
  )
}
