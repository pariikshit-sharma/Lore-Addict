"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export interface AdSlotActionResult {
  error?: string;
}

const createAdSlotSchema = z.object({
  name: z.string().trim().min(2).max(60),
  provider: z.enum(["adsense", "direct"]),
});

export async function createAdSlotAction(
  _prev: AdSlotActionResult,
  formData: FormData,
): Promise<AdSlotActionResult> {
  const parsed = createAdSlotSchema.safeParse({
    name: formData.get("name"),
    provider: formData.get("provider"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
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

export async function toggleAdSlotAction(slotId: string, isActive: boolean): Promise<void> {
  const supabase = await createClient();
  await supabase.from("ad_slots").update({ is_active: isActive }).eq("id", slotId);
  revalidatePath("/studio/settings");
}
