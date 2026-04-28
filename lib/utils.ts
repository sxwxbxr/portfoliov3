import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatMonth(value: string): string {
  if (!value) return ""
  const [year, month] = value.split("-")
  if (!year || !month) return value
  const date = new Date(Number(year), Number(month) - 1, 1)
  if (isNaN(date.getTime())) return value
  return date.toLocaleString("en-US", { month: "short", year: "numeric" })
}

// WCAG-style readable text color picker for arbitrary hex backgrounds.
// Falls back to white when the input is unparseable so we never render
// invisible text on a coloured bar.
export function getReadableTextColor(hex: string): "#0e0e10" | "#ffffff" {
  if (!hex) return "#ffffff"
  let h = hex.trim().replace(/^#/, "")
  if (h.length === 3) {
    h = h
      .split("")
      .map((c) => c + c)
      .join("")
  }
  if (h.length !== 6 || /[^0-9a-f]/i.test(h)) return "#ffffff"
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  // Relative luminance per WCAG 2.x
  const toLinear = (channel: number) => {
    const v = channel / 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  const luminance =
    0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
  return luminance > 0.5 ? "#0e0e10" : "#ffffff"
}
