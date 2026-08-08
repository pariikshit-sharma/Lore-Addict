import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@lore-addict/types";

/**
 * For build-time functions only: generateStaticParams, generateSitemaps,
 * and anything else Next.js invokes outside a request context. Unlike
 * lib/supabase/server.ts, this never touches cookies() — which is exactly
 * the point, since cookies() throws when called outside a request scope
 * (the actual error this file fixes: "cookies was called outside a
 * request scope" during static generation).
 *
 * Safe to use only where every query is already scoped to public,
 * RLS-readable data (published articles, categories, tags) — this client
 * has no session, so it's equivalent to an anonymous visitor. Never use
 * this where a result should vary per signed-in user.
 */
export function createStaticClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
