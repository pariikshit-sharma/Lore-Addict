"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createCommentSchema } from "@/lib/validations/comment";
import type { CommentStatus } from "@lore-addict/types";

const TRUST_ACCOUNT_AGE_DAYS = 7;
const TRUST_COMMENT_COUNT = 3;

export interface CommentActionResult {
  error?: string;
}

/**
 * New or low-activity accounts land in the moderation queue; established
 * ones post immediately. Matches the trust-threshold rule from the CMS
 * Architecture section — this is the one place that rule is implemented,
 * so moderateCommentAction (Milestone 5) and this only ever need to agree
 * on what `status` means, not re-derive the threshold.
 */
async function resolveInitialStatus(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
): Promise<CommentStatus> {
  const { data: profile } = await supabase
    .from("profiles")
    .select("created_at")
    .eq("id", userId)
    .single();

  const accountAgeDays = profile
    ? (Date.now() - new Date(profile.created_at).getTime()) / 86_400_000
    : 0;

  if (accountAgeDays >= TRUST_ACCOUNT_AGE_DAYS) return "visible";

  const { count } = await supabase
    .from("comments")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("status", "visible");

  return (count ?? 0) >= TRUST_COMMENT_COUNT ? "visible" : "pending";
}

export async function createCommentAction(
  articleSlug: string,
  _prev: CommentActionResult,
  formData: FormData,
): Promise<CommentActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?redirectTo=/article/${articleSlug}`);

  const parsed = createCommentSchema.safeParse({
    articleId: formData.get("articleId"),
    parentId: formData.get("parentId") ?? "",
    body: formData.get("body"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid comment" };
  }

  const status = await resolveInitialStatus(supabase, user.id);

  const { error } = await supabase.from("comments").insert({
    article_id: parsed.data.articleId,
    user_id: user.id,
    parent_id: parsed.data.parentId || null,
    body: parsed.data.body,
    status,
  });

  if (error) return { error: error.message };

  revalidatePath(`/article/${articleSlug}`);
  return {};
}

export async function moderateCommentAction(
  commentId: string,
  status: Extract<CommentStatus, "visible" | "removed">,
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("comments").update({ status }).eq("id", commentId);
  revalidatePath("/studio/comments");
}
