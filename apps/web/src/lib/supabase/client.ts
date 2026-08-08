import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@lore-addict/types";

/**
 * For use in Client Components only. Uses the anon key, so every query
 * through this client is subject to RLS — it can never see more than the
 * signed-in user (or anonymous public policies) allow.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
