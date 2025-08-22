"use client"

import type React from "react"

import { useRef, useState } from "react"
import { motion } from "framer-motion"

interface InteractiveCardProps {
  children: React.ReactNode
  className?: string
}

export function InteractiveCard({ children, className = "" }: InteractiveCardProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isHovering, setIsHovering] = useState(false)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return

    const rect = ref.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    setMousePosition({ x, y })
  }

  return (
    <motion.div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {isHovering && (
        <div
          className="absolute pointer-events-none opacity-20 rounded-full bg-gradient-to-r from-primary to-secondary blur-xl transition-opacity duration-300"
          style={{
            left: mousePosition.x - 50,
            top: mousePosition.y - 50,
            width: 100,
            height: 100,
          }}
        />
      )}
      {children}
    </motion.div>
  )
}
