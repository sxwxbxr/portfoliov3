"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

export type OpenRouterModelOption = {
  id: string
  name: string
  isFree: boolean
  promptPrice: number | null
  contextLength: number | null
}

interface ModelComboboxProps {
  label: string
  value: string
  onChange: (id: string) => void
  models: OpenRouterModelOption[]
  defaultFreeOnly?: boolean
  hint?: string
}

export default function ModelCombobox({
  label,
  value,
  onChange,
  models,
  defaultFreeOnly = false,
  hint,
}: ModelComboboxProps) {
  const [open, setOpen] = useState(false)
  const [freeOnly, setFreeOnly] = useState(defaultFreeOnly)

  const visible = freeOnly ? models.filter((m) => m.isFree) : models

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <button
          type="button"
          onClick={() => setFreeOnly((v) => !v)}
          className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        >
          {freeOnly ? "Free only" : "All models"}
        </button>
      </div>

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 rounded-lg border border-border bg-transparent px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <span className={cn("truncate font-mono text-xs", !value && "text-muted-foreground/50")}>
              {value || "Select a model"}
            </span>
            <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
          <Command
            filter={(itemValue, search) =>
              itemValue.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
            }
          >
            <CommandInput placeholder="Search models..." />
            <CommandList data-lenis-prevent>
              <CommandEmpty>No model found.</CommandEmpty>
              <CommandGroup>
                {visible.map((m) => (
                  <CommandItem
                    key={m.id}
                    value={`${m.id} ${m.name}`}
                    onSelect={() => {
                      onChange(m.id)
                      setOpen(false)
                    }}
                  >
                    <Check
                      className={cn(
                        "size-4",
                        value === m.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate text-sm">{m.name}</span>
                      <span className="truncate font-mono text-[11px] text-muted-foreground">
                        {m.id}
                      </span>
                    </div>
                    <span className="ml-2 shrink-0 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                      {m.isFree ? "free" : "paid"}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {hint && <p className="text-xs text-muted-foreground/80">{hint}</p>}
    </div>
  )
}
