import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canAccess } from "@/config/roles";
import type { UserRole } from "@lore-addict/types";
import { signOutAction } from "@/actions/auth";
import { StudioNavLink } from "@/components/cms/studio-nav-link";

const NAV = [
  { href: "/studio", label: "Dashboard" },
  { href: "/studio/articles", label: "Articles" },
  { href: "/studio/media", label: "Media" },
  { href: "/studio/categories", label: "Categories" },
  { href: "/studio/tags", label: "Tags" },
  { href: "/studio/comments", label: "Comments" },
  { href: "/studio/analytics", label: "Analytics" },
] as const;

const ADMIN_NAV = [
  { href: "/studio/authors", label: "Authors" },
  { href: "/studio/users", label: "Users" },
  { href: "/studio/settings", label: "Settings" },
] as const;

export default async function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirectTo=/studio");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, display_name")
    .eq("id", user.id)
    .single();

  const role = (profile?.role ?? "user") as UserRole;

  // Second enforcement layer, same principle as everywhere else in this
  // codebase: this redirect is UX. RLS on every studio-facing table is
  // what actually stops a `user`-role account from mutating anything even
  // if they reach this layout somehow.
  if (!canAccess(role, "ACCESS_STUDIO")) {
    redirect("/");
  }

  return (
    <div className="flex min-h-dvh">
      <aside className="flex w-56 shrink-0 flex-col justify-between border-r border-plum-deep bg-ink-raised p-4">
        <div>
          <Link href="/" className="mb-8 block font-display text-lg text-paper">
            Lore Addict
          </Link>
          <nav className="flex flex-col gap-1">
            {NAV.map((item) => (
              <StudioNavLink key={item.href} href={item.href} label={item.label} />
            ))}
            {canAccess(role, "MANAGE_USERS") && (
              <>
                <p className="mt-4 px-3 text-xs uppercase tracking-wide text-mute">
                  Admin
                </p>
                {ADMIN_NAV.map((item) => (
                  <StudioNavLink key={item.href} href={item.href} label={item.label} />
                ))}
              </>
            )}
          </nav>
        </div>
        <div className="flex flex-col gap-2 border-t border-plum-deep pt-4">
          <p className="px-3 text-xs text-mute">
            {profile?.display_name} · {role}
          </p>
          <form action={signOutAction}>
            <button
              type="submit"
              className="w-full rounded-bubble px-3 py-2 text-left text-sm text-mute transition-colors duration-150 hover:bg-ink hover:text-paper"
            >
              Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
