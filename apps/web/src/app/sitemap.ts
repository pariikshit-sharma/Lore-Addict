import type { MetadataRoute } from "next";
import { createStaticClient } from "@/lib/supabase/static";

const URLS_PER_SITEMAP = 1000;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "";

const STATIC_ROUTES = [
  "",
  "/news",
  "/reviews",
  "/theories",
  "/trending",
  "/search",
];

async function getPublishedArticleCount(): Promise<number> {
  const supabase = createStaticClient();
  const { count } = await supabase
    .from("articles")
    .select("id", { count: "exact", head: true })
    .eq("status", "published")
    .is("deleted_at", null);
  return count ?? 0;
}

/**
 * Sitemap 0 is always the static routes + categories/tags; sitemaps 1+
 * are pages of 1000 articles each. Splitting this way means the static
 * shell of the site never gets pushed out of the first file as article
 * count grows into the thousands.
 */
export async function generateSitemaps() {
  const articleCount = await getPublishedArticleCount();
  const articleSitemapCount = Math.max(1, Math.ceil(articleCount / URLS_PER_SITEMAP));
  return Array.from({ length: articleSitemapCount + 1 }, (_, id) => ({ id }));
}

export default async function sitemap({
  id,
}: {
  id: number;
}): Promise<MetadataRoute.Sitemap> {
  const supabase = createStaticClient();

  if (id === 0) {
    const [{ data: categories }, { data: tags }] = await Promise.all([
      supabase.from("categories").select("slug"),
      supabase.from("tags").select("slug"),
    ]);

    return [
      ...STATIC_ROUTES.map((path) => ({
        url: `${SITE_URL}${path}`,
        changeFrequency: "daily" as const,
        priority: path === "" ? 1 : 0.7,
      })),
      ...(categories ?? []).map((c) => ({
        url: `${SITE_URL}/category/${c.slug}`,
        changeFrequency: "daily" as const,
        priority: 0.6,
      })),
      ...(tags ?? []).map((t) => ({
        url: `${SITE_URL}/tag/${t.slug}`,
        changeFrequency: "weekly" as const,
        priority: 0.4,
      })),
    ];
  }

  const page = id - 1;
  const { data: articles } = await supabase
    .from("articles")
    .select("slug, updated_at")
    .eq("status", "published")
    .is("deleted_at", null)
    .order("published_at", { ascending: false })
    .range(page * URLS_PER_SITEMAP, (page + 1) * URLS_PER_SITEMAP - 1);

  return (articles ?? []).map((article) => ({
    url: `${SITE_URL}/article/${article.slug}`,
    lastModified: article.updated_at,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));
}
