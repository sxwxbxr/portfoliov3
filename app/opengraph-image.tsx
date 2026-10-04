import { ImageResponse } from "next/og"

export const runtime = "edge"
export const alt = "Seya Weber - Project Manager & Software Developer"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px",
          background: "#0a0a0a",
          color: "#ededed",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: "#ededed",
            }}
          />
          <span style={{ fontSize: 22, color: "#8f8f8f", letterSpacing: 1 }}>
            sweber.dev
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <h1
            style={{
              fontSize: 96,
              fontWeight: 400,
              letterSpacing: -2,
              lineHeight: 1,
              margin: 0,
            }}
          >
            Seya Weber
          </h1>
          <p
            style={{
              fontSize: 36,
              color: "#8f8f8f",
              lineHeight: 1.3,
              margin: 0,
              maxWidth: 900,
            }}
          >
            Project Manager &amp; Software Developer building lean digital
            solutions in St. Gallen, Switzerland.
          </p>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#8f8f8f",
            borderTop: "1px solid #222222",
            paddingTop: 24,
          }}
        >
          <span>Automation · .NET · Next.js</span>
          <span>St. Gallen, CH</span>
        </div>
      </div>
    ),
    size
  )
}
