"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface AuroraBackgroundProps {
  children: ReactNode
  className?: string
}

export function AuroraBackground({ children, className }: AuroraBackgroundProps) {
  return (
    <div className={cn("relative overflow-hidden rounded-[32px] border border-white/10 bg-background", className)}>
      <motion.div
        initial={{ opacity: 0.6 }}
        animate={{
          opacity: [0.6, 0.9, 0.6],
          backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,_rgba(99,102,241,0.35),_transparent_40%),radial-gradient(circle_at_80%_0%,_rgba(236,72,153,0.25),_transparent_35%),radial-gradient(circle_at_20%_80%,_rgba(52,211,153,0.2),_transparent_35%)] blur-3xl"
      />
      <div className="relative z-10">{children}</div>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_120%,rgba(255,255,255,0.08),transparent)]" />
    </div>
  )
}
