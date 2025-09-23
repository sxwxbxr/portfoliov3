"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value = 0, ...props }, ref) => {
  const numericValue = Number(value)
  const clampedValue = Number.isFinite(numericValue)
    ? Math.min(100, Math.max(0, numericValue))
    : 0

  return (
    <ProgressPrimitive.Root
      ref={ref}
      value={clampedValue}
      className={cn("relative h-4 w-full overflow-hidden rounded-full bg-secondary", className)}
      {...props}
    >
      <ProgressPrimitive.Indicator
        className="h-full origin-left rounded-full bg-gradient-to-r from-primary to-secondary transition-transform duration-300 ease-out"
        style={{ transform: `scaleX(${clampedValue / 100})`, transformOrigin: "left" }}
      />
    </ProgressPrimitive.Root>
  )
})
Progress.displayName = ProgressPrimitive.Root.displayName

export { Progress }
