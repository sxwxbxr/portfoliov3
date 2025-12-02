"use client"

import type { ReactNode } from "react"
import { ClassicLayout } from "@/components/classic/classic-layout"
import { IdeLayout } from "@/components/ide/ide-layout"
import { IdeEditor } from "@/components/ide/ide-editor"
import { useTheme } from "@/lib/theme-context"

interface DualLayoutPageProps {
  classic: ReactNode
  ide: ReactNode
  editorClassName?: string
  showLineNumbers?: boolean
}

export function DualLayoutPage({ classic, ide, editorClassName, showLineNumbers }: DualLayoutPageProps) {
  const { theme } = useTheme()

  if (theme === "classic") {
    return <ClassicLayout>{classic}</ClassicLayout>
  }

  return (
    <IdeLayout>
      <IdeEditor className={editorClassName} showLineNumbers={showLineNumbers}>
        {ide}
      </IdeEditor>
    </IdeLayout>
  )
}
