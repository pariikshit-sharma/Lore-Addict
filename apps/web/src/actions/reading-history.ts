"use server";

import { createClient } from "@/lib/supabase/server";

/**
 * Fire-and-forget from the client: silently no-ops for signed-out readers
 * (reading_history is a signed-in feature, not an error condition when
 * absent) and never throws into the UI — losing a progress update is
 * harmless, unlike losing a comment or a save.
 */
export async function recordReadingProgressAction(
  articleId: string,
  progressPercent: number,
): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const clamped = Math.max(0, Math.min(100, Math.round(progressPercent)));

  const { data: existing } = await supabase
    .from("reading_history")
    .select("progress_percent")
    .eq("user_id", user.id)
    .eq("article_id", articleId)
    .maybeSingle();

  // Progress only moves forward — a later, shorter visit shouldn't erase
  // that the reader already finished the article on a previous one.
  const nextProgress = Math.max(clamped, existing?.progress_percent ?? 0);

  await supabase.from("reading_history").upsert(
    { user_id: user.id, article_id: articleId, progress_percent: nextProgress },
    { onConflict: "user_id,article_id" },
  );
}
