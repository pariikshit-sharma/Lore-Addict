import { createClient } from "@/lib/supabase/server";
import type { FeedArticle } from "./articles";

export interface PublicProfile {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  bio: string | null;
  created_at: string;
}

export async function getProfileByUsername(username: string): Promise<PublicProfile | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, bio, created_at")
    .eq("username", username)
    .single();

  return data;
}

export async function getArticlesByAuthor(
  authorId: string,
  limit = 20,
): Promise<FeedArticle[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select(
      `id, slug, title, excerpt, cover_image_url, type, published_at,
       reading_time_minutes, is_featured, contains_spoilers,
       categories ( name, slug )`,
    )
    .eq("primary_author_id", authorId)
    .eq("status", "published")
    .is("deleted_at", null)
    .order("published_at", { ascending: false })
    .limit(limit);

  if (!data) return [];

  const author = await getAuthorSummary(authorId);
  if (!author) return [];

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
    author_name: author.display_name,
    author_username: author.username,
    author_avatar: author.avatar_url,
    views_7d: 0,
  }));
}

async function getAuthorSummary(authorId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("display_name, username, avatar_url")
    .eq("id", authorId)
    .single();
  return data;
}

export async function getUserCommentCount(userId: string): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("comments")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "visible");
  return count ?? 0;
}

export async function getBookmarkedArticles(userId: string): Promise<FeedArticle[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("bookmarks")
    .select("created_at, articles!inner ( id, slug, title, excerpt, cover_image_url, type, published_at, reading_time_minutes, is_featured, contains_spoilers, category_id )")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!data) return [];

  // article_feed isn't used here since bookmarks can point at articles a
  // user saved before the view's 5-minute refresh window catches up —
  // reading straight from `articles` keeps this list accurate immediately.
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
      category_id: string | null;
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
      category_name: null,
      category_slug: null,
      author_name: "",
      author_username: "",
      author_avatar: null,
      views_7d: 0,
    }));
}

export interface ReadingHistoryEntry {
  article_id: string;
  slug: string;
  title: string;
  cover_image_url: string | null;
  progress_percent: number;
  last_read_at: string;
}

export async function getReadingHistory(userId: string): Promise<ReadingHistoryEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reading_history")
    .select("progress_percent, last_read_at, articles!inner ( id, slug, title, cover_image_url )")
    .eq("user_id", userId)
    .order("last_read_at", { ascending: false })
    .limit(50);

  if (!data) return [];

  const rows = data as unknown as Array<{
    progress_percent: number;
    last_read_at: string;
    articles: { id: string; slug: string; title: string; cover_image_url: string | null };
  }>;

  return rows
    .filter((r) => r.articles)
    .map((r) => ({
      article_id: r.articles.id,
      slug: r.articles.slug,
      title: r.articles.title,
      cover_image_url: r.articles.cover_image_url,
      progress_percent: r.progress_percent,
      last_read_at: r.last_read_at,
    }));
}
