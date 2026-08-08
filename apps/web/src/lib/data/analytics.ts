import { createClient } from "@/lib/supabase/server";

export interface ViewsOverTimePoint {
  day: string;
  views: number;
}

export interface TopArticleRow {
  article_id: string;
  title: string;
  slug: string;
  views: number;
}

export interface BreakdownRow {
  label: string;
  count: number;
}

const LOOKBACK_DAYS = 30;

/**
 * Site-wide (editor/admin) or scoped to one author's own articles — same
 * shape either way, so the dashboard component doesn't need to know which
 * case it's rendering.
 */
export async function getViewsOverTime(authorId?: string): Promise<ViewsOverTimePoint[]> {
  const supabase = await createClient();
  const since = new Date(Date.now() - LOOKBACK_DAYS * 86_400_000)
    .toISOString()
    .slice(0, 10);

  let query = supabase
    .from("article_daily_stats")
    .select("day, views, articles!inner(primary_author_id)")
    .gte("day", since)
    .order("day");

  if (authorId) {
    query = query.eq("articles.primary_author_id", authorId);
  }

  const { data } = await query;
  if (!data) return [];

  const byDay = new Map<string, number>();
  for (const row of data as unknown as Array<{ day: string; views: number }>) {
    byDay.set(row.day, (byDay.get(row.day) ?? 0) + row.views);
  }

  return Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([day, views]) => ({ day, views }));
}

export async function getTopArticles(authorId?: string, limit = 10): Promise<TopArticleRow[]> {
  const supabase = await createClient();
  const since = new Date(Date.now() - LOOKBACK_DAYS * 86_400_000)
    .toISOString()
    .slice(0, 10);

  let query = supabase
    .from("article_daily_stats")
    .select("article_id, views, articles!inner(title, slug, primary_author_id)")
    .gte("day", since);

  if (authorId) {
    query = query.eq("articles.primary_author_id", authorId);
  }

  const { data } = await query;
  if (!data) return [];

  const rows = data as unknown as Array<{
    article_id: string;
    views: number;
    articles: { title: string; slug: string };
  }>;

  const byArticle = new Map<string, TopArticleRow>();
  for (const row of rows) {
    const existing = byArticle.get(row.article_id);
    if (existing) {
      existing.views += row.views;
    } else {
      byArticle.set(row.article_id, {
        article_id: row.article_id,
        title: row.articles.title,
        slug: row.articles.slug,
        views: row.views,
      });
    }
  }

  return Array.from(byArticle.values())
    .sort((a, b) => b.views - a.views)
    .slice(0, limit);
}

async function getEventBreakdown(
  column: "referrer_source" | "device" | "country",
  authorId?: string,
): Promise<BreakdownRow[]> {
  const supabase = await createClient();
  const since = new Date(Date.now() - LOOKBACK_DAYS * 86_400_000).toISOString();

  let query = supabase
    .from("article_events")
    .select(`${column}, articles!inner(primary_author_id)`)
    .eq("event_type", "view")
    .gte("occurred_at", since)
    .limit(5000);

  if (authorId) {
    query = query.eq("articles.primary_author_id", authorId);
  }

  const { data } = await query;
  if (!data) return [];

  const counts = new Map<string, number>();
  for (const row of data as unknown as Array<Record<string, string | null>>) {
    const key = row[column] ?? "unknown";
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}

export const getTrafficSources = (authorId?: string) => getEventBreakdown("referrer_source", authorId);
export const getDeviceBreakdown = (authorId?: string) => getEventBreakdown("device", authorId);
export const getCountryBreakdown = (authorId?: string) => getEventBreakdown("country", authorId);
