"use client"
import { motion, useReducedMotion } from "framer-motion"
import type { ReactNode } from "react"

interface FadeInSectionProps {
  children: ReactNode
}

export default function FadeInSection({ children }: FadeInSectionProps) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{
        duration: prefersReducedMotion ? 0 : 0.8,
        ease: [0.25, 0.25, 0, 1],
      }}
    >
      {children}
    </motion.div>
  )
}
