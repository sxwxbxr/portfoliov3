/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      {
        // Images uploaded through /admin land in Vercel Blob. Without this,
        // next/image refuses the host and the artwork simply does not render.
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },

  async redirects() {
    return [
      {
        // /skills was a separate route that rendered the skills table. It was
        // empty while being advertised in the nav, so it now lives as a
        // section of /about. Permanent, because the old URL was live and is
        // potentially indexed and linked.
        source: "/skills",
        destination: "/about#skills",
        permanent: true,
      },
      // /experience and /education merged into /career. In the Swiss
      // apprenticeship model work and school run concurrently, so the split
      // left the work page showing unexplained gaps where a full-time school
      // year actually sat. Both URLs were live and are potentially indexed.
      {
        source: "/experience",
        destination: "/career",
        permanent: true,
      },
      {
        source: "/education",
        destination: "/career",
        permanent: true,
      },
    ]
  },

  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "connect-src 'self' https://api.github.com https://va.vercel-scripts.com https://vitals.vercel-insights.com",
              "font-src 'self' https://fonts.gstatic.com",
              "frame-ancestors 'none'",
            ].join("; "),
          },
        ],
      },
    ]
  },
}

export default nextConfig
