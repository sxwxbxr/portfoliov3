"use client"

import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { ReactNode } from "react"

interface BlurFadeProps {
  children: ReactNode
  delay?: number
  className?: string
}

export function BlurFade({ children, delay = 0, className }: BlurFadeProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24, filter: "blur(12px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
