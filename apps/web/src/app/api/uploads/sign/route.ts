import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { canAccess } from "@/config/roles";
import type { UserRole } from "@lore-addict/types";

const requestSchema = z.object({
  bucket: z.enum(["covers", "inline", "avatars"]),
  fileName: z.string().min(1).max(200),
});

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { bucket, fileName } = parsed.data;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = (profile?.role ?? "user") as UserRole;

  // Avatars: any authenticated user may upload their own. Covers/inline
  // images: CMS access required — matches the storage.objects RLS
  // policies in 0004_storage.sql, so a rejection here and a rejection at
  // the database layer should never disagree.
  if (bucket !== "avatars" && !canAccess(role, "ACCESS_STUDIO")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const safeName = fileName.replace(/[^a-zA-Z0-9.\-_]/g, "");
  const path = `${user.id}/${Date.now()}-${safeName}`;

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUploadUrl(path);

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to sign upload" },
      { status: 500 },
    );
  }

  const { data: publicUrlData } = supabase.storage
    .from(bucket)
    .getPublicUrl(path);

  return NextResponse.json({
    signedUrl: data.signedUrl,
    token: data.token,
    path: data.path,
    publicUrl: publicUrlData.publicUrl,
  });
}
