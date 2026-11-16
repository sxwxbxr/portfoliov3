import type React from "react"
import s from "./NameSlab.module.css"

/**
 * The name set very large in Syne, sized so its longest word spans the
 * width, with the company line above it. The company line hides itself
 * once the name is the company (planned for 2027: one copy string).
 */
export function NameSlab({
  name,
  company,
  as: Tag = "p",
  children,
}: {
  name: string
  company: string
  as?: "h1" | "p"
  /** Extra text inside the name element, e.g. for screen readers. */
  children?: React.ReactNode
}) {
  const longest = Math.max(...name.split(/\s+/).map((word) => word.length))
  return (
    <>
      {company !== name && <p className={s.company}>{company}</p>}
      <Tag className={s.name} style={{ "--chars": longest } as React.CSSProperties}>
        {name}
        {children}
      </Tag>
    </>
  )
}
