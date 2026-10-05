"use client"

import type { ReactNode } from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

export interface TableTab {
  id: string
  label: string
  /** Language tag for assistive tech, e.g. "fr". Omit for non-language tabs. */
  lang?: string
  content: ReactNode
}

/**
 * Switches between table blocks that were rendered on the server. This
 * component never sees the packages, only finished markup.
 */
export function CookieTableTabs({ tabs, label }: { tabs: TableTab[]; label: string }) {
  return (
    <TabsPrimitive.Root defaultValue={tabs[0]?.id} className="flex min-w-0 flex-col gap-4">
      <TabsPrimitive.List aria-label={label} className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <TabsPrimitive.Trigger
            key={tab.id}
            value={tab.id}
            lang={tab.lang}
            className="control px-4 py-2 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal data-[state=active]:border-signal data-[state=active]:bg-plate-hi"
          >
            {tab.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
      {tabs.map((tab) => (
        <TabsPrimitive.Content
          key={tab.id}
          value={tab.id}
          forceMount
          className="min-w-0 data-[state=inactive]:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
        >
          {tab.content}
        </TabsPrimitive.Content>
      ))}
    </TabsPrimitive.Root>
  )
}
