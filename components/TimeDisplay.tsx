"use client"

import { useState, useEffect } from "react"

export function TimeDisplay() {
  const [time, setTime] = useState<string>("")

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Europe/Zurich",
      hour12: false,
    })

    const update = () => {
      setTime(formatter.format(new Date()))
    }

    update()

    const interval = setInterval(update, 60_000)
    return () => clearInterval(interval)
  }, [])

  if (!time) return null

  return (
    <span className="text-sm text-muted-foreground font-mono tabular-nums">
      {time} CET
    </span>
  )
}
