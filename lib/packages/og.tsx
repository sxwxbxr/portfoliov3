import { ImageResponse } from "next/og"

export const OG_SIZE = { width: 1200, height: 630 }

/** Shared frame for the package-site OG images, matching app/opengraph-image.tsx. */
export function ogImage(opts: {
  eyebrow: string
  title: string
  subtitle?: string
  footerLeft: string
  footerRight: string
}) {
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
          <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ededed" }} />
          <span style={{ fontSize: 22, color: "#8f8f8f", letterSpacing: 1 }}>{opts.eyebrow}</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <h1
            style={{
              fontSize: opts.title.length > 40 ? 64 : 88,
              fontWeight: 400,
              letterSpacing: -2,
              lineHeight: 1.05,
              margin: 0,
              maxWidth: 1000,
            }}
          >
            {opts.title}
          </h1>
          {opts.subtitle && (
            <p style={{ fontSize: 32, color: "#8f8f8f", lineHeight: 1.3, margin: 0, maxWidth: 960 }}>
              {opts.subtitle}
            </p>
          )}
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
          <span>{opts.footerLeft}</span>
          <span>{opts.footerRight}</span>
        </div>
      </div>
    ),
    OG_SIZE
  )
}
