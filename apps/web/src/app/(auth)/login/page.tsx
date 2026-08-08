import Link from "next/link";
import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/login-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export const metadata: Metadata = { title: "Log in" };

const ERROR_MESSAGES: Record<string, string> = {
  oauth_failed: "That sign-in attempt didn't go through. Try again, or use email.",
  auth_callback_failed: "That link has expired or was already used. Try signing in again.",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const errorMessage = error ? (ERROR_MESSAGES[error] ?? "Something went wrong. Try again.") : null;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-lg font-medium text-paper">
        Welcome back
      </h1>
      {errorMessage && (
        <p className="rounded-bubble border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger">
          {errorMessage}
        </p>
      )}
      <Suspense fallback={<div className="h-[168px]" />}>
        <LoginForm />
      </Suspense>
      <div className="flex items-center gap-3 text-xs text-mute">
        <span className="h-px flex-1 bg-plum-deep" />
        or
        <span className="h-px flex-1 bg-plum-deep" />
      </div>
      <OAuthButtons />
      <div className="flex justify-between text-sm">
        <Link href="/signup" className="text-plum-bright hover:underline">
          Create an account
        </Link>
        <Link
          href="/reset-password"
          className="text-mute hover:text-paper hover:underline"
        >
          Forgot password?
        </Link>
      </div>
    </div>
  );
}
