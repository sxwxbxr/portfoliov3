"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

function Checkbox({
  className,
  ...props
}: React.ComponentProps<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        // CAST: unchecked is a small recess in whatever seat it sits on;
        // checked fills with the accent. `shadow-xs`, `dark:bg-input/30` and
        // the `outline-none` + ring pair are gone — the first two are
        // off-material and the third replaced the one global focus ring.
        "peer size-4 shrink-0 rounded-[4px] border border-edge bg-well transition-colors duration-150 data-[state=checked]:border-signal data-[state=checked]:bg-signal data-[state=checked]:text-signal-fg aria-invalid:border-destructive disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current transition-none"
      >
        <CheckIcon className="size-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
