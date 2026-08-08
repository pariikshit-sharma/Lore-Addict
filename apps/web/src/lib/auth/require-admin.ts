import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { canAccess, PERMISSIONS } from "@/config/roles";
import type { UserRole } from "@lore-addict/types";

/**
 * The studio layout (Milestone 5) already confirms the caller can reach
 * the CMS at all — this confirms a stricter, admin-only permission for
 * the handful of pages that need one. Same "enforced twice" shape as
 * everywhere else: this redirect is UX, the RLS policies on profiles/
 * ad_slots are what actually stop a non-admin mutation.
 */
export async function requireAdmin(
  permission: keyof typeof PERMISSIONS = "MANAGE_USERS",
): Promise<{ id: string; role: UserRole }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/studio");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role ?? "user") as UserRole;
  if (!canAccess(role, permission)) redirect("/studio");

  return { id: user.id, role };
}
