import type { Metadata } from "next";
import { Fredoka, Source_Serif_4, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { JsonLd } from "@/components/seo/json-ld";
import { buildSiteJsonLd } from "@/lib/seo/json-ld";

// Display face: rounded and confident, echoing the bubble-letter logo
// without literally copying it. Used sparingly — headlines and hero
// moments only, never body copy (see design plan in ARCHITECTURE.md).
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

// Body/editorial face: a warm serif built for long-form reading —
// article bodies live here, not in the display face.
const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  weight: ["400", "600"],
  variable: "--font-source-serif",
  display: "swap",
});

// Utility face: metadata, timestamps, tags, read time — small and quiet.
const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Lore Addict",
    template: "%s | Lore Addict",
  },
  description:
    "Anime, movies, TV, manga, and pop culture — news, reviews, and theories.",
  openGraph: {
    siteName: "Lore Addict",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`dark ${fredoka.variable} ${sourceSerif.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <JsonLd data={buildSiteJsonLd()} />
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
