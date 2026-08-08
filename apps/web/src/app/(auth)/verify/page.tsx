import type { Metadata } from "next";

export const metadata: Metadata = { title: "Check your email" };

export default function VerifyPage() {
  return (
    <div className="flex flex-col gap-3">
      <h1 className="font-display text-lg font-medium text-paper">
        Check your email
      </h1>
      <p className="text-sm text-mute">
        We sent a confirmation link to finish setting up your account. Click
        it to log in.
      </p>
    </div>
  );
}
