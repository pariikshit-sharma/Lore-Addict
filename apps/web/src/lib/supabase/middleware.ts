import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import type { Database } from "@lore-addict/types";

/**
 * Refreshes the Supabase session cookie on every request. This runs before
 * any Server Component, so `auth.uid()` is correct by the time route code
 * executes — without this, sessions silently expire mid-visit because
 * Server Components can't write cookies themselves (see server.ts).
 */
export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // Required: this triggers the token refresh. Do not remove even though
  // the return value isn't always used directly by the caller.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return { response, user };
}
