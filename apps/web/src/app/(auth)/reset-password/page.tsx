import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { UpdatePasswordForm } from "@/components/auth/update-password-form";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // A user lands here with an active session in exactly one case: they
  // just followed the recovery link from their email (see
  // actions/auth.ts's requestPasswordResetAction redirectTo and the
  // /auth/callback route that exchanges that code for a session). Anyone
  // else hitting this URL directly is requesting a new link.
  const isRecoverySession = Boolean(user);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-lg font-medium text-paper">
        {isRecoverySession ? "Set a new password" : "Reset your password"}
      </h1>
      {isRecoverySession ? <UpdatePasswordForm /> : <ResetPasswordForm />}
    </div>
  );
}
