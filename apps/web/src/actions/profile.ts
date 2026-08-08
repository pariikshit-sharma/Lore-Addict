"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export interface ProfileActionResult {
  error?: string;
  fieldErrors?: Record<string, string>;
}

const updateProfileSchema = z.object({
  displayName: z.string().trim().min(2, "Name must be at least 2 characters").max(60),
  bio: z.string().trim().max(280, "Bio must be under 280 characters").optional().or(z.literal("")),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export async function updateProfileAction(
  _prev: ProfileActionResult,
  formData: FormData,
): Promise<ProfileActionResult> {
  const parsed = updateProfileSchema.safeParse({
    displayName: formData.get("displayName"),
    bio: formData.get("bio") ?? "",
    avatarUrl: formData.get("avatarUrl") ?? "",
  });

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { fieldErrors };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be signed in." };

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      bio: parsed.data.bio || null,
      avatar_url: parsed.data.avatarUrl || null,
    })
    .eq("id", user.id);

  if (error) return { error: error.message };

  revalidatePath("/settings");
  return {};
}
