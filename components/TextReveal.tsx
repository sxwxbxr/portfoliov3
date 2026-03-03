"use client"

import { motion, useReducedMotion } from "framer-motion"

interface TextRevealProps {
  children: string
  className?: string
  delay?: number
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span"
}

export function TextReveal({ children, className = "", delay = 0, as: Tag = "h1" }: TextRevealProps) {
  const prefersReducedMotion = useReducedMotion()
  const words = children.split(" ")

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: {
        staggerChildren: prefersReducedMotion ? 0 : 0.08,
        delayChildren: prefersReducedMotion ? 0 : delay,
      },
    }),
  }

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring" as const,
        damping: 20,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: prefersReducedMotion ? 1 : 0,
      y: prefersReducedMotion ? 0 : 30,
    },
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className={className}
    >
      <Tag className="flex flex-wrap">
        {words.map((word, index) => (
          <motion.span key={index} variants={child} className="mr-[0.3em] inline-block">
            {word}
          </motion.span>
        ))}
      </Tag>
    </motion.div>
  )
}
