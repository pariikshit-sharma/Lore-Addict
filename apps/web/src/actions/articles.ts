"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  renderArticleHtml,
  estimateReadingTimeMinutes,
  slugify,
} from "@/lib/tiptap/render";
import {
  saveArticleSchema,
  scheduleArticleSchema,
} from "@/lib/validations/article";

export interface ArticleActionResult {
  error?: string;
  fieldErrors?: Record<string, string>;
}

/**
 * Creates a minimal draft and sends the author straight into the editor.
 * Deliberately minimal — title/content are filled in immediately after via
 * autosave, so this never blocks on validation the way a full save does.
 */
export async function createDraftAction(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const placeholderTitle = "Untitled draft";
  const slug = `${slugify(placeholderTitle)}-${Date.now().toString(36)}`;

  const { data, error } = await supabase
    .from("articles")
    .insert({
      slug,
      title: placeholderTitle,
      content_json: { type: "doc", content: [] },
      content_html: "",
      primary_author_id: user.id,
      status: "draft",
    })
    .select("id")
    .single();

  if (error || !data) {
    redirect("/studio/articles?error=create_failed");
  }

  redirect(`/studio/articles/${data.id}/edit`);
}

/**
 * Fired by the editor's debounced autosave (~4s of inactivity) — writes
 * only to article_revisions, never to the live `articles` row. This is
 * what protects the published/last-explicitly-saved version from a
 * mid-edit crash or a bad keystroke, per the CMS Architecture section.
 */
export async function autosaveRevisionAction(
  articleId: string,
  contentJson: Record<string, unknown>,
): Promise<{ ok: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { error } = await supabase.from("article_revisions").insert({
    article_id: articleId,
    content_json: contentJson,
    edited_by: user.id,
  });

  return { ok: !error };
}

/**
 * The single place that writes form fields to the `articles` row.
 * saveArticleAction, publishArticleAction, and scheduleArticleAction all
 * call this before doing their status-specific work — this is the fix for
 * the root cause bug: publishArticleAction and scheduleArticleAction used
 * to take only an articleId and never read FormData at all, because the
 * Publish/Schedule buttons submit via a `formAction` override that
 * bypasses the form's main `saveArticleAction` binding entirely. Whatever
 * the editor's fields contained was silently discarded, and only the
 * status column changed. Every path that changes status now goes through
 * this first, so "Publish" always means "save, then publish," never
 * "publish whatever was last explicitly saved."
 */
async function persistArticleFields(
  articleId: string,
  formData: FormData,
): Promise<
  | { error: string; fieldErrors?: undefined; slug?: undefined }
  | { fieldErrors: Record<string, string>; error?: undefined; slug?: undefined }
  | { slug: string; error?: undefined; fieldErrors?: undefined }
> {
  const raw = {
    title: formData.get("title"),
    subtitle: formData.get("subtitle") ?? "",
    excerpt: formData.get("excerpt") ?? "",
    contentJson: formData.get("contentJson"),
    type: formData.get("type"),
    categoryId: formData.get("categoryId") ?? "",
    tagIds: formData.getAll("tagIds"),
    coverImageUrl: formData.get("coverImageUrl") ?? "",
    coverImageAlt: formData.get("coverImageAlt") ?? "",
    containsSpoilers: formData.get("containsSpoilers") === "on",
    spoilerScope: formData.get("spoilerScope") ?? "",
    seoTitle: formData.get("seoTitle") ?? "",
    seoDescription: formData.get("seoDescription") ?? "",
  };

  const parsed = saveArticleSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { fieldErrors };
  }

  let contentJson: Record<string, unknown>;
  try {
    contentJson = JSON.parse(parsed.data.contentJson) as Record<string, unknown>;
  } catch {
    // A malformed/empty contentJson hidden-input value (e.g. the editor
    // never mounted, or its onChange never fired before submit) must be a
    // hard error here, not silently written as an empty document — that
    // silent-empty-write is exactly how "Untitled draft" reached the
    // database in the first place.
    return { fieldErrors: { contentJson: "Article content failed to load — try reopening the editor." } };
  }

  const contentHtml = renderArticleHtml(contentJson);
  const readingTime = estimateReadingTimeMinutes(contentJson);

  const supabase = await createClient();

  // Slugs are permanent once published (see ARCHITECTURE.md's Route Map),
  // but a still-draft article's slug is just createDraftAction's
  // throwaway "untitled-draft-<timestamp>" — regenerate it from the real
  // title on every save while unpublished, so it's actually readable by
  // the time it goes live. Never runs for a published/scheduled article.
  const { data: currentArticle } = await supabase
    .from("articles")
    .select("status, slug")
    .eq("id", articleId)
    .single();

  let nextSlug = currentArticle?.slug;
  if (currentArticle?.status === "draft") {
    const candidate = slugify(parsed.data.title);
    const { data: collision } = await supabase
      .from("articles")
      .select("id")
      .eq("slug", candidate)
      .neq("id", articleId)
      .maybeSingle();
    nextSlug = collision ? `${candidate}-${articleId.slice(0, 6)}` : candidate;
  }

  const { error: updateError } = await supabase
    .from("articles")
    .update({
      title: parsed.data.title,
      slug: nextSlug,
      subtitle: parsed.data.subtitle || null,
      excerpt: parsed.data.excerpt || contentHtml.replace(/<[^>]+>/g, "").slice(0, 200),
      content_json: contentJson,
      content_html: contentHtml,
      type: parsed.data.type,
      category_id: parsed.data.categoryId || null,
      cover_image_url: parsed.data.coverImageUrl || null,
      cover_image_alt: parsed.data.coverImageAlt || null,
      contains_spoilers: parsed.data.containsSpoilers,
      spoiler_scope: parsed.data.containsSpoilers ? parsed.data.spoilerScope : null,
      reading_time_minutes: readingTime,
      seo_title: parsed.data.seoTitle || null,
      seo_description: parsed.data.seoDescription || null,
    })
    .eq("id", articleId);

  if (updateError) {
    return { error: updateError.message };
  }

  // Tags: replace the full set on every save rather than diffing — the
  // set is capped at 8, so a delete-then-insert is simpler and cheap.
  await supabase.from("article_tags").delete().eq("article_id", articleId);
  if (parsed.data.tagIds.length > 0) {
    await supabase.from("article_tags").insert(
      parsed.data.tagIds.map((tagId) => ({ article_id: articleId, tag_id: tagId })),
    );
  }

  return { slug: nextSlug ?? parsed.data.title };
}

/**
 * The explicit "Save" action — re-renders HTML server-side on every save
 * so the public page never runs the rich-text renderer.
 */
export async function saveArticleAction(
  articleId: string,
  _prev: ArticleActionResult,
  formData: FormData,
): Promise<ArticleActionResult> {
  const result = await persistArticleFields(articleId, formData);
  if (result.error) return { error: result.error };
  if (result.fieldErrors) return { fieldErrors: result.fieldErrors };

  revalidatePath(`/studio/articles/${articleId}/edit`);
  return {};
}

async function requestRevalidation(slug: string): Promise<void> {
  await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-revalidate-secret": process.env.REVALIDATE_SECRET ?? "",
    },
    body: JSON.stringify({ paths: [`/article/${slug}`, "/", "/trending"] }),
  }).catch(() => {
    // Best-effort: ISR's normal timed regeneration is the fallback if the
    // immediate revalidation call fails for any reason.
  });
}

export async function publishArticleAction(
  articleId: string,
  _prev: ArticleActionResult,
  formData: FormData,
): Promise<ArticleActionResult> {
  const saveResult = await persistArticleFields(articleId, formData);
  if (saveResult.error) return { error: saveResult.error };
  if (saveResult.fieldErrors) return { fieldErrors: saveResult.fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase
    .from("articles")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", articleId);

  if (error) return { error: error.message };

  if (!saveResult.slug) {
    return { error: "Article was saved but its slug could not be determined." };
  }

  // Immediate refresh, distinct from the pg_cron job in
  // 0003_scheduled_refresh.sql which is the every-5-minutes fallback —
  // see 0006_publish_refresh.sql for why this is an RPC call and not a
  // database trigger.
  await supabase.rpc("refresh_article_feed");
  await requestRevalidation(saveResult.slug);

  redirect("/studio/articles");
}

export async function scheduleArticleAction(
  articleId: string,
  _prev: ArticleActionResult,
  formData: FormData,
): Promise<ArticleActionResult> {
  const parsedSchedule = scheduleArticleSchema.safeParse({
    scheduledFor: formData.get("scheduledFor"),
  });
  if (!parsedSchedule.success) {
    return { error: parsedSchedule.error.issues[0]?.message ?? "Choose a valid date and time" };
  }

  const saveResult = await persistArticleFields(articleId, formData);
  if (saveResult.error) return { error: saveResult.error };
  if (saveResult.fieldErrors) return { fieldErrors: saveResult.fieldErrors };

  const supabase = await createClient();
  const { error } = await supabase
    .from("articles")
    .update({
      status: "scheduled",
      scheduled_for: parsedSchedule.data.scheduledFor,
    })
    .eq("id", articleId);

  if (error) return { error: error.message };

  revalidatePath("/studio/articles");
  redirect("/studio/articles");
}

export async function archiveArticleAction(articleId: string): Promise<void> {
  const supabase = await createClient();
  await supabase
    .from("articles")
    .update({ status: "archived", deleted_at: new Date().toISOString() })
    .eq("id", articleId);

  revalidatePath("/studio/articles");
}
