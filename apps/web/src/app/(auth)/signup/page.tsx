import Link from "next/link";
import type { Metadata } from "next";
import { SignupForm } from "@/components/auth/signup-form";
import { OAuthButtons } from "@/components/auth/oauth-buttons";

export const metadata: Metadata = { title: "Create account" };

export default function SignupPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-lg font-medium text-paper">
        Join Lore Addict
      </h1>
      <SignupForm />
      <div className="flex items-center gap-3 text-xs text-mute">
        <span className="h-px flex-1 bg-plum-deep" />
        or
        <span className="h-px flex-1 bg-plum-deep" />
      </div>
      <OAuthButtons />
      <p className="text-sm text-mute">
        Already have an account?{" "}
        <Link href="/login" className="text-plum-bright hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
