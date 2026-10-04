"use client"

import { useEffect, useState } from "react"

/**
 * True once mounted on a packages.* host. Read after mount so server and
 * client render the same markup; only the brand link and the active nav item
 * depend on it.
 */
export function useOnPackagesHost(): boolean {
  const [on, setOn] = useState(false)
  useEffect(() => {
    setOn(window.location.hostname.startsWith("packages."))
  }, [])
  return on
}
