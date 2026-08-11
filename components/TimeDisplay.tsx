"use client"

import { useState, useEffect } from "react"

import { copy } from "@/lib/copy"

export function TimeDisplay() {
  const [time, setTime] = useState<string>("")

  useEffect(() => {
    const formatter = new Intl.DateTimeFormat(copy.common.dateLocale, {
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

  // Sits in the footer's base rail next to the other annotations, so it takes
  // the same mono/tabular treatment instead of open-coding one.
  return <span className="annotate">{copy.common.localTime(time)}</span>
}
