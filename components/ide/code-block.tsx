"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface CodeBlockProps {
  children: ReactNode
  className?: string
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  return (
    <div
      className={cn(
        "rounded border border-[var(--ide-border)] bg-[var(--ide-sidebar)] p-4 font-mono text-sm overflow-x-auto",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function SyntaxHighlight({
  keyword,
  string,
  comment,
  variable,
  property,
  children,
}: {
  keyword?: boolean
  string?: boolean
  comment?: boolean
  variable?: boolean
  property?: boolean
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        keyword && "text-[#C586C0]",
        string && "text-[#CE9178]",
        comment && "text-[#6A9955]",
        variable && "text-[#9CDCFE]",
        property && "text-[#4FC1FF]",
      )}
    >
      {children}
    </span>
  )
}
