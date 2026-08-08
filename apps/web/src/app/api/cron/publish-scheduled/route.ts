import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Flips `scheduled` articles to `published` once their scheduled_for time
 * has passed, then refreshes article_feed and revalidates the affected
 * pages — the same two steps publishArticleAction takes for a manual
 * publish (Milestone 6/12), just triggered by time instead of a click.
 *
 * Uses the admin client deliberately: this runs with no signed-in user
 * (it's a cron job), so there's no auth.uid() for RLS's author/editor
 * policies to check against. The cron secret is what authorizes this
 * call, not a user session.
 */
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createAdminClient();

  const { data: dueArticles, error } = await supabase
    .from("articles")
    .select("id, slug")
    .eq("status", "scheduled")
    .lte("scheduled_for", new Date().toISOString());

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!dueArticles || dueArticles.length === 0) {
    return NextResponse.json({ published: 0 });
  }

  const ids = dueArticles.map((a) => a.id);
  await supabase
    .from("articles")
    .update({ status: "published", published_at: new Date().toISOString() })
    .in("id", ids);

  await supabase.rpc("refresh_article_feed");

  const paths = [
    "/",
    "/trending",
    ...dueArticles.map((a) => `/article/${a.slug}`),
  ];
  await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/revalidate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-revalidate-secret": process.env.REVALIDATE_SECRET ?? "",
    },
    body: JSON.stringify({ paths }),
  }).catch(() => {
    // Same fallback reasoning as publishArticleAction: ISR's own timed
    // revalidation is the backstop if this call fails.
  });

  return NextResponse.json({ published: dueArticles.length });
}
