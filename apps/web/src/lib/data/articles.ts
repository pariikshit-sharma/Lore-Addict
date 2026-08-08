import { createClient } from "@/lib/supabase/server";

export interface FeedArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  type: string;
  published_at: string | null;
  reading_time_minutes: number | null;
  is_featured: boolean;
  contains_spoilers: boolean;
  category_name: string | null;
  category_slug: string | null;
  author_name: string;
  author_username: string;
  author_avatar: string | null;
  views_7d: number;
}

/**
 * The single most recent featured article, for the homepage hero. Falls
 * back to the single most recent published article if nothing is
 * currently marked featured, so the hero slot is never empty.
 */
export async function getFeaturedArticle(): Promise<FeedArticle | null> {
  const supabase = await createClient();

  const { data: featured } = await supabase
    .from("article_feed")
    .select("*")
    .eq("is_featured", true)
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (featured) return featured;

  const { data: fallback } = await supabase
    .from("article_feed")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return fallback;
}

/**
 * Ranked by the 7-day rolling view count baked into the view (see
 * article_daily_stats in 0002_content.sql) — not by recency. This is what
 * "Trending" means on this platform, distinct from "Latest."
 */
export async function getTrendingArticles(limit = 10): Promise<FeedArticle[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("article_feed")
    .select("*")
    .order("views_7d", { ascending: false })
    .order("published_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function getLatestArticles(
  options: { excludeId?: string; limit?: number } = {},
): Promise<FeedArticle[]> {
  const { excludeId, limit = 12 } = options;
  const supabase = await createClient();

  let query = supabase
    .from("article_feed")
    .select("*")
    .order("published_at", { ascending: false })
    .limit(limit);

  if (excludeId) {
    query = query.neq("id", excludeId);
  }

  const { data } = await query;
  return data ?? [];
}

export interface ArticleDetail {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  excerpt: string | null;
  content_html: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  type: string;
  published_at: string | null;
  reading_time_minutes: number | null;
  contains_spoilers: boolean;
  spoiler_scope: string | null;
  seo_title: string | null;
  seo_description: string | null;
  og_image_url: string | null;
  category_id: string | null;
  category: { name: string; slug: string } | null;
  author: { id: string; display_name: string; username: string; avatar_url: string | null; bio: string | null };
  tags: Array<{ id: string; name: string; slug: string }>;
}

/**
 * Reads directly from `articles` (not `article_feed`) because a single
 * article page needs fields the feed view intentionally omits — full
 * content_html, SEO overrides, author bio. The feed view exists for
 * *listing* surfaces; this is the one-row lookup those listings link to.
 */
export async function getArticleBySlug(slug: string): Promise<ArticleDetail | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("articles")
    .select(
      `id, slug, title, subtitle, excerpt, content_html, cover_image_url,
       cover_image_alt, type, published_at, reading_time_minutes,
       contains_spoilers, spoiler_scope, seo_title, seo_description,
       og_image_url, category_id,
       categories ( name, slug ),
       profiles!articles_primary_author_id_fkey ( id, display_name, username, avatar_url, bio ),
       article_tags ( tags ( id, name, slug ) )`,
    )
    .eq("slug", slug)
    .eq("status", "published")
    .is("deleted_at", null)
    .single();

  if (error || !data) return null;

  const row = data as unknown as {
    id: string;
    slug: string;
    title: string;
    subtitle: string | null;
    excerpt: string | null;
    content_html: string;
    cover_image_url: string | null;
    cover_image_alt: string | null;
    type: string;
    published_at: string | null;
    reading_time_minutes: number | null;
    contains_spoilers: boolean;
    spoiler_scope: string | null;
    seo_title: string | null;
    seo_description: string | null;
    og_image_url: string | null;
    category_id: string | null;
    categories: { name: string; slug: string } | null;
    profiles: { id: string; display_name: string; username: string; avatar_url: string | null; bio: string | null };
    article_tags: Array<{ tags: { id: string; name: string; slug: string } }>;
  };

  return {
    ...row,
    category: row.categories,
    author: row.profiles,
    tags: row.article_tags.map((t) => t.tags),
  };
}

/** Looks up the current slug for an old one, for the 301 redirect path. */
export async function getRedirectTarget(oldSlug: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("slug_redirects")
    .select("articles(slug)")
    .eq("old_slug", oldSlug)
    .maybeSingle();

  return (data as unknown as { articles: { slug: string } } | null)?.articles?.slug ?? null;
}

/**
 * Editorial curation (related_articles table) wins when present; falls
 * back to same-category articles otherwise — per the CMS Architecture
 * section ("falls back to auto if empty").
 */
export async function getRelatedArticles(
  articleId: string,
  categoryId: string | null,
  limit = 4,
): Promise<FeedArticle[]> {
  const supabase = await createClient();

  const { data: curated } = await supabase
    .from("related_articles")
    .select("related_article_id")
    .eq("article_id", articleId)
    .order("position")
    .limit(limit);

  if (curated && curated.length > 0) {
    const { data } = await supabase
      .from("article_feed")
      .select("*")
      .in("id", curated.map((c) => c.related_article_id));
    if (data && data.length > 0) return data;
  }

  if (!categoryId) return [];

  const { data: categoryRow } = await supabase
    .from("categories")
    .select("slug")
    .eq("id", categoryId)
    .single();
  if (!categoryRow) return [];

  const { data } = await supabase
    .from("article_feed")
    .select("*")
    .eq("category_slug", categoryRow.slug)
    .neq("id", articleId)
    .order("published_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

/**
 * Reads from `articles` directly rather than `article_feed` because the
 * view doesn't expose `search_vector` — mapped into the FeedArticle shape
 * anyway so the results page can reuse ArticleCard/ArticleGrid unchanged.
 * `views_7d` is unavailable here (search isn't ranked by popularity) and
 * defaults to 0 rather than being fetched separately, which would cost an
 * extra query for a value nothing in this view actually displays.
 */
export async function searchArticles(
  query: string,
  limit = 20,
): Promise<FeedArticle[]> {
  if (query.trim().length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("articles")
    .select(
      `id, slug, title, excerpt, cover_image_url, type, published_at,
       reading_time_minutes, is_featured, contains_spoilers,
       categories ( name, slug ),
       profiles!articles_primary_author_id_fkey ( display_name, username, avatar_url )`,
    )
    .eq("status", "published")
    .is("deleted_at", null)
    .textSearch("search_vector", query, { type: "websearch", config: "english" })
    .order("published_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];

  const rows = data as unknown as Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    cover_image_url: string | null;
    type: string;
    published_at: string | null;
    reading_time_minutes: number | null;
    is_featured: boolean;
    contains_spoilers: boolean;
    categories: { name: string; slug: string } | null;
    profiles: { display_name: string; username: string; avatar_url: string | null };
  }>;

  return rows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    cover_image_url: row.cover_image_url,
    type: row.type,
    published_at: row.published_at,
    reading_time_minutes: row.reading_time_minutes,
    is_featured: row.is_featured,
    contains_spoilers: row.contains_spoilers,
    category_name: row.categories?.name ?? null,
    category_slug: row.categories?.slug ?? null,
    author_name: row.profiles.display_name,
    author_username: row.profiles.username,
    author_avatar: row.profiles.avatar_url,
    views_7d: 0,
  }));
}

export async function getArticlesByTag(tagSlug: string, limit = 20): Promise<FeedArticle[]> {
  const supabase = await createClient();

  const { data: tag } = await supabase.from("tags").select("id").eq("slug", tagSlug).single();
  if (!tag) return [];

  const { data } = await supabase
    .from("article_tags")
    .select(
      `articles!inner ( id, slug, title, excerpt, cover_image_url, type, published_at,
       reading_time_minutes, is_featured, contains_spoilers, status, deleted_at,
       categories ( name, slug ),
       profiles!articles_primary_author_id_fkey ( display_name, username, avatar_url ) )`,
    )
    .eq("tag_id", tag.id)
    .eq("articles.status", "published")
    .is("articles.deleted_at", null)
    .order("published_at", { referencedTable: "articles", ascending: false })
    .limit(limit);

  if (!data) return [];

  const rows = data as unknown as Array<{
    articles: {
      id: string;
      slug: string;
      title: string;
      excerpt: string | null;
      cover_image_url: string | null;
      type: string;
      published_at: string | null;
      reading_time_minutes: number | null;
      is_featured: boolean;
      contains_spoilers: boolean;
      categories: { name: string; slug: string } | null;
      profiles: { display_name: string; username: string; avatar_url: string | null };
    };
  }>;

  return rows
    .filter((r) => r.articles)
    .map((r) => ({
      id: r.articles.id,
      slug: r.articles.slug,
      title: r.articles.title,
      excerpt: r.articles.excerpt,
      cover_image_url: r.articles.cover_image_url,
      type: r.articles.type,
      published_at: r.articles.published_at,
      reading_time_minutes: r.articles.reading_time_minutes,
      is_featured: r.articles.is_featured,
      contains_spoilers: r.articles.contains_spoilers,
      category_name: r.articles.categories?.name ?? null,
      category_slug: r.articles.categories?.slug ?? null,
      author_name: r.articles.profiles.display_name,
      author_username: r.articles.profiles.username,
      author_avatar: r.articles.profiles.avatar_url,
      views_7d: 0,
    }));
}

export async function getArticlesByType(
  type: string,
  limit = 24,
): Promise<FeedArticle[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("article_feed")
    .select("*")
    .eq("type", type)
    .order("published_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function getArticlesByCategory(
  categorySlug: string,
  limit = 12,
): Promise<FeedArticle[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("article_feed")
    .select("*")
    .eq("category_slug", categorySlug)
    .order("published_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}
