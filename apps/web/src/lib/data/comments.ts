import { createClient } from "@/lib/supabase/server";

export interface CommentNode {
  id: string;
  body: string;
  created_at: string;
  parent_id: string | null;
  user: { display_name: string; username: string; avatar_url: string | null };
  replies: CommentNode[];
}

export async function getArticleComments(articleId: string): Promise<CommentNode[]> {
  const supabase = await createClient();

  const { data } = await supabase
    .from("comments")
    .select(
      "id, body, created_at, parent_id, profiles ( display_name, username, avatar_url )",
    )
    .eq("article_id", articleId)
    .eq("status", "visible")
    .order("created_at", { ascending: true });

  const rows = (data ?? []) as unknown as Array<{
    id: string;
    body: string;
    created_at: string;
    parent_id: string | null;
    profiles: { display_name: string; username: string; avatar_url: string | null };
  }>;

  const byId = new Map<string, CommentNode>();
  const roots: CommentNode[] = [];

  for (const row of rows) {
    byId.set(row.id, {
      id: row.id,
      body: row.body,
      created_at: row.created_at,
      parent_id: row.parent_id,
      user: row.profiles,
      replies: [],
    });
  }

  for (const node of byId.values()) {
    if (node.parent_id && byId.has(node.parent_id)) {
      byId.get(node.parent_id)!.replies.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}
