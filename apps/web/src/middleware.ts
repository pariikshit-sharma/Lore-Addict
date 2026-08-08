import { NextResponse, type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const PROTECTED_PREFIXES = ["/studio", "/bookmarks", "/history", "/settings"];

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  const isProtected = PROTECTED_PREFIXES.some((prefix) =>
    request.nextUrl.pathname.startsWith(prefix),
  );

  if (isProtected && !user) {
    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname);
    return NextResponse.redirect(redirectUrl);
  }

  // Already-authenticated users don't need the auth screens again.
  const isAuthRoute = ["/login", "/signup"].includes(request.nextUrl.pathname);
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on every route except static assets and image optimization
     * files — those never need a session check and skipping them keeps
     * middleware cost off the highest-volume, cacheable requests.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$).*)",
  ],
};
