"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/tiptap/render";

export interface TaxonomyActionResult {
  error?: string;
}

const nameSchema = z.string().trim().min(2).max(60);

export async function createCategoryAction(
  _prev: TaxonomyActionResult,
  formData: FormData,
): Promise<TaxonomyActionResult> {
  const parsed = nameSchema.safeParse(formData.get("name"));
  if (!parsed.success) return { error: "Enter a valid category name" };

  const supabase = await createClient();
  const { error } = await supabase.from("categories").insert({
    name: parsed.data,
    slug: slugify(parsed.data),
    parent_id: (formData.get("parentId") as string) || null,
  });

  if (error) return { error: error.message };
  revalidatePath("/studio/categories");
  return {};
}

export async function deleteCategoryAction(categoryId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("categories").delete().eq("id", categoryId);
  revalidatePath("/studio/categories");
}

export async function createTagAction(
  _prev: TaxonomyActionResult,
  formData: FormData,
): Promise<TaxonomyActionResult> {
  const parsed = nameSchema.safeParse(formData.get("name"));
  if (!parsed.success) return { error: "Enter a valid tag name" };

  const supabase = await createClient();
  const { error } = await supabase.from("tags").insert({
    name: parsed.data,
    slug: slugify(parsed.data),
  });

  if (error) return { error: error.message };
  revalidatePath("/studio/tags");
  return {};
}

export async function deleteTagAction(tagId: string): Promise<void> {
  const supabase = await createClient();
  await supabase.from("tags").delete().eq("id", tagId);
  revalidatePath("/studio/tags");
}
