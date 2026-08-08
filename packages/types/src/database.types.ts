// Provisional — mirrors supabase/migrations/0001_identity.sql and
// 0002_content.sql exactly. Replaced by real `pnpm db:types` CLI output
// the moment a live Supabase project exists to introspect.

export type UserRole = "admin" | "editor" | "author" | "moderator" | "user";
export type ArticleStatus =
  | "draft"
  | "in_review"
  | "scheduled"
  | "published"
  | "archived";
export type ArticleType =
  | "news"
  | "review"
  | "theory"
  | "editorial"
  | "listicle"
  | "recap";
export type CommentStatus = "visible" | "pending" | "removed";
export type ArticleEventType =
  | "view"
  | "scroll_25"
  | "scroll_75"
  | "share"
  | "bookmark";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          display_name: string;
          avatar_url: string | null;
          bio: string | null;
          role: UserRole;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          display_name: string;
          avatar_url?: string | null;
          bio?: string | null;
          role?: UserRole;
        };
        Update: {
          username?: string;
          display_name?: string;
          avatar_url?: string | null;
          bio?: string | null;
          role?: UserRole;
        };
      };

      categories: {
        Row: {
          id: string;
          name: string;
          slug: string;
          description: string | null;
          parent_id: string | null;
          created_at: string;
        };
        Insert: {
          name: string;
          slug: string;
          description?: string | null;
          parent_id?: string | null;
        };
        Update: {
          name?: string;
          slug?: string;
          description?: string | null;
          parent_id?: string | null;
        };
      };

      tags: {
        Row: { id: string; name: string; slug: string; created_at: string };
        Insert: { name: string; slug: string };
        Update: { name?: string; slug?: string };
      };

      articles: {
        Row: {
          id: string;
          slug: string;
          title: string;
          subtitle: string | null;
          excerpt: string | null;
          content_json: Record<string, unknown>;
          content_html: string;
          cover_image_url: string | null;
          cover_image_alt: string | null;
          type: ArticleType;
          status: ArticleStatus;
          primary_author_id: string;
          category_id: string | null;
          contains_spoilers: boolean;
          spoiler_scope: string | null;
          reading_time_minutes: number | null;
          seo_title: string | null;
          seo_description: string | null;
          og_image_url: string | null;
          canonical_url: string | null;
          published_at: string | null;
          scheduled_for: string | null;
          is_featured: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
          search_vector: unknown;
        };
        Insert: {
          slug: string;
          title: string;
          subtitle?: string | null;
          excerpt?: string | null;
          content_json: Record<string, unknown>;
          content_html: string;
          cover_image_url?: string | null;
          cover_image_alt?: string | null;
          type?: ArticleType;
          status?: ArticleStatus;
          primary_author_id: string;
          category_id?: string | null;
          contains_spoilers?: boolean;
          spoiler_scope?: string | null;
          reading_time_minutes?: number | null;
          seo_title?: string | null;
          seo_description?: string | null;
          og_image_url?: string | null;
          canonical_url?: string | null;
          published_at?: string | null;
          scheduled_for?: string | null;
          is_featured?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["articles"]["Insert"]>;
      };

      article_authors: {
        Row: { article_id: string; author_id: string };
        Insert: { article_id: string; author_id: string };
        Update: never;
      };

      article_tags: {
        Row: { article_id: string; tag_id: string };
        Insert: { article_id: string; tag_id: string };
        Update: never;
      };

      article_revisions: {
        Row: {
          id: string;
          article_id: string;
          content_json: Record<string, unknown>;
          edited_by: string;
          created_at: string;
        };
        Insert: {
          article_id: string;
          content_json: Record<string, unknown>;
          edited_by: string;
        };
        Update: never;
      };

      related_articles: {
        Row: {
          article_id: string;
          related_article_id: string;
          position: number;
        };
        Insert: {
          article_id: string;
          related_article_id: string;
          position?: number;
        };
        Update: { position?: number };
      };

      slug_redirects: {
        Row: { old_slug: string; article_id: string; created_at: string };
        Insert: { old_slug: string; article_id: string };
        Update: never;
      };

      comments: {
        Row: {
          id: string;
          article_id: string;
          user_id: string;
          parent_id: string | null;
          body: string;
          status: CommentStatus;
          created_at: string;
          deleted_at: string | null;
        };
        Insert: {
          article_id: string;
          user_id: string;
          parent_id?: string | null;
          body: string;
          status?: CommentStatus;
        };
        Update: {
          body?: string;
          status?: CommentStatus;
          deleted_at?: string | null;
        };
      };

      bookmarks: {
        Row: { user_id: string; article_id: string; created_at: string };
        Insert: { user_id: string; article_id: string };
        Update: never;
      };

      reading_history: {
        Row: {
          user_id: string;
          article_id: string;
          progress_percent: number;
          last_read_at: string;
        };
        Insert: {
          user_id: string;
          article_id: string;
          progress_percent?: number;
        };
        Update: { progress_percent?: number; last_read_at?: string };
      };

      newsletter_subscribers: {
        Row: {
          id: string;
          email: string;
          confirmed: boolean;
          subscribed_categories: string[];
          unsubscribe_token: string;
          created_at: string;
        };
        Insert: {
          email: string;
          confirmed?: boolean;
          subscribed_categories?: string[];
        };
        Update: { confirmed?: boolean; subscribed_categories?: string[] };
      };

      article_events: {
        Row: {
          id: number;
          article_id: string;
          event_type: ArticleEventType;
          session_id: string;
          user_id: string | null;
          country: string | null;
          device: string | null;
          referrer_source: string | null;
          occurred_at: string;
        };
        Insert: {
          article_id: string;
          event_type: ArticleEventType;
          session_id: string;
          user_id?: string | null;
          country?: string | null;
          device?: string | null;
          referrer_source?: string | null;
        };
        Update: never;
      };

      article_daily_stats: {
        Row: {
          article_id: string;
          day: string;
          views: number;
          unique_sessions: number;
          avg_read_time_seconds: number | null;
        };
        Insert: {
          article_id: string;
          day: string;
          views?: number;
          unique_sessions?: number;
          avg_read_time_seconds?: number | null;
        };
        Update: never;
      };

      ad_slots: {
        Row: {
          id: string;
          name: string;
          provider: string;
          config: Record<string, unknown>;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          name: string;
          provider: string;
          config?: Record<string, unknown>;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          provider?: string;
          config?: Record<string, unknown>;
          is_active?: boolean;
        };
      };
    };
    Functions: {
      refresh_article_feed: {
        Args: Record<string, never>;
        Returns: void;
      };
      rollup_daily_stats: {
        Args: { target_date: string };
        Returns: void;
      };
      ensure_next_month_partition: {
        Args: Record<string, never>;
        Returns: void;
      };
    };
    Views: {
      article_feed: {
        Row: {
          id: string;
          slug: string;
          title: string;
          excerpt: string | null;
          cover_image_url: string | null;
          type: ArticleType;
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
        };
      };
    };
  };
}
