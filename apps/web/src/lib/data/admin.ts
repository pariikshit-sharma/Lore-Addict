import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@lore-addict/types";

export interface ProfileRow {
  id: string;
  username: string;
  display_name: string;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
}

export async function getAllProfiles(): Promise<ProfileRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, role, created_at")
    .order("created_at", { ascending: false });

  return data ?? [];
}

export interface AuthorRow extends ProfileRow {
  published_count: number;
}

export async function getAuthorsWithArticleCounts(): Promise<AuthorRow[]> {
  const supabase = await createClient();
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, username, display_name, avatar_url, role, created_at")
    .in("role", ["author", "editor", "admin"])
    .order("display_name");

  if (!profiles || profiles.length === 0) return [];

  const { data: counts } = await supabase
    .from("articles")
    .select("primary_author_id")
    .eq("status", "published")
    .is("deleted_at", null)
    .in(
      "primary_author_id",
      profiles.map((p) => p.id),
    );

  const countByAuthor = new Map<string, number>();
  for (const row of counts ?? []) {
    countByAuthor.set(
      row.primary_author_id,
      (countByAuthor.get(row.primary_author_id) ?? 0) + 1,
    );
  }

  return profiles.map((p) => ({
    ...p,
    published_count: countByAuthor.get(p.id) ?? 0,
  }));
}

export interface AdSlotRow {
  id: string;
  name: string;
  provider: string;
  is_active: boolean;
  created_at: string;
}

export async function getAdSlots(): Promise<AdSlotRow[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ad_slots")
    .select("id, name, provider, is_active, created_at")
    .order("created_at", { ascending: false });

  return data ?? [];
}
