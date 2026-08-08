import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/studio", "/api", "/settings", "/bookmarks", "/history"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
