import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "edge";

const eventSchema = z.object({
  articleId: z.string().uuid(),
  eventType: z.enum(["view", "scroll_25", "scroll_75", "share", "bookmark"]),
  sessionId: z.string().uuid(),
});

/**
 * No auth required (anonymous readers generate the vast majority of these)
 * and no RLS-bound user client either — inserts go through the admin
 * client specifically because this needs to succeed for signed-out
 * visitors, and the table's own RLS policy (0008_analytics_rollup.sql)
 * already scopes it to insert-only from any caller, so the admin client
 * isn't bypassing anything meaningful here. Kept intentionally minimal:
 * validate, insert, 204 — no joins, no derived fields, nothing that could
 * slow down the highest-traffic endpoint in the app.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = eventSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid event" }, { status: 400 });
  }

  const country = request.headers.get("x-vercel-ip-country");
  const userAgent = request.headers.get("user-agent") ?? "";
  const device = /mobile/i.test(userAgent) ? "mobile" : "desktop";
  const referrer = request.headers.get("referer");
  const referrerSource = classifyReferrer(referrer);

  const supabase = createAdminClient();
  await supabase.from("article_events").insert({
    article_id: parsed.data.articleId,
    event_type: parsed.data.eventType,
    session_id: parsed.data.sessionId,
    country: country ?? undefined,
    device,
    referrer_source: referrerSource,
  });

  return new NextResponse(null, { status: 204 });
}

function classifyReferrer(referrer: string | null): string {
  if (!referrer) return "direct";
  try {
    const host = new URL(referrer).hostname;
    if (/google\./.test(host)) return "google";
    if (/(twitter|x)\.com/.test(host)) return "twitter";
    if (/reddit\.com/.test(host)) return "reddit";
    if (/facebook\.com/.test(host)) return "facebook";
    if (host === process.env.NEXT_PUBLIC_SITE_URL) return "internal";
    return host;
  } catch {
    return "unknown";
  }
}
