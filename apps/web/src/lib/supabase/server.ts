import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { Database } from "@lore-addict/types";

/**
 * For use in Server Components, Server Actions, and Route Handlers.
 * Reads/writes the session via cookies so `auth.uid()` resolves correctly
 * inside RLS policies for the actual signed-in user — still the anon key,
 * still subject to RLS. This is NOT the admin client; see admin.ts for the
 * service-role client, which is a deliberately separate, narrowly-scoped file.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component (not a Server Action / Route
            // Handler) — cookies can't be set here. Harmless as long as
            // middleware.ts is also refreshing the session on every
            // request, which it is (see middleware.ts).
          }
        },
      },
    },
  );
}
