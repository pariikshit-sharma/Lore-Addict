import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProfileSettingsForm } from "@/components/profile/profile-settings-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/settings");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, bio, avatar_url")
    .eq("id", user.id)
    .single();

  if (!profile) redirect("/login?redirectTo=/settings");

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6 px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="font-display text-2xl font-medium text-paper">
        Account settings
      </h1>
      <ProfileSettingsForm profile={profile} />
    </div>
  );
}
