"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { UserRole } from "@lore-addict/types";

export interface AdminActionResult {
  error?: string;
}

const roleSchema = z.enum(["admin", "editor", "author", "moderator", "user"]);

/**
 * The RLS policy "Admins can update any profile including role" from
 * 0001_identity.sql is what actually enforces this is admin-only — if
 * this action is somehow called by a non-admin, the update simply affects
 * zero rows rather than silently succeeding. This function doesn't
 * separately check the caller's role because that check would be
 * redundant with, and could drift from, the database policy.
 */
export async function updateUserRoleAction(
  userId: string,
  role: UserRole,
): Promise<AdminActionResult> {
  const parsed = roleSchema.safeParse(role);
  if (!parsed.success) return { error: "Invalid role" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: parsed.data })
    .eq("id", userId);

  if (error) return { error: error.message };

  revalidatePath("/studio/users");
  revalidatePath("/studio/authors");
  return {};
}

const createAdSlotSchema = z.object({
  name: z.string().trim().min(2).max(60),
  provider: z.string().trim().min(2).max(40),
});

export async function createAdSlotAction(
  _prev: AdminActionResult,
  formData: FormData,
): Promise<AdminActionResult> {
  const parsed = createAdSlotSchema.safeParse({
    name: formData.get("name"),
    provider: formData.get("provider"),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid ad slot" };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("ad_slots").insert({
    name: parsed.data.name,
    provider: parsed.data.provider,
  });

  if (error) return { error: error.message };
  revalidatePath("/studio/settings");
  return {};
}

export async function toggleAdSlotAction(
  adSlotId: string,
  isActive: boolean,
): Promise<void> {
  const supabase = await createClient();
  await supabase.from("ad_slots").update({ is_active: isActive }).eq("id", adSlotId);
  revalidatePath("/studio/settings");
}

export async function deleteAdSlotAction(adSlotId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("ad_slots").delete().eq("id", adSlotId);
  revalidatePath("/studio/settings");
}
