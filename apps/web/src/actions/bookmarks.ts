"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function toggleBookmarkAction(
  articleId: string,
  articleSlug: string,
): Promise<{ bookmarked: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?redirectTo=/article/${articleSlug}`);

  const { data: existing } = await supabase
    .from("bookmarks")
    .select("article_id")
    .eq("user_id", user.id)
    .eq("article_id", articleId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", user.id)
      .eq("article_id", articleId);
    revalidatePath(`/article/${articleSlug}`);
    revalidatePath("/bookmarks");
    return { bookmarked: false };
  }

  await supabase.from("bookmarks").insert({ user_id: user.id, article_id: articleId });
  revalidatePath(`/article/${articleSlug}`);
  revalidatePath("/bookmarks");
  return { bookmarked: true };
}
