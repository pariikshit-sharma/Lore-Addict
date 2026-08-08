import type { NextConfig } from "next";

const supabaseHostname = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
  poweredByHeader: false,
  compress: true,

  experimental: {
    // Import-cost reduction for packages that ship large barrel exports —
    // this makes `import { Line } from "recharts"` (etc.) only pull in
    // what's referenced instead of the whole library's module graph.
    // Concretely reduces First Load JS on any route touching these.
    optimizePackageImports: ["recharts", "lucide-react", "@tiptap/react"],
  },

  images: {
    remotePatterns: [
      ...(supabaseHostname
        ? [
            {
              protocol: "https" as const,
              hostname: supabaseHostname,
              pathname: "/storage/v1/object/**",
            },
          ]
        : []),
    ],
    formats: ["image/avif", "image/webp"],
  },

  async headers() {
    return [
      {
        // Applied site-wide. Individual routes (e.g. /studio) layer on
        // stricter auth checks in middleware — these headers are the
        // baseline every response gets regardless of route.
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
