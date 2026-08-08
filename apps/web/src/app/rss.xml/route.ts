import { createClient } from "@/lib/supabase/server";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const supabase = await createClient();
  const { data: articles } = await supabase
    .from("articles")
    .select("slug, title, excerpt, published_at")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("published_at", { ascending: false })
    .limit(50);

  const items = (articles ?? [])
    .map(
      (article) => `
    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${SITE_URL}/article/${article.slug}</link>
      <guid>${SITE_URL}/article/${article.slug}</guid>
      <description>${escapeXml(article.excerpt ?? "")}</description>
      <pubDate>${article.published_at ? new Date(article.published_at).toUTCString() : ""}</pubDate>
    </item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Lore Addict</title>
    <link>${SITE_URL}</link>
    <description>Anime, movies, TV, manga, and pop culture — news, reviews, and theories.</description>
    <language>en-us</language>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // 5 minutes matches the article_feed refresh cadence rather than
      // being an arbitrary number.
      "Cache-Control": "public, max-age=0, s-maxage=300",
    },
  });
}
