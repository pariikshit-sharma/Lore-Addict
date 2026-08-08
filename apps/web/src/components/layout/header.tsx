import Link from "next/link";
import { Button, Avatar } from "@lore-addict/ui";
import { createClient } from "@/lib/supabase/server";
import { canAccess } from "@/config/roles";
import type { UserRole } from "@lore-addict/types";
import { MobileNav } from "./mobile-nav";
import { signOutAction } from "@/actions/auth";

const NAV_LINKS = [
  { href: "/news", label: "News" },
  { href: "/reviews", label: "Reviews" },
  { href: "/theories", label: "Theories" },
  { href: "/trending", label: "Trending" },
] as const;

interface HeaderProfile {
  display_name: string;
  avatar_url: string | null;
  role: UserRole;
}

export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: HeaderProfile | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("display_name, avatar_url, role")
      .eq("id", user.id)
      .single();
    // Cast to the named HeaderProfile type, not `typeof profile` — a type
    // query on a `let` variable captures its control-flow-narrowed type at
    // *this* program point (here, still `null`, since no reassignment has
    // happened yet), not its declared union type. That silently collapsed
    // `profile` to `null` for the rest of the function.
    profile = data as HeaderProfile | null;
  }

  return (
    <header className="sticky top-0 z-20 border-b border-plum-deep bg-ink/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="font-display text-lg font-semibold text-paper">
            Lore Addict
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-mute transition-colors hover:text-paper"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/search"
            aria-label="Search"
            className="rounded-full p-2 text-mute hover:bg-ink-raised hover:text-paper"
          >
            <SearchIcon />
          </Link>

          {user ? (
            <div className="hidden items-center gap-3 md:flex">
              {profile && canAccess(profile.role, "ACCESS_STUDIO") && (
                <Link href="/studio">
                  <Button variant="secondary" size="sm">
                    Studio
                  </Button>
                </Link>
              )}
              <Link
                href="/bookmarks"
                className="text-sm text-mute transition-colors hover:text-paper"
              >
                Bookmarks
              </Link>
              <Link href="/settings" aria-label="Account settings">
                <Avatar
                  src={profile?.avatar_url ?? null}
                  name={profile?.display_name ?? user.email ?? "Account"}
                  size={32}
                />
              </Link>
              <form action={signOutAction}>
                <Button variant="ghost" size="sm" type="submit">
                  Sign out
                </Button>
              </form>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}

          <MobileNav
            navLinks={NAV_LINKS}
            isAuthenticated={Boolean(user)}
            canAccessStudio={profile ? canAccess(profile.role, "ACCESS_STUDIO") : false}
          />
        </div>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
