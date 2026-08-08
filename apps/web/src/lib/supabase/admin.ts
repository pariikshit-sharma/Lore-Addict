import "server-only";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@lore-addict/types";

/**
 * SERVICE ROLE CLIENT — bypasses RLS entirely.
 *
 * This is the ONLY file in the codebase permitted to read
 * `SUPABASE_SERVICE_ROLE_KEY` (enforced by a CI check that greps for the
 * env var name outside this path — see .github/workflows/ci.yml once that
 * check is added in the Security hardening pass of Milestone 13).
 *
 * The `server-only` import makes it a build error to accidentally import
 * this from a Client Component or anything that could bundle to the
 * browser. Use this only for operations that genuinely cannot go through
 * RLS: the nightly analytics rollup job, the scheduled-publish cron flip,
 * and admin-only maintenance scripts. Anything reachable from a user
 * request should go through lib/supabase/server.ts instead, so RLS stays
 * the actual security boundary.
 */
export function createAdminClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
