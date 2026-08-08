"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@lore-addict/types";

const VALID_ROLES: UserRole[] = ["user", "moderator", "author", "editor", "admin"];

export async function updateUserRoleAction(
  targetUserId: string,
  role: UserRole,
): Promise<{ error?: string }> {
  if (!VALID_ROLES.includes(role)) {
    return { error: "Invalid role" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Extra guard beyond RLS: an admin should never be able to demote
  // themselves through this exact action and get locked out of the page
  // that would let them undo it. RLS's "Admins can update any profile"
  // policy would technically allow it — this is a UX safety rail on top.
  if (user?.id === targetUserId) {
    return { error: "You can't change your own role here." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", targetUserId);

  if (error) return { error: error.message };

  revalidatePath("/studio/users");
  revalidatePath("/studio/authors");
  return {};
}
