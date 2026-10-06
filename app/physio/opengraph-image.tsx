import { ImageResponse } from "next/og"
import { siteCopy } from "@/lib/physio/copy/site"

export const runtime = "nodejs"
export const alt = "Physio Tools: Browser-Tools für das Physiotherapie-Studium"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

const INK = "#0f202a"
const MUTED = "#445560"
const TEAL = "#035f61"
const GROUND = "#faf9f5"
const EDGE = "#e3e1db"

/** Same light look as the site: warm paper, deep teal, ink. Logo mark is the one in components/physio/BrandMark.tsx. */
export default function OpenGraphImage() {
  const c = siteCopy.landing
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 80px",
          background: GROUND,
          color: INK,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="64" height="64" viewBox="0 0 32 32">
            <rect width="32" height="32" rx="8" fill={TEAL} />
            <path
              d="M12.5 9H9.75v14h2.75M19.5 9h2.75v14H19.5"
              fill="none"
              stroke="#fff"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="16" cy="16" r="2.75" fill="#fff" />
          </svg>
          <span style={{ fontSize: 40, fontWeight: 700, letterSpacing: -1 }}>{siteCopy.brand.name}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 74, fontWeight: 700, letterSpacing: -2, lineHeight: 1.08 }}>
            <span>{c.title}</span>
            <span style={{ color: TEAL }}>{c.titleSub}</span>
          </div>
          <p style={{ fontSize: 30, color: MUTED, lineHeight: 1.35, margin: 0, maxWidth: 1000 }}>
            Der Suchstring-Generator für dein Studium. Regelbasiert, im Browser.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 26,
            color: MUTED,
            borderTop: `2px solid ${EDGE}`,
            paddingTop: 24,
          }}
        >
          <span>physio.sweber.dev</span>
          <span>Seya Weber, St. Gallen</span>
        </div>
      </div>
    ),
    size,
  )
}
